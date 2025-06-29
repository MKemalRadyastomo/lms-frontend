"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthManager } from '@/lib/auth';
import { profileApi } from '@/lib/api/profile';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileInformation } from '@/components/profile/ProfileInformation';
import { ProfileStatsComponent } from '@/components/profile/ProfileStats';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { ProfilePictureModal } from '@/components/profile/ProfilePictureModal';
import { PasswordChangeModal } from '@/components/profile/PasswordChangeModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, Shield, RefreshCw } from 'lucide-react';
import { User } from '@/types';
import { ProfileStats } from '@/types/profile';

export default function ProfilePage() {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPictureModalOpen, setIsPictureModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  const router = useRouter();

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const currentUser = AuthManager.getUserData();
        if (!currentUser) {
          router.push('/login');
          return;
        }

        setUser(currentUser);
        
        // Load user stats separately to avoid blocking the main UI
        setIsStatsLoading(true);
        try {
          const stats = await profileApi.getUserStats(currentUser.id.toString());
          setProfileStats(stats);
        } catch (statsError) {
          console.warn('Failed to load user stats:', statsError);
          // Set default stats if endpoint not available
          setProfileStats({
            coursesEnrolled: 0,
            assignmentsCompleted: 0,
            assignmentsPending: 0,
            totalSubmissions: 0,
            averageGrade: null,
            lastLoginAt: null,
            accountCreatedAt: currentUser.created_at,
            completionRate: 0,
          });
        } finally {
          setIsStatsLoading(false);
        }
        
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Gagal memuat data profil');
        toast.error('Gagal memuat data profil');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [router]);

  // Handle profile update success
  const handleProfileUpdateSuccess = (updatedUser: User) => {
    setUser(updatedUser);
    AuthManager.updateUserData(updatedUser);
    toast.success('Profil berhasil diperbarui');
  };

  // Handle picture update success
  const handlePictureUpdateSuccess = (pictureUrl: string) => {
    if (user) {
      const updatedUser = { ...user, profile_picture_url: pictureUrl };
      setUser(updatedUser);
      AuthManager.updateUserData(updatedUser);
    }
    toast.success('Foto profil berhasil diperbarui');
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      setIsStatsLoading(true);
      const stats = await profileApi.getUserStats(user.id.toString());
      setProfileStats(stats);
      toast.success('Data profil berhasil diperbarui');
    } catch (error) {
      console.error('Error refreshing profile:', error);
      toast.error('Gagal memperbarui data profil');
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          {/* Page Header Skeleton */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Profile Header Skeleton */}
          <Card className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-32" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="flex justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="h-12 w-12 rounded-full mb-3" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Gagal Memuat Profil
            </h3>
            <p className="text-gray-600">
              {error || 'Terjadi kesalahan saat memuat data profil Anda.'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Coba Lagi
              </Button>
              <Button onClick={() => router.push('/dashboard')}>
                Kembali ke Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
            <p className="text-gray-600 mt-1">
              Kelola informasi profil dan pengaturan akun Anda
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={refreshProfile}
              disabled={isStatsLoading}
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isStatsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center"
            >
              <Shield className="h-4 w-4 mr-2" />
              Ubah Password
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/profile/settings')}
              className="flex items-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              Pengaturan
            </Button>
          </div>
        </div>

        {/* Profile Header */}
        <ProfileHeader
          user={user}
          onEditProfile={() => setIsEditModalOpen(true)}
          onEditPicture={() => setIsPictureModalOpen(true)}
          isOwnProfile={true}
        />

        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Information */}
          <div className="lg:col-span-2">
            <ProfileInformation user={user} />
          </div>

          {/* Right Column: Statistics */}
          <div className="lg:col-span-1">
            {isStatsLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="p-6">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div>
                          <Skeleton className="h-6 w-16 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : profileStats ? (
              <ProfileStatsComponent 
                stats={profileStats} 
                userRole={user.role_id} 
              />
            ) : (
              <Card className="p-6 text-center">
                <p className="text-gray-500">Statistik tidak tersedia</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshProfile}
                  className="mt-3"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Coba Lagi
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Modals */}
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onUpdateSuccess={handleProfileUpdateSuccess}
        />

        <ProfilePictureModal
          isOpen={isPictureModalOpen}
          onClose={() => setIsPictureModalOpen(false)}
          user={user}
          onUpdateSuccess={handlePictureUpdateSuccess}
        />

        <PasswordChangeModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          userId={user.id.toString()}
        />
      </div>
    </div>
  );
}
