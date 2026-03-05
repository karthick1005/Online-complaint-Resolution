import { useState } from 'react'
import { Upload, X, File, Image, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export function AttachmentUpload({ onFilesSelected, maxFiles = 5, maxSize = 10485760 }) {
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <Image className="w-4 h-4" />
    } else if (['pdf'].includes(ext)) {
      return <FileText className="w-4 h-4" />
    }
    return <File className="w-4 h-4" />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }

  const handleInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files || [])
    processFiles(selectedFiles)
  }

  const processFiles = (newFiles) => {
    setError('')

    if (files.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    const validFiles = newFiles.filter((file) => {
      if (file.size > maxSize) {
        setError(`File ${file.name} exceeds ${formatFileSize(maxSize)} limit`)
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles.map((f) => ({ file: f, id: Date.now() + Math.random() }))]
      setFiles(updatedFiles)
      onFilesSelected(updatedFiles)
    }
  }

  const handleRemoveFile = (id) => {
    const updatedFiles = files.filter((f) => f.id !== id)
    setFiles(updatedFiles)
    onFilesSelected(updatedFiles)
  }

  const isPreviewable = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase()
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Attachments</CardTitle>
        <CardDescription>
          Upload files to support your complaint (max {maxFiles} files, {formatFileSize(maxSize)} each)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
        >
          <input
            type="file"
            id="file-upload"
            multiple
            onChange={handleInputChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground">Supported formats: Images, PDF, Documents</p>
              </div>
            </div>
          </label>
        </div>

        {/* Error Message */}
        {error && <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">{error}</div>}

        {/* Files List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Uploaded files ({files.length}/{maxFiles})
            </p>
            <div className="space-y-2">
              {files.map((fileData) => (
                <div
                  key={fileData.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0 text-muted-foreground">
                      {getFileIcon(fileData.file.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{fileData.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(fileData.file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {isPreviewable(fileData.file.name) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const url = URL.createObjectURL(fileData.file)
                          window.open(url, '_blank')
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFile(fileData.id)}
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
