"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DesktopDock, AuthButtons, MobileAuthButtons, MobileMenu, DockLogo } from "@/src/shared/ui";
import { useMobileMenu, useAuth } from "@/src/shared/lib/hooks";
import { createAnchorClickHandler } from "@/src/shared/lib/utils/navigation";
import { Home, Sparkles, Wallet, BookOpen, Users } from "lucide-react";

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

  useEffect(() => { setMounted(true); }, []);

  const showAuthContent = mounted && !authLoading;

  const handleNavClick = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    createAnchorClickHandler(href, pathname, router, "/")(e);
  };

  return (
    <>
      <DesktopDock
        logoHref="/"
        navItems={navLinks}
        pathname={pathname}
        showScrollEffect
        onNavItemClick={handleNavClick}
        actions={<AuthButtons isAuthenticated={showAuthContent && isAuthenticated} showLabels size="sm" />}
      />

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
                  style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--foreground-secondary)", fontWeight: 500, padding: "8px 0", textDecoration: "none" }}
                  onClick={(e) => { handleNavClick(link.href)(e); closeMobileMenu(); }}
                >
                  <Icon size={20} />
                  {link.label}
                </Link>
              );
            })}
          </>
        }
        actions={<MobileAuthButtons isAuthenticated={showAuthContent && isAuthenticated} onClose={closeMobileMenu} />}
      />

      <div style={{ height: "1rem", display: "none" }} className="lg:block" />
      <div className="lg:hidden" style={{ height: mobileMenuOpen ? "auto" : "4rem", minHeight: "4rem" }} />
    </>
  );
}
