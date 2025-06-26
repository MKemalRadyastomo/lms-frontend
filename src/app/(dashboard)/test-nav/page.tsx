'use client'

import { NavigationTest } from '@/components/debug/navigation-test'

export default function TestNavPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 Navigation Test Page
          </h1>
          <p className="text-gray-600">
            This page helps test navigation functionality across the dashboard.
          </p>
        </div>

        <NavigationTest />

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Navigation Debug Information</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">✅ Expected Behavior</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Navigation links should work from any page</li>
                <li>• Active page should be highlighted</li>
                <li>• Click events should be logged to console</li>
                <li>• Navigation should close on mobile after clicking</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">🔍 Debugging Steps</h3>
              <ol className="text-sm text-yellow-800 space-y-1">
                <li>1. Open browser console (F12)</li>
                <li>2. Navigate to dashboard page</li>
                <li>3. Try clicking navigation links</li>
                <li>4. Check console for navigation logs</li>
                <li>5. Compare behavior between dashboard and this page</li>
              </ol>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">🎯 Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => window.location.href = '/courses'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Go to Courses
                </button>
                <button
                  onClick={() => window.location.href = '/profile'}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Go to Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">Console Output</h2>
          <p className="text-sm text-gray-600 mb-2">
            Check your browser console for these messages:
          </p>
          <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs">
            🧭 Regenerating navigation items for user: [role_id]<br/>
            🔗 Navigation clicked: /dashboard<br/>
            Navigation Test - Link clicked: /dashboard
          </div>
        </div>
      </div>
    </div>
  )
}
