"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, MenuItem, Divider, ListItemIcon, ListItemText } from "@mui/material";
import { useState } from "react";
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const userMenuOpen = Boolean(anchorEl);

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

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
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
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer"
              onClick={handleUserMenuClick}
            >
              <UserAvatar user={user} profile={profile} size={40} />
            </motion.div>
            <Menu
              anchorEl={anchorEl}
              open={userMenuOpen}
              onClose={handleUserMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    minWidth: 200,
                  },
                },
              }}
            >
              <MenuItem
                component={Link}
                href={user ? `/users/${user.id}` : "/profile"}
                onClick={handleUserMenuClose}
                sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}
              >
                <div className="font-semibold text-sm text-foreground leading-tight">
                  {profile?.display_name || user?.username}
                </div>
                <div className="text-xs text-foreground-secondary mt-1 leading-tight">
                  {userRole === "client" ? "Заказчик" : "Фрилансер"}
                </div>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  handleUserMenuClose();
                  user && router.push(`/users/${user.id}`);
                }}
              >
                <ListItemIcon>
                  <UserIcon size={16} />
                </ListItemIcon>
                <ListItemText>Публичный профиль</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleUserMenuClose();
                  router.push("/settings");
                }}
              >
                <ListItemIcon>
                  <Settings size={16} />
                </ListItemIcon>
                <ListItemText>Настройки</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handleLogout}
                sx={{ color: 'rgb(248 113 113)' }}
              >
                <ListItemIcon>
                  <LogOut size={16} style={{ color: 'rgb(248 113 113)' }} />
                </ListItemIcon>
                <ListItemText>Выход</ListItemText>
              </MenuItem>
            </Menu>
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

