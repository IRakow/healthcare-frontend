import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StickyNote } from 'lucide-react'

export function AdminNotesPanel() {
  const [notes, setNotes] = useState<string[]>([])
  const [input, setInput] = useState('')

  const addNote = () => {
    if (!input.trim()) return
    setNotes([...notes, input.trim()])
    setInput('')
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-rose-700 flex items-center gap-2">
          <StickyNote className="w-5 h-5" /> Admin Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2 text-sm text-gray-700">
          {notes.map((n, i) => (
            <li key={i} className="border-b pb-1">{n}</li>
          ))}
        </ul>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Write a new note..."
          className="w-full border px-3 py-2 rounded-lg text-sm bg-white/60 backdrop-blur"
        />
        <button
          onClick={addNote}
          className="w-full mt-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition"
        >
          Save Note
        </button>
      </CardContent>
    </Card>
  )
}