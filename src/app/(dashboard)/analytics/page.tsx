"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthManager } from '@/lib/auth';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { PageWrapper } from '@/components/layout/PageWrapper';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, BookOpen, Shield, AlertTriangle, RefreshCw } from 'lucide-react';
import { User } from '@/types';
import { useTranslation } from 'react-i18next';

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

  const getRoleInfo = () => {
    if (user?.role_id === 3) return {
      title: t('dashboard_administrator'),
      description: t('admin_analytics_description'),
      icon: Shield,
      color: 'red'
    };
    if (user?.role_id === 2) return {
      title: t('dashboard_instructor'),
      description: t('instructor_analytics_description'),
      icon: Users,
      color: 'green'
    };
    return {
      title: t('dashboard_student'),
      description: t('student_analytics_description'),
      icon: BookOpen,
      color: 'blue'
    };
  };

  const roleInfo = getRoleInfo();

  return (
    <PageWrapper
      title={t('analytics_page_title')}
      description={t('analytics_page_description')}
      icon={BarChart3}
      iconColor="purple"
      badge={roleInfo.title}
      actions={
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      }
      headerContent={
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              roleInfo.color === 'blue' ? 'bg-blue-100' : 
              roleInfo.color === 'green' ? 'bg-green-100' : 
              'bg-red-100'
            }`}>
              <roleInfo.icon className={`h-5 w-5 ${
                roleInfo.color === 'blue' ? 'text-blue-600' : 
                roleInfo.color === 'green' ? 'text-green-600' : 
                'text-red-600'
              }`} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{roleInfo.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{roleInfo.description}</p>
            </div>
          </div>
        </div>
      }
    >
      {/* Analytics Dashboard Component */}
      <AnalyticsDashboard 
        className="space-y-6"
        timeRange="month"
        compact={false}
      />
    </PageWrapper>
  );
}