'use client'

import { Award } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface QuickAction {
  title: string
  description: string
  icon: React.ReactNode
  action: () => void
  variant?: 'default' | 'outline'
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Award className="h-5 w-5" />
          <span>Quick Actions</span>
        </CardTitle>
        <CardDescription>
          Common tasks and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            className="w-full justify-start h-auto p-4"
            variant={action.variant || "outline"}
            onClick={action.action}
          >
            <div className="flex items-center space-x-3">
              {action.icon}
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-gray-600">{action.description}</div>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
