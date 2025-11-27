"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { useAuth, useMobileMenu } from "@/src/shared/lib/hooks";
import { useAsyncOperation } from "@/src/shared/lib/hooks/useAsyncOperation";
import { DesktopDock, UserAvatar, DashboardMobileMenu } from "@/src/shared/ui";
import { NotificationBell } from "@/src/widgets/Notifications";
import { RoleSwitcher } from "@/src/features/user/role-switcher";
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  UserIcon,
  LogOut,
  Settings,
  FileText,
  FolderKanban,
} from "lucide-react";

export function DashboardDockHeader() {
  const { isOpen: mobileMenuOpen, toggle: toggleMobileMenu, close: closeMobileMenu } = useMobileMenu();
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, userRole } = useAuth({ requireAuth: false });

  const { execute: executeLogout } = useAsyncOperation<void, void>(
    async () => {
      await authService.logout();
      router.push("/auth/login");
    },
    {
      onError: (error) => {
        console.error("Logout error:", error);
        router.push("/auth/login");
      },
    }
  );

  const handleLogout = () => {
    executeLogout();
  };

  const isFreelancer = userRole === "freelancer";

  const navItems = [
    { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
    { href: "/orders", label: "Заказы", icon: Briefcase },
    { href: "/messages", label: "Сообщения", icon: MessageSquare },
    { href: "/profile", label: "Профиль", icon: UserIcon },
  ];

  if (isFreelancer) {
    navItems.push({ href: "/proposals", label: "Отклики", icon: FileText });
    navItems.push({ href: "/portfolio", label: "Портфолио", icon: FolderKanban });
  }

  const mobileNavItems = navItems.map((item) => ({
    key: item.href,
    label: item.label,
    icon: item.icon,
  }));

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: (
        <Link href={user ? `/users/${user.id}` : "/profile"} className="block">
          <div className="px-2 py-2">
            <div className="font-semibold text-sm text-foreground leading-tight">
              {profile?.display_name || user?.username}
            </div>
            <div className="text-xs text-foreground-secondary mt-1 leading-tight">
              {userRole === "client" ? "Заказчик" : "Фрилансер"}
            </div>
          </div>
        </Link>
      ),
    },
    { type: "divider" },
    {
      key: "public-profile",
      label: (
        <div className="flex items-center gap-1" style={{ margin: 0, padding: 0 }}>
          <UserIcon size={16} style={{ flexShrink: 0, margin: 0 }} />
          <span style={{ margin: 0, padding: 0 }}>Публичный профиль</span>
        </div>
      ),
      onClick: () => user && router.push(`/users/${user.id}`),
    },
    {
      key: "settings",
      label: (
        <div className="flex items-center gap-1" style={{ margin: 0, padding: 0 }}>
          <Settings size={16} style={{ flexShrink: 0, margin: 0 }} />
          <span style={{ margin: 0, padding: 0 }}>Настройки</span>
        </div>
      ),
      onClick: () => router.push("/settings"),
    },
    { type: "divider" },
    {
      key: "logout",
      label: (
        <div className="flex items-center gap-1 text-red-400" style={{ margin: 0, padding: 0 }}>
          <LogOut size={16} style={{ flexShrink: 0, margin: 0 }} />
          <span style={{ margin: 0, padding: 0 }}>Выход</span>
        </div>
      ),
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <>
      {/* Desktop macOS Dock Bar */}
      <DesktopDock
        logoHref="/dashboard"
        navItems={navItems}
        pathname={pathname}
        actions={
          <>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <RoleSwitcher />
            </div>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
              >
                <UserAvatar user={user} profile={profile} size={40} />
              </motion.div>
            </Dropdown>
          </>
        }
      />

      {/* Mobile Header */}
      <DashboardMobileMenu
        isOpen={mobileMenuOpen}
        onToggle={toggleMobileMenu}
        onClose={closeMobileMenu}
        brandName="MyFreelance"
        user={user}
        profile={profile}
        userRole={userRole || undefined}
        navItems={mobileNavItems}
        pathname={pathname}
        additionalContent={
          <div className="px-2">
            <div className="text-sm font-semibold text-foreground-secondary mb-3">
              Переключить роль
            </div>
            <RoleSwitcher />
          </div>
        }
        actions={
          <>
            <button
              className="w-full flex items-center justify-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors text-foreground-secondary hover:text-primary"
              style={{
                background: "var(--primary-10)",
              }}
              onClick={() => {
                closeMobileMenu();
                router.push("/settings");
              }}
            >
              <Settings size={18} style={{ flexShrink: 0 }} />
              <span>Настройки</span>
            </button>
            <button
              className="w-full flex items-center justify-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors text-red-400 hover:bg-red-400/10"
              onClick={() => {
                closeMobileMenu();
                handleLogout();
              }}
            >
              <LogOut size={18} style={{ flexShrink: 0 }} />
              <span>Выход</span>
            </button>
          </>
        }
      />

      {/* Spacer */}
      <div className="hidden lg:block" style={{ height: "6.5rem", minHeight: "6.5rem" }} />
      <div className="lg:hidden" style={{ height: mobileMenuOpen ? "auto" : "4rem", minHeight: "4rem" }} />
    </>
  );
}

