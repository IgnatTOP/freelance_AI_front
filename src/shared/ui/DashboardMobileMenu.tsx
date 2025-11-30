/**
 * Специализированный компонент мобильного меню для дашборда
 */

"use client";

import Link from "next/link";
import { MobileMenu } from "./MobileMenu";
import { UserAvatar } from "./UserAvatar";
import { DockLogo } from "./DockLogo";
import type { User, Profile } from "@/src/shared/lib/auth/auth.service";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface DashboardNavItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardMobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  brandName: string;
  user?: User | null;
  profile?: Profile | null;
  userRole?: "client" | "freelancer" | "admin" | null;
  navItems: DashboardNavItem[];
  pathname: string;
  additionalContent?: ReactNode;
  actions: ReactNode;
}

export function DashboardMobileMenu({
  isOpen,
  onToggle,
  onClose,
  brandName,
  user,
  profile,
  userRole,
  navItems,
  pathname,
  additionalContent,
  actions,
}: DashboardMobileMenuProps) {
  const displayName = profile?.display_name || user?.username;
  const roleLabel = userRole === "client" ? "Заказчик" : "Фрилансер";

  return (
    <MobileMenu
      isOpen={isOpen}
      onToggle={onToggle}
      onClose={onClose}
      brandName={brandName}
      logo={<DockLogo href={undefined} />}
      menuItems={
        <>
          {/* User Info */}
          <Link
            href={user ? `/users/${user.id}` : "/profile"}
            onClick={onClose}
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '8px 12px',
              borderRadius: 12,
              transition: 'colors 0.2s',
              background: 'rgba(24, 144, 255, 0.1)',
            }}
          >
            <UserAvatar user={user} profile={profile} size={48} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 600,
                fontSize: '1rem',
                lineHeight: 'tight',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {displayName}
              </div>
              <div style={{
                fontSize: '0.875rem',
                opacity: 0.7,
                marginTop: 2,
                lineHeight: 'tight',
              }}>
                {roleLabel}
              </div>
            </div>
          </Link>

          {additionalContent}

          {/* Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.key ||
                (item.key !== "/dashboard" && pathname.startsWith(item.key));
              return (
                <Link
                  key={item.key}
                  href={item.key}
                  style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 12px',
                    borderRadius: 12,
                    fontWeight: 500,
                    transition: 'colors 0.2s',
                    color: isActive ? '#1890ff' : 'inherit',
                    background: isActive ? "rgba(24, 144, 255, 0.2)" : "transparent",
                  }}
                  onClick={onClose}
                >
                  <Icon size={20} style={{ flexShrink: 0 }} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </>
      }
      actions={actions}
    />
  );
}

