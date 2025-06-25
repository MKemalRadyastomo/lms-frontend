'use client'

import { useEffect } from 'react'
import { AuthManager } from '@/lib/auth'

export default function TestDashboard() {
  useEffect(() => {
    console.log('=== DASHBOARD DEBUG INFO ===')
    console.log('Is authenticated:', AuthManager.isAuthenticated())
    console.log('Auth token:', AuthManager.getAuthToken())
    console.log('User ID:', AuthManager.getUserId())
    console.log('User data:', AuthManager.getUserData())
    
    // Test cookie directly
    console.log('=== COOKIE DEBUG ===')
    console.log('All cookies:', document.cookie)
    console.log('====================')
    console.log('==========================')
  }, [])

  // Test function to manually set auth data
  const testSetAuth = () => {
    console.log('Testing manual auth setup...')
    AuthManager.setAuthTokens({
      token: 'test-token-123',
      userId: 999
    })
    AuthManager.setUserData({
      id: 999,
      username: 'testuser',
      email: 'test@example.com',
      role_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    
    console.log('After manual setup:')
    console.log('Is authenticated:', AuthManager.isAuthenticated())
    console.log('Auth token:', AuthManager.getAuthToken())
    console.log('User ID:', AuthManager.getUserId())
    
    // Force re-render
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">🎉 Dashboard Test Page</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Authenticated:</strong> {AuthManager.isAuthenticated() ? '✅ Yes' : '❌ No'}</p>
            <p><strong>User ID:</strong> {AuthManager.getUserId() || 'Not found'}</p>
            <p><strong>Has Token:</strong> {AuthManager.getAuthToken() ? '✅ Yes' : '❌ No'}</p>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">User Data:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(AuthManager.getUserData(), null, 2)}
            </pre>
          </div>
          
          <div className="mt-6">
            <button 
              onClick={testSetAuth}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-4"
            >
              Test Manual Auth Setup
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-4"
            >
              Go to Real Dashboard
            </button>
            <button 
              onClick={() => {
                AuthManager.clearAuth()
                window.location.href = '/login'
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout & Clear Auth
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
