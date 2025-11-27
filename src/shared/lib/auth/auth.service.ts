import api from "../api/axios";

// Типы данных согласно API документации
export interface User {
  id: number;
  email: string;
  username: string;
  role: "client" | "freelancer" | "admin";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface Profile {
  user_id: number;
  display_name: string;
  bio?: string;
  hourly_rate?: number;
  experience_level?: string;
  skills?: string[];
  location?: string;
  photo_id?: number;
  ai_summary?: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse {
  user: User;
  profile: Profile;
  tokens: AuthTokens;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  role: "client" | "freelancer";
  display_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

class AuthService {
  // Регистрация нового пользователя
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/register", data);

    // Сохраняем токены и данные пользователя
    this.saveAuthData(response.data);

    return response.data;
  }

  // Вход пользователя
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", data);

    // Сохраняем токены и данные пользователя
    this.saveAuthData(response.data);

    return response.data;
  }

  // Выход пользователя
  async logout(refreshToken?: string): Promise<void> {
    try {
      // Отправляем запрос на сервер для удаления сессии
      const token = refreshToken || this.getRefreshToken();
      if (token) {
        await api.delete("/auth/sessions", {
          data: { refresh_token: token },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // В любом случае очищаем локальное хранилище
      this.clearAuthData();
    }
  }

  // Обновление токена
  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await api.post<{ tokens: AuthTokens }>("/auth/refresh", {
      refresh_token: refreshToken,
    });

    const tokens = response.data.tokens;

    // Сохраняем новые токены
    this.setTokens(tokens);

    return tokens;
  }

  // Получение текущего пользователя
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

  // Получение профиля текущего пользователя
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

  // Установка текущего профиля (для обновления)
  setCurrentProfile(profile: Profile): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("profile", JSON.stringify(profile));
  }

  // Установка текущего пользователя (для обновления)
  setCurrentUser(user: User): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("user", JSON.stringify(user));
  }

  // Проверка авторизации
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!this.getAccessToken();
  }

  // Получение access токена
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  // Получение refresh токена
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
  }

  // Сохранение данных авторизации
  private saveAuthData(data: LoginResponse): void {
    if (typeof window === "undefined") return;

    this.setTokens(data.tokens);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("profile", JSON.stringify(data.profile));
  }

  // Сохранение токенов
  private setTokens(tokens: AuthTokens): void {
    if (typeof window === "undefined") return;

    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
  }

  // Очистка данных авторизации
  private clearAuthData(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
  }

  // Очистка данных авторизации и редирект на логин
  clearAuthAndRedirect(redirectPath: string = "/auth/login"): void {
    this.clearAuthData();
    if (typeof window !== "undefined") {
      window.location.href = redirectPath;
    }
  }

  // Получение роли пользователя
  getUserRole(): "client" | "freelancer" | "admin" | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  // Проверка роли пользователя
  hasRole(role: "client" | "freelancer" | "admin"): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  // Получение активных сессий
  async getSessions() {
    const response = await api.get("/auth/sessions");
    return response.data;
  }

  // Удаление конкретной сессии
  async deleteSession(sessionId: number): Promise<void> {
    await api.delete(`/auth/sessions/${sessionId}`);
  }
}

// Экспортируем singleton инстанс
export const authService = new AuthService();
export default authService;
