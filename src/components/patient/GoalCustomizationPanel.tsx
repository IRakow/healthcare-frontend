import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Target,
  Plus,
  X,
  Edit2,
  Save,
  Trophy,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Repeat,
  Heart,
  Activity,
  Weight,
  Dumbbell,
  Apple,
  Moon,
  Brain,
  Pill
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Goal {
  id: string;
  title: string;
  description?: string;
  category: 'fitness' | 'nutrition' | 'sleep' | 'mental' | 'medication' | 'custom';
  target_value: number;
  current_value: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  start_date: string;
  end_date?: string;
  status: 'active' | 'completed' | 'paused';
  reminder_enabled: boolean;
  reminder_time?: string;
  created_at: string;
  updated_at: string;
  progress_entries?: GoalProgress[];
}

interface GoalProgress {
  id: string;
  goal_id: string;
  value: number;
  notes?: string;
  recorded_at: string;
}

interface GoalTemplate {
  title: string;
  category: Goal['category'];
  unit: string;
  suggested_target: number;
  icon: React.ReactNode;
  color: string;
}

const goalTemplates: GoalTemplate[] = [
  {
    title: 'Daily Steps',
    category: 'fitness',
    unit: 'steps',
    suggested_target: 10000,
    icon: <Activity className="w-5 h-5" />,
    color: 'bg-blue-500'
  },
  {
    title: 'Weight Goal',
    category: 'fitness',
    unit: 'lbs',
    suggested_target: 150,
    icon: <Weight className="w-5 h-5" />,
    color: 'bg-green-500'
  },
  {
    title: 'Exercise Minutes',
    category: 'fitness',
    unit: 'minutes',
    suggested_target: 30,
    icon: <Dumbbell className="w-5 h-5" />,
    color: 'bg-orange-500'
  },
  {
    title: 'Water Intake',
    category: 'nutrition',
    unit: 'glasses',
    suggested_target: 8,
    icon: <Apple className="w-5 h-5" />,
    color: 'bg-cyan-500'
  },
  {
    title: 'Sleep Hours',
    category: 'sleep',
    unit: 'hours',
    suggested_target: 8,
    icon: <Moon className="w-5 h-5" />,
    color: 'bg-purple-500'
  },
  {
    title: 'Meditation',
    category: 'mental',
    unit: 'minutes',
    suggested_target: 15,
    icon: <Brain className="w-5 h-5" />,
    color: 'bg-pink-500'
  },
  {
    title: 'Medication Adherence',
    category: 'medication',
    unit: '%',
    suggested_target: 100,
    icon: <Pill className="w-5 h-5" />,
    color: 'bg-red-500'
  }
];

export const GoalCustomizationPanel: React.FC = () => {
  const { userId } = useUser();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'fitness' as Goal['category'],
    target_value: 0,
    unit: '',
    frequency: 'daily' as Goal['frequency'],
    end_date: '',
    reminder_enabled: false,
    reminder_time: '09:00'
  });

  useEffect(() => {
    if (userId) {
      loadGoals();
      subscribeToGoalUpdates();
    }
  }, [userId]);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('health_goals')
        .select(`
          *,
          progress_entries:goal_progress(
            id,
            value,
            notes,
            recorded_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGoals(data || []);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToGoalUpdates = () => {
    const channel = supabase
      .channel(`goals:${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'health_goals',
          filter: `user_id=eq.${userId}`
        }, 
        () => {
          loadGoals();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const createGoal = async () => {
    if (!formData.title || !formData.target_value) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const newGoal = {
        user_id: userId,
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        target_value: formData.target_value,
        current_value: 0,
        unit: formData.unit,
        frequency: formData.frequency,
        start_date: new Date().toISOString(),
        end_date: formData.end_date || null,
        status: 'active' as const,
        reminder_enabled: formData.reminder_enabled,
        reminder_time: formData.reminder_enabled ? formData.reminder_time : null
      };

      const { data, error } = await supabase
        .from('health_goals')
        .insert(newGoal)
        .select()
        .single();

      if (error) throw error;

      // Add to timeline
      await supabase.from('patient_timeline').insert({
        patient_id: userId,
        type: 'goal',
        title: 'New Goal Created',
        content: `Set goal: ${formData.title} - ${formData.target_value} ${formData.unit} ${formData.frequency}`,
        timestamp: new Date().toISOString(),
        importance: 'medium'
      });

      setGoals([data, ...goals]);
      setShowNewGoal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create goal:', error);
      alert('Failed to create goal. Please try again.');
    }
  };

  const updateGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('health_goals')
        .update({
          title: formData.title,
          description: formData.description,
          target_value: formData.target_value,
          end_date: formData.end_date || null,
          reminder_enabled: formData.reminder_enabled,
          reminder_time: formData.reminder_enabled ? formData.reminder_time : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId);

      if (error) throw error;

      await loadGoals();
      setEditingGoal(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update goal:', error);
      alert('Failed to update goal. Please try again.');
    }
  };

  const updateGoalStatus = async (goalId: string, status: Goal['status']) => {
    try {
      const { error } = await supabase
        .from('health_goals')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.map(g => g.id === goalId ? { ...g, status } : g));
    } catch (error) {
      console.error('Failed to update goal status:', error);
    }
  };

  const recordProgress = async (goalId: string, value: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      // Record progress entry
      const { error: progressError } = await supabase
        .from('goal_progress')
        .insert({
          goal_id: goalId,
          user_id: userId,
          value,
          recorded_at: new Date().toISOString()
        });

      if (progressError) throw progressError;

      // Update current value
      const newCurrentValue = goal.frequency === 'daily' ? value : goal.current_value + value;
      const { error: updateError } = await supabase
        .from('health_goals')
        .update({ 
          current_value: newCurrentValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId);

      if (updateError) throw updateError;

      // Check if goal is completed
      if (newCurrentValue >= goal.target_value) {
        await updateGoalStatus(goalId, 'completed');
        
        // Add achievement to timeline
        await supabase.from('patient_timeline').insert({
          patient_id: userId,
          type: 'achievement',
          title: 'Goal Achieved!',
          content: `Completed goal: ${goal.title}`,
          timestamp: new Date().toISOString(),
          importance: 'high'
        });
      }

      await loadGoals();
    } catch (error) {
      console.error('Failed to record progress:', error);
      alert('Failed to record progress. Please try again.');
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const { error } = await supabase
        .from('health_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.filter(g => g.id !== goalId));
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('Failed to delete goal. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'fitness',
      target_value: 0,
      unit: '',
      frequency: 'daily',
      end_date: '',
      reminder_enabled: false,
      reminder_time: '09:00'
    });
    setSelectedTemplate(null);
  };

  const selectTemplate = (template: GoalTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      title: template.title,
      category: template.category,
      target_value: template.suggested_target,
      unit: template.unit
    });
  };

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'fitness': return <Dumbbell className="w-4 h-4" />;
      case 'nutrition': return <Apple className="w-4 h-4" />;
      case 'sleep': return <Moon className="w-4 h-4" />;
      case 'mental': return <Brain className="w-4 h-4" />;
      case 'medication': return <Pill className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Health Goals
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Set and track your personal health goals
          </p>
        </div>
        <Button onClick={() => setShowNewGoal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* New Goal Form */}
      <AnimatePresence>
        {showNewGoal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 space-y-4">
              <h4 className="font-medium">Create New Goal</h4>

              {/* Templates */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Choose a template or create custom goal</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {goalTemplates.map((template, i) => (
                    <Button
                      key={i}
                      variant={selectedTemplate?.title === template.title ? 'default' : 'outline'}
                      size="sm"
                      className="justify-start"
                      onClick={() => selectTemplate(template)}
                    >
                      {template.icon}
                      <span className="ml-2 text-xs">{template.title}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Goal Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Daily Steps"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Goal['category'] })}
                  >
                    <option value="fitness">Fitness</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="sleep">Sleep</option>
                    <option value="mental">Mental Health</option>
                    <option value="medication">Medication</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description (optional)</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add more details about your goal..."
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Target Value</label>
                  <Input
                    type="number"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Unit</label>
                  <Input
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., steps, lbs, minutes"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Frequency</label>
                  <select
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Goal['frequency'] })}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">End Date (optional)</label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      checked={formData.reminder_enabled}
                      onChange={(e) => setFormData({ ...formData, reminder_enabled: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Enable daily reminder</span>
                  </label>
                  {formData.reminder_enabled && (
                    <Input
                      type="time"
                      value={formData.reminder_time}
                      onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
                      className="mt-2"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setShowNewGoal(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={createGoal}>
                  <Save className="w-4 h-4 mr-2" />
                  Create Goal
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card className="p-8 text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-muted-foreground">No goals yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first health goal to start tracking progress
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => {
            const progress = getProgressPercentage(goal);
            const isEditing = editingGoal === goal.id;
            
            return (
              <Card key={goal.id} className="p-4">
                {isEditing ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Goal title"
                      />
                      <Input
                        type="number"
                        value={formData.target_value}
                        onChange={(e) => setFormData({ ...formData, target_value: Number(e.target.value) })}
                        placeholder="Target value"
                      />
                    </div>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setEditingGoal(null);
                        resetForm();
                      }}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => updateGoal(goal.id)}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          goal.category === 'fitness' ? 'bg-blue-100 text-blue-600' :
                          goal.category === 'nutrition' ? 'bg-green-100 text-green-600' :
                          goal.category === 'sleep' ? 'bg-purple-100 text-purple-600' :
                          goal.category === 'mental' ? 'bg-pink-100 text-pink-600' :
                          goal.category === 'medication' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getCategoryIcon(goal.category)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{goal.title}</h4>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {goal.frequency}
                            </span>
                            {goal.end_date && (
                              <span>
                                Ends {new Date(goal.end_date).toLocaleDateString()}
                              </span>
                            )}
                            {goal.reminder_enabled && (
                              <span className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Reminder at {goal.reminder_time}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          goal.status === 'completed' ? 'default' :
                          goal.status === 'active' ? 'secondary' :
                          'outline'
                        }>
                          {goal.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingGoal(goal.id);
                            setFormData({
                              title: goal.title,
                              description: goal.description || '',
                              category: goal.category,
                              target_value: goal.target_value,
                              unit: goal.unit,
                              frequency: goal.frequency,
                              end_date: goal.end_date || '',
                              reminder_enabled: goal.reminder_enabled,
                              reminder_time: goal.reminder_time || '09:00'
                            });
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {goal.current_value} / {goal.target_value} {goal.unit}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {progress.toFixed(0)}% complete
                        </span>
                        {goal.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const value = prompt(`Enter progress value (${goal.unit}):`);
                              if (value) {
                                recordProgress(goal.id, Number(value));
                              }
                            }}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Record Progress
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    {goal.status === 'active' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateGoalStatus(goal.id, 'paused')}
                        >
                          Pause Goal
                        </Button>
                        {progress >= 100 && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => updateGoalStatus(goal.id, 'completed')}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {goal.status === 'paused' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateGoalStatus(goal.id, 'active')}
                      >
                        <Repeat className="w-3 h-3 mr-1" />
                        Resume Goal
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Achievement Summary */}
      {goals.filter(g => g.status === 'completed').length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Achievements
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                You've completed {goals.filter(g => g.status === 'completed').length} goals!
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      )}
    </motion.div>
  );
};