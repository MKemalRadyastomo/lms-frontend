'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Key, 
  Copy, 
  RefreshCw, 
  QrCode, 
  Users, 
  Calendar, 
  Lock,
  Unlock,
  Settings,
  Link as LinkIcon,
  UserPlus,
  Share,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Course, Enrollment } from '@/types'

const enrollmentCodeSchema = z.object({
  code: z.string().min(6, 'Code must be at least 6 characters').max(8, 'Code must be at most 8 characters'),
  is_active: z.boolean(),
  expires_at: z.string().optional(),
  max_uses: z.number().min(1, 'Must allow at least 1 use').optional(),
  require_approval: z.boolean()
})

type EnrollmentCodeData = z.infer<typeof enrollmentCodeSchema>

interface ClassCode {
  id: number
  course_id: number
  code: string
  is_active: boolean
  created_at: string
  expires_at?: string
  max_uses?: number
  current_uses: number
  require_approval: boolean
  created_by: number
}

interface ClassCodeModalProps {
  course: Course
  existingCode?: ClassCode
  onCodeGenerated?: (code: ClassCode) => void
  onCodeUpdated?: (code: ClassCode) => void
  onEnroll?: (code: string) => Promise<void>
  mode?: 'generate' | 'enroll' | 'manage'
  trigger?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function ClassCodeModal({
  course,
  existingCode,
  onCodeGenerated,
  onCodeUpdated,
  onEnroll,
  mode = 'generate',
  trigger,
  isOpen,
  onOpenChange
}: ClassCodeModalProps) {
  const [activeTab, setActiveTab] = useState<string>(mode)
  const [generatedCode, setGeneratedCode] = useState<ClassCode | null>(existingCode || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [enrollmentCode, setEnrollmentCode] = useState('')

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<EnrollmentCodeData>({
    resolver: zodResolver(enrollmentCodeSchema),
    defaultValues: {
      code: existingCode?.code || '',
      is_active: existingCode?.is_active ?? true,
      expires_at: existingCode?.expires_at?.split('T')[0] || '',
      max_uses: existingCode?.max_uses,
      require_approval: existingCode?.require_approval ?? false
    }
  })

  // Generate random class code
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Handle code generation
  const handleGenerateCode = async (data: EnrollmentCodeData) => {
    setIsSubmitting(true)
    try {
      // Simulate API call to generate class code
      const newCode: ClassCode = {
        id: Date.now(),
        course_id: course.id,
        code: data.code || generateRandomCode(),
        is_active: data.is_active,
        created_at: new Date().toISOString(),
        expires_at: data.expires_at ? `${data.expires_at}T23:59:59` : undefined,
        max_uses: data.max_uses,
        current_uses: 0,
        require_approval: data.require_approval,
        created_by: 1 // Should come from auth context
      }

      setGeneratedCode(newCode)
      
      if (onCodeGenerated) {
        await onCodeGenerated(newCode)
      }
      
      toast.success('Class code generated successfully!')
    } catch (error) {
      console.error('Error generating code:', error)
      toast.error('Failed to generate class code')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle code update
  const handleUpdateCode = async (data: EnrollmentCodeData) => {
    if (!generatedCode) return

    setIsSubmitting(true)
    try {
      const updatedCode: ClassCode = {
        ...generatedCode,
        code: data.code,
        is_active: data.is_active,
        expires_at: data.expires_at ? `${data.expires_at}T23:59:59` : undefined,
        max_uses: data.max_uses,
        require_approval: data.require_approval
      }

      setGeneratedCode(updatedCode)
      
      if (onCodeUpdated) {
        await onCodeUpdated(updatedCode)
      }
      
      toast.success('Class code updated successfully!')
    } catch (error) {
      console.error('Error updating code:', error)
      toast.error('Failed to update class code')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle student enrollment
  const handleEnrollment = async () => {
    if (!enrollmentCode.trim()) {
      toast.error('Please enter a class code')
      return
    }

    setIsSubmitting(true)
    try {
      if (onEnroll) {
        await onEnroll(enrollmentCode.trim().toUpperCase())
        toast.success('Enrollment request submitted!')
        setEnrollmentCode('')
      }
    } catch (error) {
      console.error('Error enrolling:', error)
      toast.error('Failed to enroll. Please check the code and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Copy code to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Code copied to clipboard!')
  }

  // Generate new random code
  const generateNewCode = () => {
    const newCode = generateRandomCode()
    setValue('code', newCode)
    toast.info('New code generated')
  }

  // Check if code is expired
  const isCodeExpired = (code: ClassCode) => {
    if (!code.expires_at) return false
    return new Date(code.expires_at) < new Date()
  }

  // Check if code is at max uses
  const isCodeAtMaxUses = (code: ClassCode) => {
    if (!code.max_uses) return false
    return code.current_uses >= code.max_uses
  }

  const modalContent = (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="generate" className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          Generate
        </TabsTrigger>
        <TabsTrigger value="enroll" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Enroll
        </TabsTrigger>
        <TabsTrigger value="manage" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Manage
        </TabsTrigger>
      </TabsList>

      {/* Generate Code Tab */}
      <TabsContent value="generate" className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Generate Class Code</h3>
          <p className="text-sm text-gray-600">
            Create a code for students to join {course.name}
          </p>
        </div>

        <form onSubmit={handleSubmit(handleGenerateCode)} className="space-y-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="code">Class Code</Label>
                <Input
                  id="code"
                  {...control.register('code')}
                  placeholder="Enter custom code or leave blank for random"
                  className="font-mono text-center tracking-wider"
                />
                {errors.code && (
                  <p className="text-sm text-red-600">{errors.code.message}</p>
                )}
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateNewCode}
                  className="px-3"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
                <Input
                  id="expires_at"
                  type="date"
                  {...control.register('expires_at')}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_uses">Max Uses (Optional)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  min="1"
                  {...control.register('max_uses', { valueAsNumber: true })}
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Code Active</Label>
                <Switch
                  id="is_active"
                  {...control.register('is_active')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="require_approval">Require Approval</Label>
                <Switch
                  id="require_approval"
                  {...control.register('require_approval')}
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Generating...' : 'Generate Class Code'}
          </Button>
        </form>

        {/* Generated Code Display */}
        {generatedCode && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Class Code</p>
                  <div className="text-3xl font-bold font-mono tracking-wider text-blue-600">
                    {generatedCode.code}
                  </div>
                </div>
                
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedCode.code)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`Join ${course.name} with code: ${generatedCode.code}`)}
                  >
                    <Share className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    {generatedCode.is_active ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-red-500" />
                    )}
                    {generatedCode.is_active ? 'Active' : 'Inactive'}
                  </div>
                  <div>{generatedCode.current_uses} uses</div>
                  {generatedCode.expires_at && (
                    <div>Expires {new Date(generatedCode.expires_at).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Enroll with Code Tab */}
      <TabsContent value="enroll" className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Join Course</h3>
          <p className="text-sm text-gray-600">
            Enter the class code provided by your instructor
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="enrollment-code">Class Code</Label>
            <Input
              id="enrollment-code"
              value={enrollmentCode}
              onChange={(e) => setEnrollmentCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-8 character code"
              className="font-mono text-center tracking-wider text-lg"
              maxLength={8}
            />
          </div>

          <Button
            onClick={handleEnrollment}
            disabled={isSubmitting || !enrollmentCode.trim()}
            className="w-full"
          >
            {isSubmitting ? 'Enrolling...' : 'Join Course'}
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>• Code is not case-sensitive</p>
          <p>• Some courses may require instructor approval</p>
          <p>• Contact your instructor if the code doesn&apos;t work</p>
        </div>
      </TabsContent>

      {/* Manage Code Tab */}
      <TabsContent value="manage" className="space-y-4">
        {generatedCode ? (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Manage Class Code</h3>
              <p className="text-sm text-gray-600">
                Update settings for your current class code
              </p>
            </div>

            {/* Current Code Status */}
            <Card className={cn(
              generatedCode.is_active && !isCodeExpired(generatedCode) && !isCodeAtMaxUses(generatedCode)
                ? 'border-green-200 bg-green-50'
                : 'border-orange-200 bg-orange-50'
            )}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-2xl font-bold">
                      {generatedCode.code}
                    </div>
                    <div className="text-sm text-gray-600">
                      Created {new Date(generatedCode.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={generatedCode.is_active ? 'default' : 'secondary'}>
                      {generatedCode.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {isCodeExpired(generatedCode) && (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                    {isCodeAtMaxUses(generatedCode) && (
                      <Badge variant="destructive">Max Uses Reached</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Update Form */}
            <form onSubmit={handleSubmit(handleUpdateCode)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Uses</Label>
                  <div className="text-sm">
                    {generatedCode.current_uses} / {generatedCode.max_uses || '∞'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-2 text-sm">
                    {generatedCode.is_active ? (
                      <Unlock className="h-4 w-4 text-green-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-red-500" />
                    )}
                    {generatedCode.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="update_active">Code Active</Label>
                  <Switch
                    id="update_active"
                    {...control.register('is_active')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="update_approval">Require Approval</Label>
                  <Switch
                    id="update_approval"
                    {...control.register('require_approval')}
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Updating...' : 'Update Settings'}
              </Button>
            </form>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <Key className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">No Class Code</h3>
              <p className="text-gray-500">Generate a class code first to manage it</p>
            </div>
            <Button onClick={() => setActiveTab('generate')}>
              Generate Class Code
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Class Code Management</DialogTitle>
            <DialogDescription>
              Generate and manage class codes for {course.name}
            </DialogDescription>
          </DialogHeader>
          {modalContent}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Class Code Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {modalContent}
      </CardContent>
    </Card>
  )
}