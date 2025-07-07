'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldX } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login after a short delay
    const timer = setTimeout(() => {
      router.push('/login')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Registration Disabled</CardTitle>
          <CardDescription>
            User registration is not available. Only administrators can create new user accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            If you need an account, please contact your system administrator.
          </p>
          <Button 
            onClick={() => router.push('/login')}
            className="w-full"
          >
            Go to Login
          </Button>
          <p className="text-xs text-gray-500">
            Redirecting to login page in 3 seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
