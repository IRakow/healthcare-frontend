import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const initialNotes = [
  { id: 1, text: 'Patient is consistent with hydration this week.' },
  { id: 2, text: 'Follow up on protein intake trends.' }
]

export function AdminNotesPanel() {
  const [notes, setNotes] = useState(initialNotes)
  const [input, setInput] = useState('')

  const addNote = () => {
    if (!input.trim()) return
    setNotes([...notes, { id: Date.now(), text: input }])
    setInput('')
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-rose-700">🗂 Notes & Tags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2 text-sm text-gray-700">
          {notes.map(n => (
            <li key={n.id} className="border-b pb-1">{n.text}</li>
          ))}
        </ul>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Write a new note..."
          className="w-full border px-3 py-2 rounded-lg text-sm bg-white/50 backdrop-blur"
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