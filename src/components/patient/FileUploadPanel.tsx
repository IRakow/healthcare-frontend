import { useState, ChangeEvent } from 'react'
import { Upload, FileText, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UploadedFile {
  name: string
  size: number
  type: string
  date: string
}

export default function FileUploadPanel() {
  const [files, setFiles] = useState<UploadedFile[]>([])

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    
    const uploaded = Array.from(e.target.files).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      date: new Date().toLocaleDateString()
    }))
    setFiles((prev) => [...prev, ...uploaded])
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 p-5 bg-white dark:bg-zinc-900 shadow-xl max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-500" /> Medical Files
        </h2>
        <label className="cursor-pointer">
          <input type="file" hidden multiple onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
          <Button size="sm" variant="outline" asChild>
            <span>
              <Upload className="w-4 h-4 mr-2" /> Upload
            </span>
          </Button>
        </label>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700">
          <FileText className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">No files uploaded yet.</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">Upload medical records, lab results, or images</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {files.map((f, idx) => (
            <li key={idx} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 px-4 py-3 rounded-lg border border-zinc-100 dark:border-zinc-700 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-sm text-zinc-700 dark:text-zinc-100">
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {f.type.split('/')[1]?.toUpperCase() || 'FILE'} • {formatFileSize(f.size)} • {f.date}
                  </div>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-zinc-600">
                <PlusCircle className="w-4 h-4 rotate-45" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}