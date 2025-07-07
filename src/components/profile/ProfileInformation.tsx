"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";
import { 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  User as UserIcon,
  Clock,
  Shield,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ProfileInformationProps {
  user: User;
}

export function ProfileInformation({ user }: ProfileInformationProps) {
  // Format dates
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Tidak diketahui";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: id });
    } catch {
      return "Tidak diketahui";
    }
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return "Tidak diketahui";
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: id });
    } catch {
      return "Tidak diketahui";
    }
  };

  // Get role information
  const getRoleInfo = () => {
    switch (user?.role_id) {
      case 3:
        return {
          name: "Administrator",
          description: "Akses penuh ke sistem",
          color: "bg-purple-100 text-purple-700 border-purple-200",
        };
      case 2:
        return {
          name: "Guru",
          description: "Dapat mengelola kursus dan tugas",
          color: "bg-green-100 text-green-700 border-green-200",
        };
      default:
        return {
          name: "Siswa",
          description: "Dapat mengikuti kursus dan mengerjakan tugas",
          color: "bg-blue-100 text-blue-700 border-blue-200",
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-gray-600" />
            Informasi Pribadi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Full Name */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-600">Nama Lengkap</span>
            <span className="text-sm text-gray-900 font-medium">
              {user?.first_name && user?.last_name
                ? `${user.first_name} ${user.last_name}`
                : user?.username || "Belum diatur"}
            </span>
          </div>

          {/* Username */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-600">Username</span>
            <span className="text-sm text-gray-900 font-medium">
              {user?.username || "Belum diatur"}
            </span>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-600 flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-900 font-medium">
                {user?.email || "Belum diatur"}
              </span>
              {user?.email_verified_at && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-600 flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Telepon
            </span>
            <span className="text-sm text-gray-900 font-medium">
              {user?.phone || "Belum diatur"}
            </span>
          </div>

          {/* Date of Birth */}
          {user?.date_of_birth && (
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <span className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Tanggal Lahir
              </span>
              <span className="text-sm text-gray-900 font-medium">
                {formatDate(user.date_of_birth)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role & Permissions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Shield className="h-5 w-5 mr-2 text-gray-600" />
            Peran & Hak Akses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-600">Peran</span>
            <Badge className={`${roleInfo.color} border font-medium`}>
              {roleInfo.name}
            </Badge>
          </div>

          <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-600">Deskripsi</span>
            <span className="text-sm text-gray-900 text-right max-w-xs">
              {roleInfo.description}
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-600">Status Akun</span>
            <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
              Aktif
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Account Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-600" />
            Aktivitas Akun
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-600">Tanggal Bergabung</span>
            <span className="text-sm text-gray-900 font-medium">
              {formatDate(user?.created_at)}
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-600">Terakhir Diperbarui</span>
            <span className="text-sm text-gray-900 font-medium">
              {formatDate(user?.updated_at)}
            </span>
          </div>

          {user?.last_login_at && (
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <span className="text-sm font-medium text-gray-600">Login Terakhir</span>
              <span className="text-sm text-gray-900 font-medium">
                {formatDateTime(user.last_login_at)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bio Section */}
      {user?.bio && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 leading-relaxed">
              {user.bio}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProfileInformation;
