"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { Onboarding } from "@/src/widgets/Onboarding";

export function OnboardingProvider() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<"client" | "freelancer" | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Проверяем авторизацию только на защищенных страницах
    const dashboardRoutes = ["/dashboard", "/orders", "/messages", "/profile", "/proposals"];
    const isDashboardRoute = dashboardRoutes.some((route) => pathname.startsWith(route));

    if (isDashboardRoute) {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const user = authService.getCurrentUser();
        const role = user?.role === "admin" ? "client" : (user?.role as "client" | "freelancer" | null);
        setUserRole(role);
      }
    }
  }, [pathname]);

  if (!isAuthenticated || !userRole) {
    return null;
  }

  return <Onboarding userRole={userRole} />;
}

