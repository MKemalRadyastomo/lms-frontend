"use client";

import {
  BookOpen,
  Home,
  Settings,
  Shield,
  User as UserIcon,
  Users,
  X,
} from "lucide-react";
import { EnhancedHeader } from "@/components/layout/EnhancedHeader";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { AuthManager } from "@/lib/auth";
import { User } from "@/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("Layout effect - checking auth");

    // Check authentication
    if (!AuthManager.isAuthenticated()) {
      console.log("User not authenticated, redirecting to login...");
      router.push("/login");
      return;
    }

    // Get user data
    const userData = AuthManager.getUserData();
    console.log("Layout - User data from storage:", userData);

    if (userData) {
      setUser(userData);
      setIsLoading(false);
    } else {
      // If no user data in storage, try to fetch it
      const userId = AuthManager.getUserId();
      console.log("No user data in storage, user ID:", userId);

      if (userId) {
        // We'll fetch user data in the dashboard page itself
        // For now, create a minimal user object to prevent infinite loading
        setUser({
          id: userId,
          username: "Loading...",
          email: "loading@example.com",
          role_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as User);
        setIsLoading(false);
      }
    }
  }, [router]);

  // Memoize navigation items to prevent re-creation on every render
  const navigationItems = useMemo(() => {
    console.log("🧭 Regenerating navigation items for user:", user?.role_id);
    
    const baseItems = [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "Kursus", href: "/courses", icon: BookOpen },
      { name: "Tugas", href: "/assignments", icon: BookOpen }, // Added Assignments link
      { name: "Profil", href: "/profile", icon: UserIcon },
    ];

    // Add test page for development
    if (process.env.NODE_ENV === "development") {
      baseItems.push({ name: "Test", href: "/test", icon: Settings });
      baseItems.push({ name: "Nav Test", href: "/test-nav", icon: Settings });
    }

    // Add admin/instructor specific navigation
    if (
      user &&
      (AuthManager.hasRole("admin") ||
        AuthManager.hasRole("instructor") ||
        AuthManager.hasRole("guru"))
    ) {
      baseItems.splice(-1, 0, {
        name: "Pengguna",
        href: "/users",
        icon: Users,
      });
    }

    // Add admin navigation if user is admin
    if (user && AuthManager.hasRole("admin")) {
      baseItems.push({ name: "Panel Admin", href: "/admin", icon: Shield });
    }

    console.log("Generated navigation items:", baseItems); // Debug log
    return baseItems;
  }, [user?.role_id]); // Only recalculate when user role changes

  // Memoize the active route check
  const isActiveRoute = useCallback((href: string) => {
    const isActive = pathname === href;
    console.log(`Checking active route: ${href}, current pathname: ${pathname}, isActive: ${isActive}`); // Debug log
    return isActive;
  }, [pathname]);



  // Memoize sidebar toggle
  const toggleSidebar = useCallback(() => {
    console.log("Toggling sidebar."); // Debug log
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    console.log("Closing sidebar."); // Debug log
    setIsSidebarOpen(false);
  }, []);

  // Early returns after hooks
  if (isLoading) {
    console.log("Layout: Loading state..."); // Debug log
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log("Layout: User not found, showing loading/redirecting."); // Debug log
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  console.log("Layout: Rendering DashboardLayout."); // Debug log
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out 
        lg:relative lg:translate-x-0 lg:flex lg:flex-col
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">LMS</span>
              <p className="text-xs text-gray-500 font-medium">
                Learning Management
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSidebar}
            className="lg:hidden hover:bg-white/50 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-6 px-3 flex-1">
          <div className="px-3 mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Navigation
            </h3>
          </div>
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = isActiveRoute(item.href);
              return (
                <Link
                  key={`nav-${item.href}`} // Stable key
                  href={item.href}
                  onClick={() => {
                    console.log(`🔗 Navigation clicked: ${item.href}`);
                    closeSidebar(); // Close sidebar on mobile after click
                  }}
                  className={`
                    w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group relative
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-lg" />
                  )}
                  <item.icon
                    className={`
                      mr-3 h-5 w-5 transition-colors duration-200
                      ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-500 group-hover:text-gray-700"
                      }
                    `}
                  />
                  <span
                    className={`font-medium ${
                      isActive
                        ? "text-blue-700"
                        : "text-gray-700 group-hover:text-gray-900"
                    }`}
                  >
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom spacing */}
        <div className="mt-auto p-4">
          <div className="text-xs text-gray-400 text-center">
            Learning Management System
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Enhanced Header with scroll behavior */}
        <EnhancedHeader user={user} onMenuClick={toggleSidebar} />

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}