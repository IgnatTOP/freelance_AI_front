"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DesktopDock, AuthButtons, MobileAuthButtons, MobileMenu, DockLogo } from "@/src/shared/ui";
import { useMobileMenu, useAuth, useActiveSection } from "@/src/shared/lib/hooks";
import { createAnchorClickHandler } from "@/src/shared/lib/utils/navigation";
import {
  Home,
  Sparkles,
  Wallet,
  BookOpen,
  Users,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Главная", icon: Home },
  { href: "#features", label: "Возможности", icon: Sparkles },
  { href: "#pricing", label: "Тарифы", icon: Wallet },
  { href: "/blog", label: "Блог", icon: BookOpen },
  { href: "/about", label: "О нас", icon: Users },
];

export function DockHeader() {
  const { isOpen: mobileMenuOpen, toggle: toggleMobileMenu, close: closeMobileMenu } = useMobileMenu();
  const { isAuthenticated, loading: authLoading } = useAuth({ requireAuth: false });
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Track active section on homepage
  const isHomePage = pathname === "/";
  const activeSection = useActiveSection({
    sections: ["features", "pricing"],
    offset: 150,
    enabled: isHomePage,
  });

  // Prevent hydration mismatch by only showing auth-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during SSR and initial hydration
  const showAuthContent = mounted && !authLoading;

  // Handle anchor clicks for navigation links
  const handleNavClick = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const handler = createAnchorClickHandler(href, pathname, router, "/");
    handler(e);
  };

  return (
    <>
      {/* Desktop macOS Dock Bar */}
      <DesktopDock
        logoHref="/"
        navItems={navLinks}
        pathname={pathname}
        activeSection={activeSection}
        showScrollEffect
        onNavItemClick={handleNavClick}
        actions={
          <AuthButtons
            isAuthenticated={showAuthContent && isAuthenticated}
            showLabels
            size="sm"
          />
        }
      />

      {/* Mobile Header */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onToggle={toggleMobileMenu}
        onClose={closeMobileMenu}
        brandName="Modern"
        logo={<DockLogo href={undefined} />}
        menuItems={
          <>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 text-foreground-secondary hover:text-primary transition-colors font-medium py-2"
                  onClick={(e) => {
                    handleNavClick(link.href)(e);
                    closeMobileMenu();
                  }}
                >
                  <Icon size={20} />
                  {link.label}
                </Link>
              );
            })}
          </>
        }
        actions={
          <MobileAuthButtons
            isAuthenticated={showAuthContent && isAuthenticated}
            onClose={closeMobileMenu}
          />
        }
      />

      {/* Spacer */}
      <div className="hidden lg:block" style={{ height: "5rem" }} />
      <div className="lg:hidden" style={{ height: mobileMenuOpen ? "auto" : "4rem", minHeight: "4rem" }} />
    </>
  );
}

