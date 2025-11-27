import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { authService } from "../auth/auth.service";
import { toastService } from "../toast";
import {
  getErrorMessage,
  shouldShowToast,
  getToastTypeForRequest,
  getToastTitleForRequest,
} from "../toast/utils";

// Base URL для API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Создаем инстанс axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Флаг для предотвращения множественных запросов на обновление токена
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - добавляем токен к каждому запросу
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - обрабатываем ошибки и обновляем токены
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Показываем тост для успешных запросов
    const config = response.config as InternalAxiosRequestConfig & {
      skipToast?: boolean;
    };

    if (shouldShowToast(config)) {
      const method = config.method?.toUpperCase() || "GET";
      const status = response.status;
      const toastType = getToastTypeForRequest(method, status);
      const title = getToastTitleForRequest(method, status, false);

      // Показываем тост только для не-GET запросов или если есть явное сообщение
      if (method !== "GET" || response.data?.message) {
        // Убеждаемся, что message всегда строка, а не объект
        const messageValue = response.data?.message;
        const message = typeof messageValue === "string" ? messageValue : undefined;
        toastService.show({
          type: toastType,
          title,
          message,
          duration: 3000,
        });
      }
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      skipToast?: boolean;
    };

    // Если ошибка 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Если уже обновляем токен, добавляем запрос в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        // Нет refresh токена - перенаправляем на логин
        processQueue(error, null);
        isRefreshing = false;
        authService.clearAuthAndRedirect("/auth/login");
        return Promise.reject(error);
      }

      try {
        // Пытаемся обновить токен
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const { access_token, refresh_token } = response.data.tokens;

        // Сохраняем новые токены
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);

        // Обновляем заголовок в оригинальном запросе
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        processQueue(null, access_token);
        isRefreshing = false;

        // Повторяем оригинальный запрос
        return api(originalRequest);
      } catch (refreshError) {
        // Не удалось обновить токен - перенаправляем на логин
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;
        authService.clearAuthAndRedirect("/auth/login");
        return Promise.reject(refreshError);
      }
    }

    // Показываем тост об ошибке (кроме 401, который обрабатывается выше)
    // Не показываем тост для 401 ошибок (они обрабатываются отдельно)
    // и для запросов с skipToast
    if (
      error.response?.status !== 401 &&
      shouldShowToast(originalRequest) &&
      !originalRequest._retry
    ) {
      const errorMessage = getErrorMessage(error);
      const status = error.response?.status || 500;
      const method = originalRequest.method?.toUpperCase() || "GET";

      toastService.error(
        getToastTitleForRequest(method, status, true),
        errorMessage,
        5000
      );
    }

    return Promise.reject(error);
  }
);

// URL для медиа файлов
export const getMediaUrl = (filePath: string | null | undefined) => {
  if (!filePath) return null;
  
  // Убираем ведущий слэш, если есть
  const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  
  // Проверяем, не начинается ли путь уже с /media/
  if (cleanPath.startsWith("media/")) {
    const pathWithoutMedia = cleanPath.slice(6); // Убираем "media/"
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const baseUrl = apiBaseUrl.replace("/api", "");
    return `${baseUrl}/media/${pathWithoutMedia}`;
  }
  
  // Добавляем префикс /media/ к пути
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  const baseUrl = apiBaseUrl.replace("/api", "");
  return `${baseUrl}/media/${cleanPath}`;
};

export default api;
