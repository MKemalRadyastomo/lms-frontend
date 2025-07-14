'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormSelect, StandaloneSelect } from '@/components/ui/form-select'
import { useState } from 'react'
import { toast } from 'sonner'

const testSchema = z.object({
  role: z.number().min(1, 'Role is required'),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['low', 'medium', 'high'])
})

type TestFormData = z.infer<typeof testSchema>

export function DropdownTest() {
  const [standaloneValue, setStandaloneValue] = useState<string | number>('')

  const { control, handleSubmit, watch, formState: { errors } } = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      role: 1,
      category: '',
      priority: 'medium'
    }
  })

  const watchedValues = watch()

  const onSubmit = (data: TestFormData) => {
    toast.success(`Form submitted: ${JSON.stringify(data)}`)
    console.log('Form data:', data)
  }

  const roleOptions = [
    { value: 1, label: 'Student' },
    { value: 2, label: 'Teacher' },
    { value: 3, label: 'Admin' }
  ]

  const categoryOptions = [
    { value: 'math', label: 'Mathematics' },
    { value: 'science', label: 'Science' },
    { value: 'english', label: 'English' },
    { value: 'history', label: 'History' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ]

  const standaloneOptions = [
    { value: 'option1', label: 'Standalone Option 1' },
    { value: 'option2', label: 'Standalone Option 2' },
    { value: 'option3', label: 'Standalone Option 3' }
  ]

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dropdown Test - FormSelect (React Hook Form)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Number value dropdown */}
            <FormSelect
              name="role"
              control={control}
              label="Role (Number Value) *"
              placeholder="Select a role"
              options={roleOptions}
              description="This dropdown uses number values"
            />

            {/* String value dropdown */}
            <FormSelect
              name="category"
              control={control}
              label="Category (String Value) *"
              placeholder="Select a category"
              options={categoryOptions}
              description="This dropdown uses string values"
              clearable={true}
            />

            {/* Enum value dropdown */}
            <FormSelect
              name="priority"
              control={control}
              label="Priority (Enum Value) *"
              placeholder="Select priority level"
              options={priorityOptions}
              description="This dropdown uses enum values"
            />

            <Button type="submit" className="w-full">
              Submit Form
            </Button>
          </form>

          {/* Real-time form values display */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Current Form Values:</h4>
            <pre className="text-sm">{JSON.stringify(watchedValues, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dropdown Test - StandaloneSelect</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Standalone Dropdown (Non-form)
              </label>
              <StandaloneSelect
                value={standaloneValue}
                onValueChange={setStandaloneValue}
                placeholder="Select standalone option"
                options={standaloneOptions}
                clearable={true}
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Standalone Value:</h4>
              <p className="text-sm">{standaloneValue || 'None selected'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error states display */}
      {Object.keys(errors).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Form Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-red-600">
              {JSON.stringify(errors, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}