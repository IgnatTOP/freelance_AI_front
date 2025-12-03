import api from "../api/axios";
import type { User, Profile, UserStats } from "@/src/entities/user/model/types";

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at?: string;
}

export interface LoginResponse {
  user: User;
  profile: Profile;
  tokens: AuthTokens;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
  role?: "client" | "freelancer";
  display_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Session {
  id: string;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
  expires_at: string;
}

class AuthService {
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/register", data);
    this.saveAuthData(response.data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", data);
    this.saveAuthData(response.data);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await api.delete("/auth/sessions");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearAuthData();
    }
  }

  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await api.post<{ tokens: AuthTokens }>("/auth/refresh", {
      refresh_token: refreshToken,
    });

    this.setTokens(response.data.tokens);
    return response.data.tokens;
  }

  async getSessions(): Promise<Session[]> {
    const response = await api.get<Session[]>("/auth/sessions");
    return response.data;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await api.delete(`/auth/sessions/${sessionId}`);
  }

  async deleteAllSessions(): Promise<void> {
    await api.delete("/auth/sessions");
  }

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getCurrentProfile(): Profile | null {
    if (typeof window === "undefined") return null;
    const profileStr = localStorage.getItem("profile");
    if (!profileStr) return null;
    try {
      return JSON.parse(profileStr);
    } catch {
      return null;
    }
  }

  setCurrentProfile(profile: Profile): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("profile", JSON.stringify(profile));
  }

  setCurrentUser(user: User): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("user", JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
  }

  private saveAuthData(data: LoginResponse): void {
    if (typeof window === "undefined") return;
    this.setTokens(data.tokens);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("profile", JSON.stringify(data.profile));
  }

  private setTokens(tokens: AuthTokens): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
  }

  private clearAuthData(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
  }

  clearAuthAndRedirect(redirectPath: string = "/auth/login"): void {
    this.clearAuthData();
    if (typeof window !== "undefined") {
      window.location.href = redirectPath;
    }
  }

  getUserRole(): "client" | "freelancer" | "admin" | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  hasRole(role: "client" | "freelancer" | "admin"): boolean {
    return this.getUserRole() === role;
  }
}

export const authService = new AuthService();
export default authService;
