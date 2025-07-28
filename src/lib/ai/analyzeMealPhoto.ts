import { analyzeMealPhoto as analyzePhoto } from '@/lib/api/analyzeMealPhoto';

/**
 * Analyzes a meal photo using AI
 * This is a wrapper around the API function for backward compatibility
 * @deprecated Use @/lib/api/analyzeMealPhoto instead
 */
export async function analyzeMealPhoto(base64Image: string): Promise<string> {
  try {
    const analysis = await analyzePhoto(base64Image);
    
    // Format the analysis as a string for backward compatibility
    const items = analysis.items.join(', ');
    return `Food items: ${items}
Calories: ${analysis.calories}
Protein: ${analysis.protein}g
Carbs: ${analysis.carbs}g
Fats: ${analysis.fats}g`;
  } catch (error) {
    console.error('Failed to analyze meal photo:', error);
    return 'Unable to analyze.';
  }
}