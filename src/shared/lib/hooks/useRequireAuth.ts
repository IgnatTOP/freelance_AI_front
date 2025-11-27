/**
 * Хук для проверки авторизации с автоматическим редиректом
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toastService } from "../toast";
import { authService } from "../auth/auth.service";

interface UseRequireAuthOptions {
  redirectTo?: string;
  showMessage?: boolean;
  messageText?: string;
}

/**
 * Хук для проверки авторизации с автоматическим редиректом
 * Используется в компонентах, которые требуют авторизации
 * 
 * @example
 * useRequireAuth(); // Редирект на /auth/login с сообщением
 * useRequireAuth({ redirectTo: "/custom", showMessage: false }); // Без сообщения
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const {
    redirectTo = "/auth/login",
    showMessage = true,
    messageText = "Необходимо авторизоваться",
  } = options;
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      if (showMessage) {
        toastService.warning(messageText);
      }
      router.push(redirectTo);
    }
  }, [router, redirectTo, showMessage, messageText]);

  return {
    isAuthenticated: authService.isAuthenticated(),
  };
}

