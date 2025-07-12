'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  File, 
  X, 
  AlertCircle,
  CheckCircle,
  FileText,
  Download
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FileUploadAreaProps {
  onFileSelect: (file: File | null) => void
  selectedFile?: File | null
  maxSize?: number // in MB
  allowedTypes?: string[]
  className?: string
  disabled?: boolean
}

export default function FileUploadArea({
  onFileSelect,
  selectedFile,
  maxSize = 50, // 50MB default
  allowedTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx'],
  className,
  disabled = false
}: FileUploadAreaProps) {
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // File validation
  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSize}MB`
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return `File type must be one of: ${allowedTypes.join(', ')}`
    }

    return null
  }, [maxSize, allowedTypes])

  // Handle file drop/selection
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    const validationError = validateFile(file)

    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }

    setError(null)
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress (replace with actual upload logic)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsUploading(false)
          onFileSelect(file)
          toast.success('File selected successfully!')
          return 100
        }
        return prev + 10
      })
    }, 100)
  }, [validateFile, onFileSelect])

  // Remove selected file
  const removeFile = () => {
    onFileSelect(null)
    setError(null)
    setUploadProgress(0)
    setIsUploading(false)
    toast.info('File removed')
  }

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
    maxFiles: 1,
    disabled: disabled || isUploading,
  })

  // Get file icon based on extension
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-500" />
      case 'ppt':
      case 'pptx':
        return <FileText className="h-8 w-8 text-orange-500" />
      default:
        return <File className="h-8 w-8 text-gray-500" />
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* File Upload Area */}
      {!selectedFile && (
        <Card className={cn(
          'border-2 border-dashed transition-colors',
          isDragActive && 'border-blue-500 bg-blue-50',
          error && 'border-red-500 bg-red-50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}>
          <CardContent className="p-8">
            <div
              {...getRootProps()}
              className={cn(
                'text-center cursor-pointer space-y-4',
                disabled && 'cursor-not-allowed'
              )}
            >
              <input {...getInputProps()} />
              
              <div className="flex justify-center">
                <Upload className={cn(
                  'h-12 w-12',
                  isDragActive ? 'text-blue-500' : 'text-gray-400'
                )} />
              </div>

              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop the file here' : 'Upload Material File'}
                </p>
                <p className="text-sm text-gray-500">
                  Drag and drop a file here, or click to browse
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap justify-center gap-2">
                  {allowedTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      .{type}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Maximum file size: {maxSize}MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected File Display */}
      {selectedFile && !isUploading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getFileIcon(selectedFile.name)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Badge variant="secondary" className="text-xs">
                    Ready
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Upload Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Requirements */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Supported formats: {allowedTypes.map(type => `.${type}`).join(', ')}</p>
        <p>• Maximum file size: {maxSize}MB</p>
        <p>• Files are scanned for security before upload</p>
      </div>
    </div>
  )
}