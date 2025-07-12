'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Save, Video, Type, Link as LinkIcon, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import FileUploadArea from './FileUploadArea'
import VideoURLInput from './VideoURLInput'
import { CourseMaterialCreateData } from '@/types'

interface MaterialEditorProps {
  courseId: number
  initialData?: Partial<CourseMaterialCreateData>
  onSave?: (data: CourseMaterialCreateData) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

export default function MaterialEditor({
  courseId,
  initialData,
  onSave,
  onCancel,
  isSubmitting = false
}: MaterialEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [publishDate, setPublishDate] = useState(
    initialData?.publish_date?.split('T')[0] || ''
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoURL, setVideoURL] = useState(initialData?.video_url || '')
  const [activeTab, setActiveTab] = useState<'text' | 'file' | 'video'>('text')

  // TipTap editor configuration
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your material content...',
      }),
    ],
    content: initialData?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  })

  // Validation functions
  const validateTitle = () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return false
    }
    if (title.length < 3) {
      toast.error('Title must be at least 3 characters long')
      return false
    }
    return true
  }

  const validateContent = () => {
    const content = editor?.getHTML() || ''
    const textContent = editor?.getText() || ''
    
    if (activeTab === 'text' && textContent.trim().length < 10) {
      toast.error('Content must be at least 10 characters long')
      return false
    }
    
    if (activeTab === 'file' && !selectedFile) {
      toast.error('Please select a file to upload')
      return false
    }
    
    if (activeTab === 'video' && !videoURL.trim()) {
      toast.error('Please enter a video URL')
      return false
    }
    
    return true
  }

  // Handle form submission
  const handleSave = async () => {
    if (!validateTitle() || !validateContent()) {
      return
    }

    try {
      const materialData: CourseMaterialCreateData = {
        title: title.trim(),
        description: description.trim() || undefined,
        publish_date: publishDate || undefined,
      }

      // Add content based on active tab
      if (activeTab === 'text') {
        materialData.content = editor?.getHTML() || ''
      } else if (activeTab === 'file') {
        materialData.file = selectedFile
      } else if (activeTab === 'video') {
        materialData.video_url = videoURL.trim()
      }

      if (onSave) {
        await onSave(materialData)
        toast.success('Material saved successfully!')
      }
    } catch (error) {
      console.error('Error saving material:', error)
      toast.error('Failed to save material. Please try again.')
    }
  }

  // Toolbar actions
  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    const url = window.prompt('Image URL')
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  if (!editor) {
    return <div className="flex items-center justify-center h-64">Loading editor...</div>
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          {initialData ? 'Edit Material' : 'Create Material'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter material title..."
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="publish-date">Publish Date</Label>
            <Input
              id="publish-date"
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description for this material..."
            rows={3}
            className="w-full"
          />
        </div>

        {/* Content Type Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Rich Text
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              File Upload
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Video URL
            </TabsTrigger>
          </TabsList>

          {/* Rich Text Content */}
          <TabsContent value="text" className="space-y-4">
            {/* Editor Toolbar */}
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-gray-200' : ''}
              >
                <strong>B</strong>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-gray-200' : ''}
              >
                <em>I</em>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
              >
                H2
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
              >
                • List
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={setLink}
                className={editor.isActive('link') ? 'bg-gray-200' : ''}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImage}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Editor Content */}
            <div className="border rounded-lg min-h-[300px]">
              <EditorContent editor={editor} />
            </div>
          </TabsContent>

          {/* File Upload Content */}
          <TabsContent value="file">
            <FileUploadArea
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
              maxSize={50} // 50MB as specified in PRP
              allowedTypes={['pdf', 'doc', 'docx', 'ppt', 'pptx']}
            />
          </TabsContent>

          {/* Video URL Content */}
          <TabsContent value="video">
            <VideoURLInput
              value={videoURL}
              onChange={setVideoURL}
            />
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Material'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}