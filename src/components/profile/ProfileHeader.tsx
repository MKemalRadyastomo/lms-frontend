"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit3, 
  Camera, 
  Shield, 
  GraduationCap, 
  BookOpen,
  Mail,
  Calendar,
  Clock
} from "lucide-react";
import { User } from "@/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ProfileHeaderProps {
  user: User;
  onEditProfile: () => void;
  onEditPicture: () => void;
  isOwnProfile?: boolean;
}

export function ProfileHeader({ 
  user, 
  onEditProfile, 
  onEditPicture, 
  isOwnProfile = true 
}: ProfileHeaderProps) {
  // Get user display name
  const displayName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.username || "User";

  // Get user avatar initials
  const avatarInitials = user?.first_name?.[0] ||
    user?.username?.[0]?.toUpperCase() ||
    "U";

  // Get role information
  const getRoleInfo = () => {
    switch (user?.role_id) {
      case 3:
        return {
          name: "Administrator",
          color: "bg-purple-100 text-purple-700 border-purple-200",
          icon: Shield
        };
      case 2:
        return {
          name: "Guru",
          color: "bg-green-100 text-green-700 border-green-200",
          icon: GraduationCap
        };
      default:
        return {
          name: "Siswa",
          color: "bg-blue-100 text-blue-700 border-blue-200",
          icon: BookOpen
        };
    }
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  // Format join date
  const joinDate = user?.created_at ? 
    format(new Date(user.created_at), "MMMM yyyy", { locale: id }) : 
    "Tidak diketahui";

  // Format last login
  const lastLogin = user?.last_login_at ? 
    format(new Date(user.last_login_at), "dd MMM yyyy, HH:mm", { locale: id }) : 
    "Tidak diketahui";

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-sm border border-gray-200/80 p-8">
      {/* Profile Header Content */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center lg:items-start">
          <div className="relative group">
            <Avatar className="h-32 w-32 shadow-lg ring-4 ring-white">
              <AvatarImage 
                src={user?.profile_picture_url} 
                alt={displayName}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-3xl font-bold">
                {avatarInitials}
              </AvatarFallback>
            </Avatar>
            
            {isOwnProfile && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onEditPicture}
                className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full shadow-lg bg-white hover:bg-gray-50 border-2 border-white"
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* User Info Section */}
        <div className="flex-1 space-y-4">
          {/* Name and Role */}
          <div className="text-center lg:text-left">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {displayName}
                </h1>
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <Badge className={`${roleInfo.color} border font-medium`}>
                    <RoleIcon className="h-3 w-3 mr-1" />
                    {roleInfo.name}
                  </Badge>
                  {user?.email_verified_at && (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Email Terverifikasi
                    </Badge>
                  )}
                </div>
              </div>
              
              {isOwnProfile && (
                <Button 
                  onClick={onEditProfile}
                  className="self-center lg:self-start"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profil
                </Button>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span className="font-medium mr-2">Bergabung:</span>
                <span>{joinDate}</span>
              </div>
              
              {user?.last_login_at && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium mr-2">Login terakhir:</span>
                  <span>{lastLogin}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <span className="font-medium mr-2">Email:</span>
                <span className="truncate">{user?.email}</span>
              </div>
              
              {user?.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium mr-2">Telepon:</span>
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {user?.bio && (
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Bio</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{user.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
