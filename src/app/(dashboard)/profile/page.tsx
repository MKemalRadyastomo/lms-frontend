"use client";

import { PasswordChangeModal } from "@/components/profile/PasswordChangeModal";
import { ProfileEditModal } from "@/components/profile/ProfileEditModal";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInformation } from "@/components/profile/ProfileInformation";
import { ProfilePictureModal } from "@/components/profile/ProfilePictureModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { AuthManager } from "@/lib/auth";
import { User } from "@/types";
import { RefreshCw, Settings, Shield, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useToast } from "@/components/ui/use-toast";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useTranslation } from "react-i18next";

export default function ProfilePage() {
  const { toast: uiToast } = useToast();
  const { t } = useTranslation();
  
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
          router.push("/login");
          return;
        }

        setUser(currentUser);
      } catch (error) {
        const errorMessage = t('profile_load_failed');
        setError(errorMessage);
        toast.error(errorMessage);
        uiToast({
          title: t('profile_load_failed'),
          description: errorMessage,
          variant: 'destructive'
        });
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
    toast.success(t('profile_updated_successfully'));
  };

  // Handle picture update success
  const handlePictureUpdateSuccess = (pictureUrl: string) => {
    if (user) {
      const updatedUser = { ...user, profile_picture_url: pictureUrl };
      setUser(updatedUser);
      AuthManager.updateUserData(updatedUser);
    }
    toast.success(t('profile_picture_updated_successfully'));
  };


  return (
    <ErrorBoundary>
      <ProfilePageContent
        user={user}
        isLoading={isLoading}
        error={error}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        isPictureModalOpen={isPictureModalOpen}
        setIsPictureModalOpen={setIsPictureModalOpen}
        isPasswordModalOpen={isPasswordModalOpen}
        setIsPasswordModalOpen={setIsPasswordModalOpen}
        router={router}
        handleProfileUpdateSuccess={handleProfileUpdateSuccess}
        handlePictureUpdateSuccess={handlePictureUpdateSuccess}
      />
    </ErrorBoundary>
  );
}

// Separate component for the main content to isolate any potential errors
function ProfilePageContent({
  user,
  isLoading,
  error,
  isEditModalOpen,
  setIsEditModalOpen,
  isPictureModalOpen,
  setIsPictureModalOpen,
  isPasswordModalOpen,
  setIsPasswordModalOpen,
  router,
  handleProfileUpdateSuccess,
  handlePictureUpdateSuccess,
}: any) {
  const { t } = useTranslation();
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
              {t('profile_load_failed')}
            </h3>
            <p className="text-gray-600">
              {error || t('profile_load_error_message')}
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('try_again')}
              </Button>
              <Button onClick={() => router.push("/dashboard")}>
                {t('back_to_dashboard')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageWrapper
      title={t('my_profile')}
      description={t('manage_profile_description')}
      icon={UserIcon}
      iconColor="green"
      variant="simple"
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center"
          >
            <Shield className="h-4 w-4 mr-2" />
            {t('change_password')}
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/profile/settings")}
            className="flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            {t('settings')}
          </Button>
        </div>
      }
    >
      <div className="space-y-8">

        {/* Profile Header */}
        <ProfileHeader
          user={user}
          onEditProfile={() => setIsEditModalOpen(true)}
          onEditPicture={() => setIsPictureModalOpen(true)}
          isOwnProfile={true}
        />

        {/* Profile Information */}
        <div className="max-w-4xl">
          <ProfileInformation user={user} />
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
    </PageWrapper>
  );
}
