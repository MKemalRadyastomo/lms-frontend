"use client";

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Home, 
  BookOpen, 
  BarChart3, 
  User, 
  Users,
  Bug,
  Navigation,
  ArrowRight,
  CheckCircle,
  XCircle
} from 'lucide-react';

export function NavigationDebug() {
  const router = useRouter();
  const pathname = usePathname();
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const navigationRoutes = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Users', href: '/users', icon: Users },
  ];

  const testNavigation = async (href: string) => {
    try {
      console.log(`Testing navigation to: ${href}`);
      
      // Test programmatic navigation
      router.push(href);
      
      // Wait longer for navigation to complete and check pathname
      setTimeout(() => {
        const currentPath = window.location.pathname;
        if (currentPath === href) {
          console.log(`✅ Navigation to ${href} successful`);
          setTestResults(prev => ({ ...prev, [href]: true }));
        } else {
          console.log(`❌ Navigation to ${href} failed - Current path: ${currentPath}`);
          setTestResults(prev => ({ ...prev, [href]: false }));
        }
      }, 1000); // Increased from 100ms to 1000ms
      
    } catch (error) {
      console.error(`Error navigating to ${href}:`, error);
      setTestResults(prev => ({ ...prev, [href]: false }));
    }
  };

  const testAllNavigation = async () => {
    console.log('🔍 Testing all navigation routes...');
    
    // Clear previous results
    setTestResults({});
    
    // Test routes sequentially with delay between each
    for (let i = 0; i < navigationRoutes.length; i++) {
      const route = navigationRoutes[i];
      setTimeout(() => {
        console.log(`Testing route ${i + 1}/${navigationRoutes.length}: ${route.href}`);
        testNavigation(route.href);
      }, i * 1500); // 1.5 second delay between each test
    }
  };

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-800">
          <Bug className="h-5 w-5 mr-2" />
          Navigation Debug Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <div>
            <p className="text-sm font-medium text-gray-900">Current Page</p>
            <p className="text-lg font-bold text-blue-600">{pathname}</p>
          </div>
          <Badge variant="outline" className="bg-blue-50">
            Active
          </Badge>
        </div>

        {/* Navigation Test Buttons */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Navigation Tests</h4>
            <Button 
              onClick={testAllNavigation}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
            >
              Test All Routes
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {navigationRoutes.map((route) => {
              const Icon = route.icon;
              const testResult = testResults[route.href];
              const isCurrentPage = pathname === route.href;
              
              return (
                <div key={route.href} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                  <Icon className="h-4 w-4 text-gray-600" />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{route.name}</span>
                      {isCurrentPage && (
                        <Badge variant="default" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{route.href}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Test Result */}
                    {testResult !== undefined && (
                      testResult ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )
                    )}
                    
                    {/* Test Buttons */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testNavigation(route.href)}
                      className="text-xs px-2 py-1"
                    >
                      Test
                    </Button>
                    
                    {/* Link Test */}
                    <Link 
                      href={route.href}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Link
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Console Logs */}
        <div className="p-3 bg-gray-900 text-green-400 rounded-lg text-xs font-mono max-h-32 overflow-y-auto">
          <p>// Check browser console for detailed navigation logs</p>
          <p>// Current pathname: {pathname}</p>
          <p>// Router available: {router ? '✓' : '✗'}</p>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Test programmatic navigation with the "Test" buttons</p>
          <p>• Test Link components with the "Link" buttons</p>
          <p>• Check browser console for detailed error logs</p>
          <p>• This component will be removed in production</p>
        </div>
      </CardContent>
    </Card>
  );
}
