"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/src/shared/lib/auth/auth.service";
import type { User, Profile, UserRole } from "@/src/entities/user/model/types";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Profile) => void;
  updateUser: (user: User) => void;
  switchRole: (role: "client" | "freelancer") => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const userData = authService.getCurrentUser();
      const profileData = authService.getCurrentProfile();
      
      if (userData && profileData) {
        setUser(userData);
        setProfile(profileData);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
    setProfile(response.profile);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setProfile(null);
    router.push("/auth/login");
  }, [router]);

  const updateProfile = useCallback((newProfile: Profile) => {
    setProfile(newProfile);
    authService.setCurrentProfile(newProfile);
  }, []);

  const updateUser = useCallback((newUser: User) => {
    setUser(newUser);
    authService.setCurrentUser(newUser);
  }, []);

  const switchRole = useCallback((role: "client" | "freelancer") => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      authService.setCurrentUser(updatedUser);
    }
  }, [user]);

  const userRole = useMemo(() => {
    if (!user) return null;
    return user.role === "admin" ? "client" : user.role;
  }, [user]);

  const isAuthenticated = useMemo(() => {
    return authService.isAuthenticated();
  }, [user]);

  const value: AuthContextValue = useMemo(() => ({
    user,
    profile,
    userRole,
    isAuthenticated,
    loading,
    login,
    logout,
    updateProfile,
    updateUser,
    switchRole,
  }), [user, profile, userRole, isAuthenticated, loading, login, logout, updateProfile, updateUser, switchRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}

// Backward compatible hook
export function useAuth(options: { redirectTo?: string; requireAuth?: boolean } = {}) {
  const { redirectTo = "/auth/login", requireAuth = true } = options;
  const context = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (context && !context.loading && requireAuth && !context.isAuthenticated) {
      router.push(redirectTo);
    }
  }, [context, requireAuth, redirectTo, router]);

  if (!context) {
    return {
      user: null,
      profile: null,
      userRole: null as UserRole | null,
      isAuthenticated: false,
      loading: true,
    };
  }

  return {
    user: context.user,
    profile: context.profile,
    userRole: context.userRole,
    isAuthenticated: context.isAuthenticated,
    loading: context.loading,
  };
}
