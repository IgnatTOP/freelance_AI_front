"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, MenuItem, Divider, ListItemIcon, ListItemText } from "@mui/material";
import { useState, useMemo } from "react";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { useAuth, useMobileMenu } from "@/src/shared/lib/hooks";
import { useAsyncOperation } from "@/src/shared/lib/hooks/useAsyncOperation";
import { DesktopDock, UserAvatar, DashboardMobileMenu, ThemeToggle } from "@/src/shared/ui";
import { NotificationBell } from "@/src/widgets/Notifications";
import { RoleSwitcher } from "@/src/features/user/role-switcher";
import { LayoutDashboard, Briefcase, MessageSquare, UserIcon, LogOut, Settings, FileText, FolderKanban, Layers, Wallet, Heart } from "lucide-react";

const getNavItems = (isFreelancer: boolean) => {
  const base = [
    { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
    { href: "/orders", label: "Биржа заказов", icon: Briefcase },
  ];

  if (isFreelancer) {
    return [
      ...base,
      { href: "/orders/in-progress", label: "Мои проекты", icon: FolderKanban },
      { href: "/messages", label: "Сообщения", icon: MessageSquare },
      { href: "/proposals", label: "Отклики", icon: FileText },
      { href: "/portfolio", label: "Портфолио", icon: Layers },
    ];
  }

  return [
    ...base,
    { href: "/my-orders", label: "Мои заказы", icon: FileText },
    { href: "/messages", label: "Сообщения", icon: MessageSquare },
    { href: "/freelancers", label: "Фрилансеры", icon: UserIcon },
  ];
};

export function DashboardDockHeader() {
  const { isOpen: mobileMenuOpen, toggle: toggleMobileMenu, close: closeMobileMenu } = useMobileMenu();
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, userRole } = useAuth({ requireAuth: false });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { execute: executeLogout } = useAsyncOperation<void, void>(
    async () => {
      await authService.logout();
      router.push("/auth/login");
    },
    { onError: () => router.push("/auth/login") }
  );

  const handleLogout = () => {
    setAnchorEl(null);
    executeLogout();
  };

  const navItems = useMemo(() => getNavItems(userRole === "freelancer"), [userRole]);

  return (
    <>
      <DesktopDock
        logoHref="/dashboard"
        navItems={navItems}
        pathname={pathname}
        actions={
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ThemeToggle />
              <NotificationBell />
              <RoleSwitcher />
            </div>
            <div style={{ cursor: "pointer" }} onClick={(e) => setAnchorEl(e.currentTarget)}>
              <UserAvatar user={user} profile={profile} size={40} />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{ paper: { sx: { mt: 1, minWidth: 200 } } }}
            >
              <MenuItem component={Link} href={user ? `/users/${user.id}` : "/profile"} onClick={() => setAnchorEl(null)} sx={{ flexDirection: "column", alignItems: "flex-start", py: 2 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{profile?.display_name || user?.username}</div>
                <div style={{ fontSize: 12, color: "var(--foreground-secondary)", marginTop: 4 }}>{userRole === "client" ? "Заказчик" : "Фрилансер"}</div>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); user && router.push(`/users/${user.id}`); }}>
                <ListItemIcon><UserIcon size={16} /></ListItemIcon>
                <ListItemText>Публичный профиль</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); router.push("/profile"); }}>
                <ListItemIcon><Settings size={16} /></ListItemIcon>
                <ListItemText>Редактировать профиль</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); router.push("/wallet"); }}>
                <ListItemIcon><Wallet size={16} /></ListItemIcon>
                <ListItemText>Кошелёк</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); router.push("/favorites"); }}>
                <ListItemIcon><Heart size={16} /></ListItemIcon>
                <ListItemText>Избранное</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); router.push("/settings"); }}>
                <ListItemIcon><Settings size={16} /></ListItemIcon>
                <ListItemText>Настройки</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: "rgb(248 113 113)" }}>
                <ListItemIcon><LogOut size={16} style={{ color: "rgb(248 113 113)" }} /></ListItemIcon>
                <ListItemText>Выход</ListItemText>
              </MenuItem>
            </Menu>
          </>
        }
      />

      <DashboardMobileMenu
        isOpen={mobileMenuOpen}
        onToggle={toggleMobileMenu}
        onClose={closeMobileMenu}
        brandName="MyFreelance"
        user={user}
        profile={profile}
        userRole={userRole || undefined}
        navItems={navItems.map((item) => ({ key: item.href, label: item.label, icon: item.icon }))}
        pathname={pathname}
        additionalContent={
          <div style={{ padding: "0 8px" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground-secondary)", marginBottom: 12 }}>Тема</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--background-elevated)", padding: 8, borderRadius: 8 }}>
                <span style={{ fontSize: 14 }}>Переключить тему</span>
                <ThemeToggle />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground-secondary)", marginBottom: 12 }}>Переключить роль</div>
              <RoleSwitcher />
            </div>
          </div>
        }
        actions={
          <>
            <button
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "8px 16px", borderRadius: 8, fontWeight: 500, color: "var(--foreground-secondary)", background: "var(--primary-10)", border: "none", cursor: "pointer" }}
              onClick={() => { closeMobileMenu(); router.push("/wallet"); }}
            >
              <Wallet size={18} />
              <span>Кошелёк</span>
            </button>
            <button
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "8px 16px", borderRadius: 8, fontWeight: 500, color: "var(--foreground-secondary)", background: "var(--primary-10)", border: "none", cursor: "pointer" }}
              onClick={() => { closeMobileMenu(); router.push("/settings"); }}
            >
              <Settings size={18} />
              <span>Настройки</span>
            </button>
            <button
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "8px 16px", borderRadius: 8, fontWeight: 500, color: "#f87171", background: "transparent", border: "none", cursor: "pointer" }}
              onClick={() => { closeMobileMenu(); handleLogout(); }}
            >
              <LogOut size={18} />
              <span>Выход</span>
            </button>
          </>
        }
      />

      <div className="hidden lg:block" style={{ height: 88 }} />
      <div className="lg:hidden" style={{ height: 64 }} />
    </>
  );
}
