"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthManager } from '@/lib/auth';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, BookOpen, Shield, AlertTriangle } from 'lucide-react';
import { User } from '@/types';
import { useTranslation } from 'react-i18next'; // Added import

export default function AnalyticsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();
  const { t } = useTranslation(); // Added useTranslation hook

  useEffect(() => {
    // Check authentication and permissions
    if (!AuthManager.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const userData = AuthManager.getUserData();
    if (!userData) {
      router.push('/login');
      return;
    }

    setUser(userData);

    // Check if user has access to analytics
    // Allow access for admin, instructor, and students (all roles get different views)
    const allowedRoles = ['admin', 'instructor', 'guru', 'student', 'siswa'];
    const userHasAccess = AuthManager.hasAnyRole(allowedRoles);
    
    setHasAccess(userHasAccess);
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('access_denied_title')}
            </h3>
            <p className="text-gray-600">
              {t('access_denied_analytics_message')}
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              {t('back_to_dashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('analytics_page_title')}</h1>
              <p className="text-gray-600">
                {t('analytics_page_description')}
              </p>
            </div>
          </div>
          
          {/* Role-based description */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {user?.role_id === 3 ? (
                  <Shield className="h-5 w-5 text-blue-600" />
                ) : user?.role_id === 2 ? (
                  <Users className="h-5 w-5 text-green-600" />
                ) : (
                  <BookOpen className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {user?.role_id === 3 && t('dashboard_administrator')}
                  {user?.role_id === 2 && t('dashboard_instructor')}
                  {user?.role_id === 1 && t('dashboard_student')}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {user?.role_id === 3 && t('admin_analytics_description')}
                  {user?.role_id === 2 && t('instructor_analytics_description')}
                  {user?.role_id === 1 && t('student_analytics_description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard Component */}
        <AnalyticsDashboard 
          className="space-y-6"
          timeRange="month"
          compact={false}
        />
      </div>
    </div>
  );
}