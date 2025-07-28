import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Apple,
  Beef,
  Wheat,
  Droplets,
  Target,
  Calendar,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';

interface MacroData {
  target: number;
  consumed: number;
  label: string;
  color: string;
  icon: React.ReactNode;
  unit: string;
}

interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number;
}

const defaultGoals: MacroGoals = {
  calories: 2000,
  protein: 100,
  carbs: 250,
  fats: 70,
  water: 8 // glasses
};

export const MacroProgressDashboard: React.FC = () => {
  const { userId } = useUser();
  const [macros, setMacros] = useState<MacroData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [goals, setGoals] = useState<MacroGoals>(defaultGoals);
  const [weeklyAverage, setWeeklyAverage] = useState<any>(null);

  useEffect(() => {
    if (userId) {
      loadMacroData();
      loadUserGoals();
      loadWeeklyAverage();
    }
  }, [userId, selectedDate]);

  const loadUserGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('macro_goals')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        setGoals(data);
      }
    } catch (error) {
      console.error('Failed to load macro goals:', error);
    }
  };

  const loadMacroData = async () => {
    setLoading(true);
    try {
      // Fetch today's food logs
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: foodLogs, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', startOfDay.toISOString())
        .lte('logged_at', endOfDay.toISOString());

      if (error) throw error;

      // Calculate totals
      const totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        water: 0
      };

      (foodLogs || []).forEach(log => {
        if (log.nutrition_data) {
          totals.calories += log.nutrition_data.calories || 0;
          totals.protein += log.nutrition_data.protein || 0;
          totals.carbs += log.nutrition_data.carbs || 0;
          totals.fats += log.nutrition_data.fats || 0;
        }
        if (log.type === 'water') {
          totals.water += log.amount || 0;
        }
      });

      // Format macro data
      const macroData: MacroData[] = [
        { 
          label: 'Calories', 
          consumed: Math.round(totals.calories), 
          target: goals.calories, 
          color: 'bg-blue-500',
          icon: <Target className="w-4 h-4" />,
          unit: 'kcal'
        },
        { 
          label: 'Protein', 
          consumed: Math.round(totals.protein), 
          target: goals.protein, 
          color: 'bg-green-500',
          icon: <Beef className="w-4 h-4" />,
          unit: 'g'
        },
        { 
          label: 'Carbs', 
          consumed: Math.round(totals.carbs), 
          target: goals.carbs, 
          color: 'bg-yellow-500',
          icon: <Wheat className="w-4 h-4" />,
          unit: 'g'
        },
        { 
          label: 'Fat', 
          consumed: Math.round(totals.fats), 
          target: goals.fats, 
          color: 'bg-red-500',
          icon: <Apple className="w-4 h-4" />,
          unit: 'g'
        },
        { 
          label: 'Water', 
          consumed: totals.water, 
          target: goals.water, 
          color: 'bg-cyan-500',
          icon: <Droplets className="w-4 h-4" />,
          unit: 'glasses'
        }
      ];

      setMacros(macroData);
    } catch (error) {
      console.error('Failed to load macro data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyAverage = async () => {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: weeklyLogs, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', weekAgo.toISOString());

      if (error) throw error;

      // Calculate weekly averages
      const totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        days: 7
      };

      (weeklyLogs || []).forEach(log => {
        if (log.nutrition_data) {
          totals.calories += log.nutrition_data.calories || 0;
          totals.protein += log.nutrition_data.protein || 0;
          totals.carbs += log.nutrition_data.carbs || 0;
          totals.fats += log.nutrition_data.fats || 0;
        }
      });

      setWeeklyAverage({
        calories: Math.round(totals.calories / totals.days),
        protein: Math.round(totals.protein / totals.days),
        carbs: Math.round(totals.carbs / totals.days),
        fats: Math.round(totals.fats / totals.days)
      });
    } catch (error) {
      console.error('Failed to load weekly average:', error);
    }
  };

  const getProgressColor = (consumed: number, target: number) => {
    const percentage = (consumed / target) * 100;
    if (percentage < 80) return 'text-orange-600';
    if (percentage > 120) return 'text-red-600';
    return 'text-green-600';
  };

  const getTrend = (current: number, average: number) => {
    if (!average) return <Minus className="w-4 h-4 text-gray-400" />;
    const diff = ((current - average) / average) * 100;
    
    if (Math.abs(diff) < 5) return <Minus className="w-4 h-4 text-gray-400" />;
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Daily Macro Tracker</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <BarChart3 className="w-4 h-4" />
          </Button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="text-sm border rounded-lg px-3 py-1"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-8 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {macros.map((macro, i) => {
              const percentage = Math.min((macro.consumed / macro.target) * 100, 100);
              const isOverTarget = macro.consumed > macro.target;
              
              return (
                <Card key={i} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${macro.color.replace('bg-', 'bg-opacity-20 ')} ${macro.color.replace('bg-', 'text-')}`}>
                        {macro.icon}
                      </div>
                      <span className="font-medium text-sm">{macro.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {weeklyAverage && getTrend(
                        macro.consumed, 
                        weeklyAverage[macro.label.toLowerCase()]
                      )}
                      <span className={`text-sm font-medium ${getProgressColor(macro.consumed, macro.target)}`}>
                        {macro.consumed} / {macro.target} {macro.unit}
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Progress 
                      value={percentage} 
                      className="h-2"
                      indicatorClassName={macro.color}
                    />
                    {isOverTarget && (
                      <div 
                        className={`absolute top-0 h-2 ${macro.color} opacity-50 rounded-r`}
                        style={{ 
                          left: '100%', 
                          width: `${((macro.consumed - macro.target) / macro.target) * 100}%`,
                          maxWidth: '50%'
                        }}
                      />
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {percentage.toFixed(0)}% of daily goal
                    {isOverTarget && ` (+${macro.consumed - macro.target} ${macro.unit})`}
                  </p>
                </Card>
              );
            })}
          </div>

          {weeklyAverage && (
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                7-Day Average
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Calories</p>
                  <p className="font-medium">{weeklyAverage.calories} kcal</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Protein</p>
                  <p className="font-medium">{weeklyAverage.protein}g</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Carbs</p>
                  <p className="font-medium">{weeklyAverage.carbs}g</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fats</p>
                  <p className="font-medium">{weeklyAverage.fats}g</p>
                </div>
              </div>
            </Card>
          )}

          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => alert('Opening food log...')}
            >
              Log Food
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
};