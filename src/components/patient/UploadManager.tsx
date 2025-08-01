// src/components/patient/UploadManager.tsx

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FileText } from 'lucide-react'

const uploads = [
  { name: 'CBC Results.pdf', type: 'Lab', date: 'Jul 29' },
  { name: 'Allergy Summary.jpg', type: 'Doc', date: 'Jul 27' },
  { name: 'X-ray.pdf', type: 'Imaging', date: 'Jul 25' }
]

export function UploadManager() {
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? uploads : uploads.filter(f => f.type === filter)

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-indigo-700">
          <span className="flex gap-2 items-center"><FileText className="w-5 h-5" /> Uploaded Files</span>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="text-sm bg-white/40 backdrop-blur rounded px-2 py-1 border"
          >
            <option>All</option>
            <option>Lab</option>
            <option>Doc</option>
            <option>Imaging</option>
          </select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm">
          {filtered.map((f, i) => (
            <li key={i} className="flex justify-between border-b pb-1 border-slate-200">
              <span>{f.name}</span>
              <span className="text-slate-400 text-xs">{f.date}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}