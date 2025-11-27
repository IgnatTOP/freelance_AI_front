/**
 * Хук для работы с авторизацией
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../auth/auth.service";
import type { User, Profile } from "@/src/entities/user/model/types";

interface UseAuthOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  userRole: "client" | "freelancer" | null;
  isAuthenticated: boolean;
  loading: boolean;
}

/**
 * Хук для проверки авторизации и получения данных пользователя
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const { redirectTo = "/auth/login", requireAuth = true } = options;
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!authService.isAuthenticated()) {
        if (requireAuth) {
          router.push(redirectTo);
        }
        setLoading(false);
        return;
      }

      const userData = authService.getCurrentUser();
      const profileData = authService.getCurrentProfile();

      if (userData && profileData) {
        setUser(userData);
        setProfile(profileData);
      } else if (requireAuth) {
        router.push(redirectTo);
      }

      setLoading(false);
    };

    checkAuth();
  }, [router, redirectTo, requireAuth]);

  const userRole = (user?.role === "admin" ? "client" : user?.role) as "client" | "freelancer" | null;

  return {
    user,
    profile,
    userRole,
    isAuthenticated: authService.isAuthenticated(),
    loading,
  };
}

