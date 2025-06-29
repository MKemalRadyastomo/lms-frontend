"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Shield,
  GraduationCap,
  BookOpen
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthManager } from "@/lib/auth";
import { User as UserType } from "@/types";

interface UserDropdownProps {
  user: UserType;
  className?: string;
}

export function UserDropdown({ user, className = "" }: UserDropdownProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      AuthManager.clearAuth();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API call fails
      AuthManager.clearAuth();
      router.push("/login");
    }
  };

  const handleProfileView = () => {
    router.push("/profile");
  };

  const handleSettings = () => {
    router.push("/profile?tab=settings");
  };

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
          color: "text-purple-600",
          bgColor: "bg-purple-100",
          icon: Shield
        };
      case 2:
        return {
          name: "Guru",
          color: "text-green-600", 
          bgColor: "bg-green-100",
          icon: GraduationCap
        };
      default:
        return {
          name: "Siswa",
          color: "text-blue-600",
          bgColor: "bg-blue-100", 
          icon: BookOpen
        };
    }
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`h-12 px-3 hover:bg-gray-50/80 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${className}`}
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8 shadow-sm ring-2 ring-white">
              <AvatarImage 
                src={user?.profile_picture_url} 
                alt={displayName}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
                {avatarInitials}
              </AvatarFallback>
            </Avatar>
            
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                {displayName}
              </div>
              <div className={`text-xs font-medium ${roleInfo.color} flex items-center space-x-1`}>
                <RoleIcon className="h-3 w-3" />
                <span>{roleInfo.name}</span>
              </div>
            </div>
            
            <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-64 shadow-lg border border-gray-200/80 backdrop-blur-sm bg-white/95"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2 p-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 shadow-sm">
                <AvatarImage 
                  src={user?.profile_picture_url} 
                  alt={displayName}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                  {avatarInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${roleInfo.bgColor} ${roleInfo.color}`}>
                <RoleIcon className="h-3 w-3 mr-1" />
                {roleInfo.name}
              </span>
              {user?.role_id === 3 && (
                <span className="text-xs text-purple-600 font-medium">
                  Admin Access
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleProfileView}
          className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
        >
          <User className="mr-3 h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Lihat Profil</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleSettings}
          className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
        >
          <Settings className="mr-3 h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Pengaturan</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer hover:bg-red-50 hover:text-red-700 transition-colors duration-150 focus:bg-red-50 focus:text-red-700"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="text-sm font-medium">Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserDropdown;
