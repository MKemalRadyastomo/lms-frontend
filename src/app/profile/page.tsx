"use client";

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { AuthManager } from '@/lib/auth';
import { User } from '@/types';
import { ProfileStats } from '@/types/profile';
import { profileApi } from '@/lib/api/profile';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileInformation } from '@/components/profile/ProfileInformation';
import { ProfileStatsComponent } from '@/components/profile/ProfileStats';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Shield, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPictureUpload, setShowPictureUpload] = useState(false);
  const queryClient = useQueryClient();

  // Get current user data
  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['profile', 'current'],
    queryFn: () => profileApi.getCurrentProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get user statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['profile', 'stats', user?.id],
    queryFn: () => user ? profileApi.getUserStats(user.id) : null,
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Handle profile update success
  const handleProfileUpdateSuccess = (updatedUser: User) => {
    // Update the query cache
    queryClient.setQueryData(['profile', 'current'], updatedUser);
    
    // Update AuthManager cache
    AuthManager.setUserData(updatedUser);
    
    toast.success('Profil berhasil diperbarui!');
  };

  // Handle profile picture upload success
  const handlePictureUploadSuccess = (newImageUrl: string) => {
    if (user) {
      const updatedUser = { ...user, profile_picture_url: newImageUrl };
      queryClient.setQueryData(['profile', 'current'], updatedUser);
      AuthManager.setUserData(updatedUser);
    }
    setShowPictureUpload(false);
    toast.success('Foto profil berhasil diperbarui!');
  };

  // Default stats if API doesn't return them
  const defaultStats: ProfileStats = {
    coursesEnrolled: 0,
    assignmentsCompleted: 0,
    assignmentsPending: 0,
    totalSubmissions: 0,
    averageGrade: null,
    lastLoginAt: user?.last_login_at || null,
    accountCreatedAt: user?.created_at || new Date().toISOString(),
    completionRate: 0,
  };

  const displayStats = stats || defaultStats;

  // Error handling
  if (userError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Gagal Memuat Profil
          </h2>
          <p className="text-red-600">
            Terjadi kesalahan saat memuat data profil. Silakan muat ulang halaman.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Skeleton */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>

        {/* Info Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-lg" />
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            Data Profil Tidak Ditemukan
          </h2>
          <p className="text-yellow-600">
            Silakan logout dan login kembali.
          </p>
        </div>
      </div>
    );
  }

  // Get user initials for avatar
  const userInitials = user?.first_name?.[0] ||
    user?.username?.[0]?.toUpperCase() ||
    "U";

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil Saya</h1>
        <p className="text-gray-600">
          Kelola informasi profil dan pengaturan akun Anda
        </p>
      </div>

      {/* Profile Header */}
      <ProfileHeader
        user={user}
        onEditProfile={() => setShowEditModal(true)}
        onEditPicture={() => setShowPictureUpload(true)}
        isOwnProfile={true}
      />

      {/* Profile Statistics */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <ProfileStatsComponent stats={displayStats} userRole={user.role_id} />
      )}

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProfileInformation user={user} />
        
        {/* Quick Actions Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Settings className="h-5 w-5 mr-2 text-gray-600" />
              Aksi Cepat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowEditModal(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Profil
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowPictureUpload(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Ubah Foto Profil
              </Button>

              {user.role_id === 3 && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('/admin', '_blank')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Panel Admin
                </Button>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Butuh bantuan? Hubungi administrator sistem.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <ProfileEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={user}
          onUpdateSuccess={handleProfileUpdateSuccess}
        />
      )}

      {/* Profile Picture Upload Modal */}
      <Dialog open={showPictureUpload} onOpenChange={setShowPictureUpload}>
        <DialogContent className="sm:max-w-[500px]">
          <ProfilePictureUpload
            userId={user.id}
            currentImageUrl={user.profile_picture_url}
            userInitials={userInitials}
            onUploadSuccess={handlePictureUploadSuccess}
            onCancel={() => setShowPictureUpload(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
