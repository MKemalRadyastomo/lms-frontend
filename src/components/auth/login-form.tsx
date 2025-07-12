'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { AuthResponse } from '@/types'
import { useToast } from '@/components/ui/use-toast'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

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
    onSuccess: async (data: AuthResponse) => {
      try {
        // Initialize secure session with enhanced security features
        AuthManager.initializeSession({
          token: data.token,
          userId: data.user_id,
        })
        
        // Fetch and store user data
        const userData = await apiClient.getUserById(data.user_id)
        AuthManager.setUserData(userData)
        
        // Show success message
        toast({
          title: 'Login Successful',
          description: 'Welcome back! Redirecting to dashboard...',
          variant: 'default'
        })
        
        // Redirect with a small delay to ensure cookies are properly set
        setTimeout(() => {
          window.location.href = '/dashboard' // Use window.location for full page reload to ensure middleware picks up cookies
        }, 800)
        
      } catch (error) {
        console.error('Error during login process:', error)
        toast({
          title: 'Login Error',
          description: 'Authentication failed. Please try again.',
          variant: 'destructive'
        })
        
        // Clear any partial auth state
        AuthManager.clearAuth()
        
        setError('root', { 
          message: 'Authentication failed. Please try again.' 
        })
      }
    },
    onError: (error: any) => {
      console.error('Login mutation error:', error)
      
      // Record failed attempt for security
      AuthManager.recordFailedAttempt('login')
      
      // Check if account is now locked
      if (AuthManager.isAccountLocked('login')) {
        const lockoutTime = AuthManager.getLockoutTimeRemaining('login')
        const minutes = Math.ceil(lockoutTime / (60 * 1000))
        
        toast({
          title: 'Account Temporarily Locked',
          description: `Too many failed attempts. Try again in ${minutes} minutes.`,
          variant: 'destructive'
        })
        
        setError('root', { 
          message: `Account locked. Try again in ${minutes} minutes.`,
          type: 'lockout'
        })
        return
      }
      
      // Extract error message from different possible error structures
      let message = 'Invalid credentials. Please try again.'
      
      if (error.response?.data?.message) {
        message = error.response.data.message
      } else if (error.response?.data?.error) {
        message = error.response.data.error
      } else if (error.message && error.message !== 'Network Error') {
        message = error.message
      }
      
      const failedAttempts = AuthManager.getFailedAttempts('login')
      const attemptsRemaining = 5 - failedAttempts.attempts
      
      if (attemptsRemaining > 0) {
        message += ` (${attemptsRemaining} attempts remaining)`
      }
      
      // Show toast for errors
      toast({
        title: 'Login Failed',
        description: message,
        variant: 'destructive'
      })
      
      // Set form error that persists until next submission
      setError('root', { 
        message,
        type: 'server'
      })
      
      // Don't reset form on error - let user see the error and try again
    },
  })

  const onSubmit = (data: LoginFormData) => {
    // Clear previous errors before new attempt
    setError('root', { message: '' })
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
            <Label htmlFor="username">Email</Label>
            <Input
              id="username"
              type="email"
              placeholder="Enter your email address"
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
      </CardContent>
    </Card>
  )
}
