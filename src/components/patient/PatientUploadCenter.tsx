import React, { useState } from 'react'
import { UploadCloud, FileText, ImageIcon, Eye, Download, Clock, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'

interface UploadFile {
  file: File
  type: string
  preview?: string
  uploadDate?: Date
  id?: string
}

const uploadTypes = ['Lab Result', 'Insurance', 'Referral', 'Prescription', 'Radiology', 'Other']

interface PatientUploadCenterProps {
  patientId?: string
}

export default function PatientUploadCenter({ patientId }: PatientUploadCenterProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [selectedType, setSelectedType] = useState(uploadTypes[0])
  const [uploading, setUploading] = useState(false)

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const newFiles: UploadFile[] = []
    Array.from(incoming).forEach((file) => {
      const preview = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined
      newFiles.push({ 
        file, 
        type: selectedType, 
        preview,
        uploadDate: new Date(),
        id: `${Date.now()}-${Math.random()}`
      })
    })
    setFiles((prev) => [...prev, ...newFiles])
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleUpload = async (fileObj: UploadFile) => {
    if (!patientId) return
    
    setUploading(true)
    try {
      const fileName = `${Date.now()}-${fileObj.file.name}`
      const filePath = `${patientId}/${fileObj.type.toLowerCase().replace(' ', '-')}/${fileName}`
      
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('uploads')
        .upload(filePath, fileObj.file)

      if (!error) {
        // Save metadata
        // Get public URL for preview if it's an image
        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(filePath)
        
        await supabase.from('patient_uploads').insert({
          patient_id: patientId,
          file_path: filePath,
          file_name: fileObj.file.name,
          file_size: fileObj.file.size,
          type: fileObj.type.toLowerCase().replace(' ', '-'),
          content_type: fileObj.file.type,
          preview_url: fileObj.file.type.startsWith('image/') ? publicUrl : null
        })
      }
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const groupedFiles = files.reduce((acc, file) => {
    if (!acc[file.type]) acc[file.type] = []
    acc[file.type].push(file)
    return acc
  }, {} as Record<string, UploadFile[]>)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <UploadCloud className="w-6 h-6 text-emerald-600" />
          </div>
          Patient Upload Center
        </h2>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          Upload and organize your medical files securely
          <Shield className="w-4 h-4 text-green-600" />
          <span className="text-xs text-green-600">HIPAA Compliant</span>
        </p>
      </div>

      {/* Upload controls */}
      <Card className="shadow-xl border-emerald-100 dark:border-emerald-900">
        <CardContent className="space-y-6 py-6">
          <div className="space-y-2">
            <Label>Select Document Type</Label>
            <select
              className="w-full bg-background border border-input rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {uploadTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
              dragging 
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500' 
                : 'bg-gray-50 dark:bg-zinc-900/50 border-gray-300 dark:border-zinc-700 hover:border-emerald-400'
            )}
          >
            <UploadCloud className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
            <p className="text-base font-medium mb-1">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports PDF, JPG, PNG, DOC files up to 10MB
            </p>
            <Input
              type="file"
              multiple
              className="hidden"
              id="file-upload"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>Select Files</span>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded file previews */}
      {Object.entries(groupedFiles).map(([type, typeFiles]) => (
        <div key={type} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              {type}
            </h3>
            <Badge variant="outline">{typeFiles.length} files</Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {typeFiles.map((fileObj) => (
              <Card
                key={fileObj.id}
                className="border hover:shadow-lg transition-all hover:border-emerald-200"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {fileObj.preview ? (
                      <img
                        src={fileObj.preview}
                        alt={fileObj.file.name}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fileObj.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(fileObj.file.size)}
                      </p>
                      {fileObj.uploadDate && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {fileObj.uploadDate.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {patientId && (
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleUpload(fileObj)}
                        disabled={uploading}
                      >
                        {uploading ? 'Uploading...' : 'Upload'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        setFiles((prev) =>
                          prev.filter((f) => f.id !== fileObj.id)
                        )
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Recent uploads section */}
      {files.length > 0 && (
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Recent Activity
            </h3>
            <div className="space-y-2">
              {files.slice(-3).reverse().map((file) => (
                <div key={file.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Added {file.file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {file.uploadDate?.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Storage info */}
      <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Storage Used</span>
          <span className="font-medium">
            {formatFileSize(files.reduce((sum, f) => sum + f.file.size, 0))} of 5 GB
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2">
          <div 
            className="bg-emerald-600 h-2 rounded-full transition-all"
            style={{ 
              width: `${Math.min((files.reduce((sum, f) => sum + f.file.size, 0) / (5 * 1024 * 1024 * 1024)) * 100, 100)}%` 
            }}
          />
        </div>
      </div>
    </div>
  )
}