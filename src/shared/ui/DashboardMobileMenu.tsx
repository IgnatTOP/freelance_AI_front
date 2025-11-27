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
            className="flex items-center gap-4 px-2 py-3 rounded-xl transition-colors"
            style={{
              background: "var(--primary-10)",
            }}
          >
            <UserAvatar user={user} profile={profile} size={48} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-base text-foreground leading-tight truncate">
                {displayName}
              </div>
              <div className="text-sm text-foreground-secondary mt-0.5 leading-tight">
                {roleLabel}
              </div>
            </div>
          </Link>

          {additionalContent}

          {/* Navigation */}
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.key ||
                (item.key !== "/dashboard" && pathname.startsWith(item.key));
              return (
                <Link
                  key={item.key}
                  href={item.key}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-foreground-secondary hover:text-primary"
                  }`}
                  style={{
                    background: isActive ? "var(--primary-20)" : "transparent",
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

