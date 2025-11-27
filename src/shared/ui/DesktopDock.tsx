/**
 * Переиспользуемый компонент десктопного Dock хедера
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DockLogo, DockDivider, DockNavItem } from "@/src/shared/ui";
import { useScroll, calculateDockScale } from "@/src/shared/lib/hooks";
import { headerStyles, headerAnimations } from "@/src/shared/lib/constants/headerStyles";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DesktopDockProps {
  logoHref: string;
  navItems: NavItem[];
  pathname: string;
  actions: ReactNode;
  topOffset?: string;
  showScrollEffect?: boolean;
  onNavItemClick?: (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function DesktopDock({
  logoHref,
  navItems,
  pathname,
  actions,
  topOffset = "1.5rem",
  showScrollEffect = false,
  onNavItemClick,
}: DesktopDockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { scrolled } = useScroll({ threshold: 50 });

  return (
    <motion.header
      {...headerAnimations}
      className="hidden lg:block fixed left-0 right-0 z-[100] pointer-events-none"
      style={{
        top: showScrollEffect && scrolled ? "1rem" : topOffset,
      }}
    >
      <div className="flex justify-center pointer-events-auto">
        <motion.nav
          animate={showScrollEffect ? { scale: scrolled ? 0.98 : 1 } : {}}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            background: headerStyles.desktop.background,
            backdropFilter: headerStyles.desktop.backdropFilter,
            WebkitBackdropFilter: headerStyles.desktop.backdropFilter,
            border: headerStyles.desktop.border,
            boxShadow: showScrollEffect && scrolled
              ? headerStyles.desktop.boxShadow.scrolled
              : headerStyles.desktop.boxShadow.default,
          }}
        >
          <DockLogo href={logoHref} />
          <DockDivider />

          <div className="flex items-end gap-1 px-1">
            {navItems.map((item, index) => {
              const isHovered = hoveredIndex === index;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href)) ||
                (item.href === "/" && pathname === "/");
              const scale = calculateDockScale(hoveredIndex, index);

              return (
                <DockNavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isActive}
                  isHovered={isHovered}
                  scale={scale}
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                  onClick={onNavItemClick?.(item.href)}
                />
              );
            })}
          </div>

          <DockDivider />
          <div className="flex items-center gap-2 pl-1">{actions}</div>
        </motion.nav>
      </div>
    </motion.header>
  );
}

