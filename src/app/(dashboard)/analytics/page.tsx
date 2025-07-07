"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthManager } from '@/lib/auth';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { NavigationDebug } from '@/components/debug/NavigationDebug';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, BookOpen, Shield, AlertTriangle } from 'lucide-react';
import { User } from '@/types';

export default function AnalyticsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

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
              Akses Ditolak
            </h3>
            <p className="text-gray-600">
              Anda tidak memiliki izin untuk mengakses halaman analytics.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Debug Navigation Test */}
        {process.env.NODE_ENV === 'development' && <NavigationDebug />}
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">
                Analisis mendalam tentang performa pembelajaran dan sistem
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
                  {user?.role_id === 3 && 'Dashboard Administrator'}
                  {user?.role_id === 2 && 'Dashboard Instructor'}
                  {user?.role_id === 1 && 'Dashboard Siswa'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {user?.role_id === 3 && 'Lihat statistik sistem, performa pengguna, dan metrik platform secara keseluruhan.'}
                  {user?.role_id === 2 && 'Pantau performa kelas, analisis siswa, dan efektivitas pembelajaran.'}
                  {user?.role_id === 1 && 'Lacak kemajuan belajar, performa tugas, dan pencapaian akademik Anda.'}
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
