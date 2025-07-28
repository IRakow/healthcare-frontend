import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  servingSize: string;
  ingredients?: string[];
  warnings?: string[];
  healthScore?: number;
}

export const ScanNutritionLabel: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userId } = useUser();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      analyzeLabel(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzeLabel = async (base64Image: string) => {
    setScanning(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-nutrition-label', {
        body: { 
          image: base64Image,
          userId 
        }
      });

      if (error) throw error;

      setNutritionData(data.nutritionData);
      
      // Save to food log if user is logged in
      if (userId && data.nutritionData) {
        await supabase.from('food_logs').insert({
          user_id: userId,
          type: 'nutrition_label',
          nutrition_data: data.nutritionData,
          image_url: base64Image,
          created_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Failed to analyze nutrition label:', err);
      setError('Failed to analyze nutrition label. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleCameraCapture = () => {
    // For mobile devices, this will open the camera
    fileInputRef.current?.click();
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Scan Nutrition Label</h2>
        <p className="text-muted-foreground mb-6">
          Take a photo or upload an image of a nutrition label to analyze its contents and get health insights.
        </p>

        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={handleCameraCapture}
              disabled={scanning}
              size="lg"
              className="flex-1"
            >
              <Camera className="w-5 h-5 mr-2" />
              Take Photo
            </Button>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={scanning}
              size="lg"
              variant="outline"
              className="flex-1"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Image
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {imagePreview && (
            <div className="mt-4 relative">
              <img
                src={imagePreview}
                alt="Nutrition label"
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
              {scanning && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {nutritionData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 mt-6"
            >
              {/* Health Score */}
              {nutritionData.healthScore !== undefined && (
                <div className="text-center p-6 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Health Score</h3>
                  <p className={`text-4xl font-bold ${getHealthScoreColor(nutritionData.healthScore)}`}>
                    {nutritionData.healthScore}/100
                  </p>
                </div>
              )}

              {/* Nutrition Facts */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Nutrition Facts</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Per {nutritionData.servingSize}
                </p>
                
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Calories</span>
                    <span>{nutritionData.calories}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span>Protein</span>
                    <span>{nutritionData.protein}g</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span>Carbohydrates</span>
                    <span>{nutritionData.carbs}g</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span>Fat</span>
                    <span>{nutritionData.fats}g</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span>Fiber</span>
                    <span>{nutritionData.fiber}g</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span>Sugar</span>
                    <span>{nutritionData.sugar}g</span>
                  </div>
                  
                  <div className="flex justify-between py-2">
                    <span>Sodium</span>
                    <span>{nutritionData.sodium}mg</span>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {nutritionData.warnings && nutritionData.warnings.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Health Warnings
                  </h3>
                  <ul className="space-y-1">
                    {nutritionData.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-orange-700 dark:text-orange-300">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ingredients */}
              {nutritionData.ingredients && nutritionData.ingredients.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Key Ingredients</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {nutritionData.ingredients.join(', ')}
                  </p>
                </div>
              )}

              {/* Success Message */}
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  Nutrition data saved to your food log!
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};