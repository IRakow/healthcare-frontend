import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function MealPhotoUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<string>('')

  const handleSubmit = async () => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result?.toString().split(',')[1] || ''
      const res = await fetch('/api/photo-analysis', {
        method: 'POST',
        body: JSON.stringify({ image: base64 }),
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      setResult(JSON.stringify(data, null, 2))
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">Upload a Meal Photo</h2>
      <Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
      <Button className="mt-4" onClick={handleSubmit}>Analyze Meal</Button>
      {result && <pre className="mt-4 bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">{result}</pre>}
    </div>
  )
}