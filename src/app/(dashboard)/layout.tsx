'use client';

import { BookOpen, Home, Settings, Shield, User as UserIcon, Users, X, BarChart3 } from "lucide-react";
import { Branding } from "@/components/layout/Branding";
import { EnhancedHeader } from "@/components/layout/EnhancedHeader";
import { DynamicBreadcrumb } from "@/components/layout/DynamicBreadcrumb";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { AuthManager } from "@/lib/auth";
import { User } from "@/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(AuthManager.getUserData());
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Memoize navigation items to prevent re-creation on every render
  const navigationItems = useMemo(() => {
    if (!isMounted) return [];
    const baseItems = [
      { name: t("dashboard"), href: "/dashboard", icon: Home },
      { name: t("courses"), href: "/courses", icon: BookOpen },
      { name: t("assignments"), href: "/assignments", icon: BookOpen },
      { name: t("analytics"), href: "/analytics", icon: BarChart3 },
      { name: t("profile"), href: "/profile", icon: UserIcon },
    ];

    // Add test page for development
    if (process.env.NODE_ENV === "development") {
      baseItems.push({ name: t("test"), href: "/test", icon: Settings });
      baseItems.push({
        name: t("nav_test"),
        href: "/test-nav",
        icon: Settings,
      });
    }

    // Add admin/instructor specific navigation
    if (
      user &&
      (AuthManager.hasRole("admin") ||
        AuthManager.hasRole("instructor") ||
        AuthManager.hasRole("guru"))
    ) {
      baseItems.splice(-1, 0, {
        name: t("users"),
        href: "/users",
        icon: Users,
      });
    }

    // Add admin navigation if user is admin
    if (user && AuthManager.hasRole("admin")) {
      baseItems.push({ name: t("admin_panel"), href: "/admin", icon: Shield });
    }

    return baseItems;
  }, [user?.role_id, t, isMounted]); // Only recalculate when user role changes or translation function changes

  // Memoize the active route check to prevent unnecessary re-renders
  const isActiveRoute = useCallback(
    (href: string) => {
      const isActive = pathname === href;
      return isActive;
    },
    [pathname]
  );

  // Memoize sidebar toggle
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className="min-h-screen bg-gray-50 flex"
      data-testid="dashboard-layout"
    >
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={closeSidebar}
          data-testid="dashboard-sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out 
        lg:relative lg:translate-x-0 lg:flex lg:flex-col
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
        data-testid="dashboard-sidebar"
      >
        <div className="flex items-center justify-between h-16 px-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <Branding showText={true} />
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSidebar}
            className="lg:hidden hover:bg-white/50 transition-colors duration-200"
            data-testid="dashboard-sidebar-close-button"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-6 px-3 flex-1">
          <div className="px-3 mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("navigation")}
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
                  data-testid={`dashboard-nav-link-${item.href.replace(
                    "/",
                    ""
                  )}`}
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
            {t("learning_management_system")}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Enhanced Header with scroll behavior */}
        <EnhancedHeader user={user} onMenuClick={toggleSidebar} />

        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <DynamicBreadcrumb />
        </div>

        {/* Page content */}
        <main
          className="flex-1 p-6 overflow-auto bg-gray-50"
          data-testid="dashboard-main-content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}