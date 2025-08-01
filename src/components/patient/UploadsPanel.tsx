import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

const files = [
  { name: 'Chest X-ray.pdf', type: 'X-ray', date: 'Aug 1', size: '842KB' },
  { name: 'CBC Results.pdf', type: 'Lab', date: 'Jul 30', size: '472KB' },
  { name: 'Allergy Note.jpg', type: 'Doc', date: 'Jul 25', size: '213KB' },
]

export function UploadsPanel() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-700">
          <FileText className="w-5 h-5" />
          Uploaded Files
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm">
          {files.map((file, i) => (
            <li key={i} className="flex justify-between border-b pb-1 border-slate-200">
              <span>{file.name}</span>
              <span className="text-slate-500 text-xs">{file.size}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}