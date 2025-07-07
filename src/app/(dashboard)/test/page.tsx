'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPage() {
  const [testResults, setTestResults] = useState<string[]>([])

  // Test API version
  const { data: apiVersion, error: apiError } = useQuery({
    queryKey: ['api-version'],
    queryFn: () => apiClient.getApiVersion(),
  })

  // Test user fetching
  const { data: usersData, error: usersError } = useQuery({
    queryKey: ['users-test'],
    queryFn: () => apiClient.getUsers({ limit: 5 }),
  })

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testApiConnection = async () => {
    try {
      const version = await apiClient.getApiVersion()
      addTestResult(`✅ API Connection successful - Version: ${version.version}`)
    } catch (error) {
      addTestResult(`❌ API Connection failed: ${error}`)
    }
  }

  const testUserFetch = async () => {
    try {
      const users = await apiClient.getUsers({ limit: 3 })
      addTestResult(`✅ Users fetch successful - Found ${users.data.length} users`)
    } catch (error) {
      addTestResult(`❌ Users fetch failed: ${error}`)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Backend Integration Test</h1>
        <p className="text-gray-600">Test the connection and functionality with the backend API</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Status */}
        <Card>
          <CardHeader>
            <CardTitle>API Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>API Version:</strong>
              {apiError ? (
                <span className="text-red-600 ml-2">Error loading</span>
              ) : apiVersion ? (
                <span className="text-green-600 ml-2">{apiVersion.version}</span>
              ) : (
                <span className="text-gray-500 ml-2">Loading...</span>
              )}
            </div>
            
            <div>
              <strong>Release Date:</strong>
              {apiVersion && (
                <span className="ml-2">{apiVersion.release_date}</span>
              )}
            </div>

            <Button onClick={testApiConnection} className="w-full">
              Test API Connection
            </Button>
          </CardContent>
        </Card>

        {/* Users Data */}
        <Card>
          <CardHeader>
            <CardTitle>Users Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Users Count:</strong>
              {usersError ? (
                <span className="text-red-600 ml-2">Error loading</span>
              ) : usersData ? (
                <span className="text-green-600 ml-2">{usersData.pagination.total_items}</span>
              ) : (
                <span className="text-gray-500 ml-2">Loading...</span>
              )}
            </div>

            {usersData && usersData.data.length > 0 && (
              <div>
                <strong>Sample Users:</strong>
                <ul className="mt-2 space-y-1">
                  {usersData.data.slice(0, 3).map(user => (
                    <li key={user.id} className="text-sm text-gray-600">
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}` 
                        : user.username} ({user.email})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={testUserFetch} className="w-full">
              Test User Fetch
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
            {testResults.length === 0 ? (
              <p className="text-gray-500">Click the test buttons above to see results here...</p>
            ) : (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button 
            onClick={() => setTestResults([])} 
            variant="outline" 
            className="mt-4"
          >
            Clear Results
          </Button>
        </CardContent>
      </Card>

      {/* Raw Data Display */}
      {(apiVersion || usersData) && (
        <Card>
          <CardHeader>
            <CardTitle>Raw API Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiVersion && (
                <div>
                  <strong>API Version Response:</strong>
                  <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-xs overflow-auto">
                    {JSON.stringify(apiVersion, null, 2)}
                  </pre>
                </div>
              )}
              
              {usersData && (
                <div>
                  <strong>Users Response:</strong>
                  <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-xs overflow-auto">
                    {JSON.stringify(usersData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
