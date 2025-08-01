import { Card, CardContent } from '@/components/ui/card'
import { useState } from 'react'

const starterNotes = [
  { id: 1, tag: 'employer', text: "NovaHealth's payment plan expires next month." },
  { id: 2, tag: 'ai', text: 'Gemini responded with 98% accuracy this week.' }
]

export function AdminNotesPanel() {
  const [notes, setNotes] = useState(starterNotes)
  const [input, setInput] = useState('')

  const addNote = () => {
    if (!input.trim()) return
    const tag = input.includes('#') ? input.split('#')[1] : 'general'
    setNotes([...notes, { id: Date.now(), tag, text: input }])
    setInput('')
  }

  return (
    <Card className="glass-card">
      <CardContent>
        <h2 className="text-lg font-bold text-slate-800 mb-4">🗂️ Admin Notes & Tags</h2>
        <ul className="space-y-3 mb-4">
          {notes.map(n => (
            <li key={n.id} className="text-sm flex justify-between">
              <span className="text-slate-700">{n.text}</span>
              <span className="text-xs px-2 py-1 bg-sky-100 text-sky-800 rounded-full">#{n.tag}</span>
            </li>
          ))}
        </ul>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Leave a note... (use #tag)"
          className="w-full bg-white/40 backdrop-blur border rounded-xl px-4 py-2 mb-2"
        />
        <button
          onClick={addNote}
          className="bg-sky-600 text-white rounded-xl px-4 py-2 hover:bg-sky-700 transition shadow"
        >
          Save Note
        </button>
      </CardContent>
    </Card>
  )
}