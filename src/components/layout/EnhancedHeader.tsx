"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserDropdown } from "./UserDropdown";
import { useScrollBehavior } from "@/hooks/useScrollBehavior";
import { Bell, Menu, Search } from "lucide-react";
import { User } from "@/types";
import { cn } from "@/lib/utils";

interface EnhancedHeaderProps {
  user: User | null;
  onMenuClick: () => void;
  className?: string;
}

export function EnhancedHeader({ user, onMenuClick, className }: EnhancedHeaderProps) {
  const { isScrolled, isHeaderVisible } = useScrollBehavior({
    threshold: 10,
    hideOnScrollDown: true,
    showOnScrollUp: true,
    debounceMs: 10
  });

  return (
    <div 
      className={cn(
        // Base styles
        "sticky top-0 z-30 transition-all duration-300 ease-in-out",
        // Scroll-based styles
        isScrolled 
          ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200/80" 
          : "bg-white border-b border-gray-200",
        // Visibility based on scroll direction
        isHeaderVisible 
          ? "translate-y-0 opacity-100" 
          : "-translate-y-full opacity-95",
        className
      )}
    >
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left section: Menu & Search */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden hover:bg-gray-100/80 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Search bar - Hidden on mobile, visible on desktop */}
          <div className="hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
              <Input
                placeholder="Cari kursus, tugas..."
                className={cn(
                  "pl-10 w-96 border-gray-200 focus:border-blue-300 focus:ring-blue-100/50 transition-all duration-200",
                  "placeholder:text-gray-400 text-sm",
                  "hover:border-gray-300 hover:shadow-sm",
                  "focus:shadow-md focus:shadow-blue-100/50"
                )}
              />
            </div>
          </div>
        </div>

        {/* Right section: Notifications & User */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-gray-100/80 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {/* Notification badge - can be made dynamic */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </span>
          </Button>

          {/* User dropdown */}
          <UserDropdown user={user} />
        </div>
      </div>

      {/* Mobile search bar - Shows below header on mobile */}
      <div className="md:hidden px-4 pb-3 border-t border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari kursus, tugas..."
            className="pl-10 border-gray-200 focus:border-blue-300 focus:ring-blue-100 transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
}

export default EnhancedHeader;
