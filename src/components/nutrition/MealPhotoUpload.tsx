import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Camera, Loader2 } from 'lucide-react'

export default function MealPhotoUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const { user } = useAuth()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async () => {
    if (!file) return
    
    setLoading(true)
    setError('')
    
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(',')[1] || ''
        
        // Get the user's session token
        const { data: { session } } = await supabase.auth.getSession()
        
        // Call the Supabase Edge Function
        const { data, error: fnError } = await supabase.functions.invoke('photo-analysis-gemini', {
          body: { image: base64 },
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        })
        
        if (fnError) {
          setError('Failed to analyze image. Please try again.')
          console.error('Function error:', fnError)
        } else {
          setResult(data)
        }
        setLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Error:', err)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">Upload a Meal Photo</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block">
            <Input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </label>
        </div>

        {preview && (
          <div className="relative">
            <img 
              src={preview} 
              alt="Meal preview" 
              className="w-full rounded-lg shadow-md max-h-64 object-cover"
            />
          </div>
        )}

        <Button 
          className="w-full" 
          onClick={handleSubmit} 
          disabled={!file || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Analyze Meal
            </>
          )}
        </Button>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {result && result.analysis && (
          <div className="bg-white border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-lg">Analysis Results</h3>
            
            <div className="space-y-2">
              <h4 className="font-medium">Foods Detected:</h4>
              {result.analysis.foods.map((food: any, idx: number) => (
                <div key={idx} className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{food.name}</p>
                      <p className="text-sm text-gray-600">{food.quantity}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p>{food.calories} cal</p>
                      <p className="text-gray-600">
                        P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-3">
              <h4 className="font-medium mb-2">Total Nutrition:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Calories: <span className="font-medium">{result.analysis.total.calories}</span></div>
                <div>Protein: <span className="font-medium">{result.analysis.total.protein}g</span></div>
                <div>Carbs: <span className="font-medium">{result.analysis.total.carbs}g</span></div>
                <div>Fat: <span className="font-medium">{result.analysis.total.fat}g</span></div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Health Score:</span>
                <span className="text-2xl font-bold text-green-600">
                  {result.analysis.healthScore}/10
                </span>
              </div>
              
              <div className="space-y-1">
                <p className="font-medium text-sm">Suggestions:</p>
                {result.analysis.suggestions.map((suggestion: string, idx: number) => (
                  <p key={idx} className="text-sm text-gray-700">• {suggestion}</p>
                ))}
              </div>
            </div>

            {result.success && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
                ✓ Meal logged successfully!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}