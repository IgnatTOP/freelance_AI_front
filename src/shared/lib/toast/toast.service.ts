import { ToastType, ToastOptions } from "./types";

/**
 * Сервис для управления тостами
 * Позволяет показывать тосты из любого места приложения
 */
class ToastService {
  private listeners: Set<(toast: ToastOptions) => void> = new Set();

  /**
   * Подписаться на события показа тостов
   */
  subscribe(listener: (toast: ToastOptions) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Показать тост
   */
  private notify(options: ToastOptions) {
    this.listeners.forEach((listener) => listener(options));
  }

  /**
   * Показать успешный тост
   */
  success(title: string, message?: string, duration?: number) {
    this.notify({ type: "success", title, message, duration });
  }

  /**
   * Показать тост об ошибке
   */
  error(title: string, message?: string, duration?: number) {
    this.notify({ type: "error", title, message, duration });
  }

  /**
   * Показать информационный тост
   */
  info(title: string, message?: string, duration?: number) {
    this.notify({ type: "info", title, message, duration });
  }

  /**
   * Показать предупреждающий тост
   */
  warning(title: string, message?: string, duration?: number) {
    this.notify({ type: "warning", title, message, duration });
  }

  /**
   * Показать тост загрузки
   */
  loading(title: string, message?: string) {
    this.notify({ type: "loading", title, message, duration: 0 });
  }

  /**
   * Показать кастомный тост
   */
  show(options: ToastOptions) {
    this.notify(options);
  }
}

export const toastService = new ToastService();


