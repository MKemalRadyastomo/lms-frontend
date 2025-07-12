'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  XCircle 
} from 'lucide-react'

export default function ComponentShowcase() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">UI Component Showcase</h1>
        <p className="text-gray-600">
          Interactive showcase of all standardized UI components used in the LMS application
        </p>
      </div>

      <div className="grid gap-8">
        {/* Badge Component */}
        <Card>
          <CardHeader>
            <CardTitle>Badge Component</CardTitle>
            <CardDescription>
              Status indicators, categories, and labels with multiple variants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Standard Variants</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="purple">Purple</Badge>
                  <Badge variant="pink">Pink</Badge>
                  <Badge variant="indigo">Indigo</Badge>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Soft Variants (Better Accessibility)</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success-soft">Success Soft</Badge>
                  <Badge variant="info-soft">Info Soft</Badge>
                  <Badge variant="warning-soft">Warning Soft</Badge>
                  <Badge variant="destructive-soft">Destructive Soft</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Usage Examples</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                  <Badge variant="info-soft">
                    <Info className="h-3 w-3 mr-1" />
                    In Progress
                  </Badge>
                  <Badge variant="warning">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                  <Badge variant="destructive-soft">
                    <XCircle className="h-3 w-3 mr-1" />
                    Failed
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Components */}
        <Card>
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
            <CardDescription>
              Input fields, selects, and textareas with consistent styling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sample-input">Input Field</Label>
                  <Input 
                    id="sample-input"
                    placeholder="Enter your text..." 
                    data-testid="sample-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sample-select">Select Dropdown</Label>
                  <Select>
                    <SelectTrigger data-testid="sample-select">
                      <SelectValue placeholder="Choose an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">Option 1</SelectItem>
                      <SelectItem value="option2">Option 2</SelectItem>
                      <SelectItem value="option3">Option 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="sample-textarea">Textarea</Label>
                <Textarea 
                  id="sample-textarea"
                  placeholder="Enter your description..."
                  className="min-h-32"
                  data-testid="sample-textarea"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Components */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Components</CardTitle>
            <CardDescription>
              Buttons, dropdown menus, and action patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Button Variants</h4>
                <div className="flex flex-wrap gap-2">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button size="sm">Small</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Dropdown Menu Example</h4>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" data-testid="actions-menu">
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem data-testid="edit-action">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid="delete-action" className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testing Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Guidelines</CardTitle>
            <CardDescription>
              Examples of proper data-testid usage for reliable testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Good Test ID Examples</h4>
                <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded">
                  <div>Button: <code className="text-blue-600">data-testid=&quot;submit-button&quot;</code></div>
                  <div>Input: <code className="text-blue-600">data-testid=&quot;username-input&quot;</code></div>
                  <div>Select: <code className="text-blue-600">data-testid=&quot;role-select&quot;</code></div>
                  <div>Textarea: <code className="text-blue-600">data-testid=&quot;description-textarea&quot;</code></div>
                  <div>Menu: <code className="text-blue-600">data-testid=&quot;actions-menu&quot;</code></div>
                  <div>Card: <code className="text-blue-600">data-testid=&quot;course-card-123&quot;</code></div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Test ID Naming Convention</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Use kebab-case (lowercase with hyphens)</li>
                  <li>• Be descriptive and unique</li>
                  <li>• Include component type as suffix</li>
                  <li>• Include IDs for dynamic content</li>
                  <li>• Examples: course-name-input, privacy-select, actions-menu</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Accessibility Best Practices</CardTitle>
            <CardDescription>
              Guidelines for creating accessible UI components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Color Contrast</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Good Contrast</p>
                    <div className="space-y-1">
                      <Badge variant="success-soft">✓ Easy to read</Badge>
                      <Badge variant="info-soft">✓ Clear visibility</Badge>
                      <Badge variant="warning-soft">✓ Accessible</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">High Contrast</p>
                    <div className="space-y-1">
                      <Badge variant="success">✓ Bold and clear</Badge>
                      <Badge variant="info">✓ High visibility</Badge>
                      <Badge variant="warning">✓ Strong contrast</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Keyboard Navigation</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">All interactive elements should be keyboard accessible:</p>
                  <ul className="text-sm space-y-1 text-gray-600 ml-4">
                    <li>• Tab navigation through form fields</li>
                    <li>• Enter/Space to activate buttons</li>
                    <li>• Arrow keys for dropdown navigation</li>
                    <li>• Escape to close dialogs/menus</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Form Labels</h4>
                <div className="space-y-2">
                  <Label htmlFor="accessible-input">Properly Associated Label</Label>
                  <Input 
                    id="accessible-input"
                    placeholder="This input has a properly associated label"
                    aria-describedby="input-description"
                  />
                  <p id="input-description" className="text-sm text-gray-600">
                    This description is properly associated with the input field.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Best Practices</CardTitle>
            <CardDescription>
              Tips for optimizing component performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Optimization Strategies</h4>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Use <code className="bg-gray-100 px-1 rounded">useMemo</code> for expensive computations</li>
                  <li>• Implement <code className="bg-gray-100 px-1 rounded">useCallback</code> for event handlers</li>
                  <li>• Use skeleton components for loading states</li>
                  <li>• Implement proper error boundaries</li>
                  <li>• Optimize re-renders with React.memo when needed</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Loading States</h4>
                <div className="space-y-2">
                  <Button disabled className="mr-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading...
                  </Button>
                  <Progress value={75} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
