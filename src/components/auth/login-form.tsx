'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { loginSchema, type LoginFormData } from '@/lib/validators'
import { apiClient } from '@/lib/api'
import { AuthManager } from '@/lib/auth'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: apiClient.login.bind(apiClient),
    onSuccess: async (data) => {
      console.log('=== LOGIN SUCCESS DEBUG ===')
      console.log('Raw backend response:', data)
      console.log('Token:', data.token)
      console.log('User ID:', data.user_id)
      console.log('===========================')
      
      // Store auth tokens
      AuthManager.setAuthTokens({
        token: data.token,
        userId: data.user_id,
      })
      
      console.log('After storing tokens:')
      console.log('Is authenticated:', AuthManager.isAuthenticated())
      console.log('Stored token:', AuthManager.getAuthToken())
      console.log('Stored user ID:', AuthManager.getUserId())

      // Fetch and store user data
      try {
        console.log('Fetching user data for ID:', data.user_id)
        const userData = await apiClient.getUserById(data.user_id)
        console.log('User data received:', userData)
        AuthManager.setUserData(userData)
        
        // Redirect to dashboard
        console.log('Redirecting to dashboard...')
        router.push('/dashboard')
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        // Still redirect, user data will be fetched later
        console.log('Redirecting to dashboard anyway...')
        router.push('/dashboard')
      }
    },
    onError: (error: any) => {
      console.error('=== LOGIN ERROR DEBUG ===')
      console.error('Full error object:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      console.error('=========================')
      
      // Extract error message from different possible error structures
      let message = 'Invalid credentials. Please try again.'
      
      if (error.response?.data?.message) {
        message = error.response.data.message
      } else if (error.response?.data?.error) {
        message = error.response.data.error
      } else if (error.message) {
        message = error.message
      }
      
      setError('root', { message })
    },
  })

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data)
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your account to continue learning
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              {...register('username')}
              className={errors.username ? 'border-red-500' : ''}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password')}
                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Sign up here
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
