"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Track active section on scroll for anchor links
  const handleScroll = useCallback(() => {
    if (pathname !== "/") {
      setActiveSection(null);
      return;
    }

    const sections = ["features", "pricing"];
    const scrollPosition = window.scrollY + 150; // offset for header

    let currentSection: string | null = null;

    for (const sectionId of sections) {
      const element = document.getElementById(sectionId);
      if (element) {
        const offsetTop = element.offsetTop;
        const offsetHeight = element.offsetHeight;

        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          currentSection = `#${sectionId}`;
          break;
        }
      }
    }

    setActiveSection(currentSection);
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/") {
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll(); // Check initial position
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setActiveSection(null);
    }
  }, [pathname, handleScroll]);

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
        activeSection={activeSection}
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
