import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Camera, Upload, Utensils } from 'lucide-react';
import { format } from 'date-fns';

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

export default function NutritionLog() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [logs, setLogs] = useState<FoodLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    loadFoodLogs();
  }, []);

  useEffect(() => {
    // Create preview URL when photo is selected
    if (photo) {
      const url = URL.createObjectURL(photo);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [photo]);

  async function loadFoodLogs() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading food logs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!photo && !caption) {
      alert('Please add a photo or description');
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let publicUrl = '';
      
      // Upload photo if provided
      if (photo) {
        const fileName = `${user.id}/${Date.now()}-${photo.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('food-photos')
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        // Try to get public URL first
        const { data: { publicUrl: url } } = supabase.storage
          .from('food-photos')
          .getPublicUrl(fileName);
        
        // If bucket is private, we'll need to use signed URLs when displaying
        publicUrl = url;
      }

      // Analyze with AI if we have an image or caption
      let nutritionData = { protein: 0, carbs: 0, fat: 0, calories: 0 };
      
      if (publicUrl || caption) {
        try {
          // Get Supabase session for authenticated request
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error('No session');

          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
          const aiRes = await fetch(`${supabaseUrl}/functions/v1/ai-food-analyze`, {
            method: 'POST',
            body: JSON.stringify({ 
              image_url: publicUrl || '', 
              caption: caption || 'Analyze this food' 
            }),
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            }
          });

          if (aiRes.ok) {
            const data = await aiRes.json();
            // Ensure we have valid numbers
            nutritionData = {
              protein: parseInt(data.protein) || 0,
              carbs: parseInt(data.carbs) || 0,
              fat: parseInt(data.fat) || 0,
              calories: parseInt(data.calories) || 0
            };
          } else {
            console.error('AI analysis returned error:', await aiRes.text());
          }
        } catch (aiError) {
          console.error('AI analysis failed:', aiError);
          // Continue without nutrition data
        }
      }

      // Create food log entry
      const newEntry = {
        user_id: user.id,
        image_url: publicUrl || null,
        entry_text: caption || 'Food entry',
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fat: nutritionData.fat,
        calories: nutritionData.calories,
        logged_for_date: today
      };

      const { error: insertError } = await supabase
        .from('food_logs')
        .insert(newEntry);

      if (insertError) throw insertError;

      // Create timeline event
      await supabase.from('patient_timeline_events').insert({
        patient_id: user.id,
        type: 'update',
        label: 'Food Entry Logged',
        data: {
          image_url: publicUrl || null,
          protein: nutritionData.protein,
          carbs: nutritionData.carbs,
          fat: nutritionData.fat,
          calories: nutritionData.calories
        }
      });

      // Reset form and reload
      setPhoto(null);
      setCaption('');
      alert('Food logged successfully!');
      await loadFoodLogs();
    } catch (error) {
      console.error('Error logging food:', error);
      alert('Failed to log food. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  // Group logs by date
  const grouped = logs.reduce((acc: Record<string, FoodLogEntry[]>, log) => {
    const key = log.logged_for_date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {});

  // Calculate daily totals
  const getDailyTotals = (items: FoodLogEntry[]) => {
    return items.reduce((totals, item) => ({
      protein: totals.protein + item.protein,
      carbs: totals.carbs + item.carbs,
      fat: totals.fat + item.fat,
      calories: totals.calories + item.calories
    }), { protein: 0, carbs: 0, fat: 0, calories: 0 });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Health & Nutrition Log</h1>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Log Food (Photo or Text)
        </h2>
        
        <div className="space-y-4">
          {/* Photo upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Photo (optional)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)} 
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {previewUrl && (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="mt-2 w-32 h-32 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input 
              value={caption} 
              onChange={(e) => setCaption(e.target.value)} 
              placeholder="What did you eat? (e.g., Grilled chicken salad)"
            />
          </div>

          <Button 
            onClick={submit} 
            disabled={uploading || (!photo && !caption)}
            className="w-full"
          >
            {uploading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Analyzing & Logging...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Log Entry
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Food entries grouped by date */}
      {Object.entries(grouped).map(([date, items]) => {
        const dailyTotals = getDailyTotals(items);
        
        return (
          <div key={date} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-blue-600">
                {format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
              </h2>
              <div className="text-sm text-gray-600">
                {dailyTotals.calories} cal • {dailyTotals.protein}g protein
              </div>
            </div>

            <div className="grid gap-4">
              {items.map((entry) => (
                <Card key={entry.id} className="p-4">
                  <div className="flex gap-4">
                    {entry.image_url ? (
                      <img 
                        src={entry.image_url} 
                        alt={entry.entry_text}
                        className="w-24 h-24 object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Utensils className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-medium">{entry.entry_text}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(entry.created_at), 'h:mm a')}
                      </p>
                      
                      <div className="grid grid-cols-4 gap-3 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Calories</span>
                          <p className="font-semibold">{entry.calories}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Protein</span>
                          <p className="font-semibold text-green-600">{entry.protein}g</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Carbs</span>
                          <p className="font-semibold text-yellow-600">{entry.carbs}g</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Fat</span>
                          <p className="font-semibold text-red-600">{entry.fat}g</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {logs.length === 0 && (
        <Card className="p-8 text-center">
          <Utensils className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No food entries yet. Start logging your meals!</p>
        </Card>
      )}
    </div>
  );
}