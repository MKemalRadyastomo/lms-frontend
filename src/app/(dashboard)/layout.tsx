"use client";

import {
  Bell,
  BookOpen,
  Home,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  User as UserIcon,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  // Memoize the logout handler
  const handleLogout = useCallback(async () => {
    console.log("Logout initiated."); // Debug log
    try {
      AuthManager.clearAuth();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API call fails
      AuthManager.clearAuth();
      router.push("/login");
    }
  }, [router]);

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

        {/* User info and logout */}
        <div className="mt-auto p-4 border-t bg-gray-50">
          <div className="flex items-center space-x-3 mb-3 p-2 rounded-lg bg-white shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              {user?.first_name?.[0] ||
                user?.username?.[0]?.toUpperCase() ||
                "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.first_name && user?.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user?.username || "User"}
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "user@example.com"}
                </p>
                <span
                  className={`
                  inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                  ${
                    user?.role_id === 3
                      ? "bg-purple-100 text-purple-800"
                      : user?.role_id === 2
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }
                `}
                >
                  {user?.role_id === 3
                    ? "Admin"
                    : user?.role_id === 2
                    ? "Guru"
                    : "Siswa"}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 rounded-lg"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="lg:hidden hover:bg-gray-100 transition-colors duration-200"
              >
                <Menu className="h-6 w-6" />
              </Button>

              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search courses, assignments..."
                    className="pl-10 w-96 border-gray-200 focus:border-blue-300 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-100 transition-colors duration-200"
              >
                <Bell className="h-5 w-5" />
                {/* Notification badge - can be made dynamic */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </span>
              </Button>

              <div className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                  {user?.first_name?.[0] ||
                    user?.username?.[0]?.toUpperCase() ||
                    "U"}
                </div>
                <div className="hidden md:block">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.username || "User"}
                  </span>
                  <span
                    className={`
                    block text-xs font-medium
                    ${
                      user?.role_id === 3
                        ? "text-purple-600"
                        : user?.role_id === 2
                        ? "text-green-600"
                        : "text-blue-600"
                    }
                  `}
                  >
                    {user?.role_id === 3
                      ? "Administrator"
                      : user?.role_id === 2
                      ? "Guru"
                      : "Siswa"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}