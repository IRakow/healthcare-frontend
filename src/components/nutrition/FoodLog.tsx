import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Calendar, Plus, Camera, Utensils } from 'lucide-react';
import Spinner from '@/components/ui/spinner';

interface FoodLogEntry {
  id: string;
  user_id: string;
  image_url?: string;
  entry_text: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  logged_for_date: string;
  created_at: string;
}

export function FoodLog() {
  const [logs, setLogs] = useState<FoodLogEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    entry_text: '',
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0
  });

  useEffect(() => {
    loadFoodLogs();
  }, [selectedDate]);

  async function loadFoodLogs() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('logged_for_date', selectedDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading food logs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddEntry() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('food_logs')
        .insert({
          user_id: user.id,
          ...newEntry,
          logged_for_date: selectedDate
        });

      if (error) throw error;

      // Reset form and reload
      setNewEntry({
        entry_text: '',
        protein: 0,
        carbs: 0,
        fat: 0,
        calories: 0
      });
      setShowAddForm(false);
      await loadFoodLogs();
    } catch (error) {
      console.error('Error adding food entry:', error);
      alert('Failed to add food entry');
    }
  }

  // Calculate daily totals
  const dailyTotals = logs.reduce((totals, log) => ({
    protein: totals.protein + log.protein,
    carbs: totals.carbs + log.carbs,
    fat: totals.fat + log.fat,
    calories: totals.calories + log.calories
  }), { protein: 0, carbs: 0, fat: 0, calories: 0 });

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          />
        </div>
        <Button onClick={() => setShowAddForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Food
        </Button>
      </div>

      {/* Daily Summary */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-3">Daily Totals</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{dailyTotals.calories}</p>
            <p className="text-xs text-gray-600">Calories</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{dailyTotals.protein}g</p>
            <p className="text-xs text-gray-600">Protein</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">{dailyTotals.carbs}g</p>
            <p className="text-xs text-gray-600">Carbs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{dailyTotals.fat}g</p>
            <p className="text-xs text-gray-600">Fat</p>
          </div>
        </div>
      </Card>

      {/* Add Food Form */}
      {showAddForm && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Add Food Entry</h3>
          <div className="space-y-3">
            <Input
              placeholder="What did you eat?"
              value={newEntry.entry_text}
              onChange={(e) => setNewEntry({ ...newEntry, entry_text: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Calories"
                value={newEntry.calories || ''}
                onChange={(e) => setNewEntry({ ...newEntry, calories: parseInt(e.target.value) || 0 })}
              />
              <Input
                type="number"
                placeholder="Protein (g)"
                value={newEntry.protein || ''}
                onChange={(e) => setNewEntry({ ...newEntry, protein: parseInt(e.target.value) || 0 })}
              />
              <Input
                type="number"
                placeholder="Carbs (g)"
                value={newEntry.carbs || ''}
                onChange={(e) => setNewEntry({ ...newEntry, carbs: parseInt(e.target.value) || 0 })}
              />
              <Input
                type="number"
                placeholder="Fat (g)"
                value={newEntry.fat || ''}
                onChange={(e) => setNewEntry({ ...newEntry, fat: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddEntry} disabled={!newEntry.entry_text}>
                Save Entry
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Food Entries */}
      <div className="space-y-3">
        {logs.length === 0 ? (
          <Card className="p-8 text-center">
            <Utensils className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No food logged for this day</p>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{log.entry_text}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(log.created_at), 'h:mm a')}
                  </p>
                </div>
                {log.image_url && (
                  <img 
                    src={log.image_url} 
                    alt={log.entry_text}
                    className="w-16 h-16 rounded object-cover ml-3"
                  />
                )}
              </div>
              <div className="flex gap-4 mt-3 text-sm">
                <span className="text-blue-600">{log.calories} cal</span>
                <span className="text-green-600">{log.protein}g protein</span>
                <span className="text-yellow-600">{log.carbs}g carbs</span>
                <span className="text-red-600">{log.fat}g fat</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Simple food entry component for quick logging
export function QuickFoodEntry() {
  const [entry, setEntry] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleQuickAdd() {
    if (!entry.trim()) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('food_logs')
        .insert({
          user_id: user.id,
          entry_text: entry,
          logged_for_date: new Date().toISOString().split('T')[0],
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        });

      if (error) throw error;
      setEntry('');
      alert('Food logged! You can add nutrition details later.');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to log food');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Quick food entry (e.g., 'Chicken salad')"
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleQuickAdd()}
      />
      <Button onClick={handleQuickAdd} disabled={!entry.trim() || saving}>
        {saving ? <Spinner size="sm" /> : 'Log'}
      </Button>
    </div>
  );
}