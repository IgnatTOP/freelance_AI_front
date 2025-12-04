import api from "../api/axios";

export interface NotificationPayload {
  event?: string;
  type?: string;
  data?: any;
  [key: string]: any;
}

export interface Notification {
  id: string;
  user_id: string;
  payload: NotificationPayload;
  is_read: boolean;
  created_at: string;
}

export interface NotificationCountResponse {
  count: number;
}

class NotificationService {
  // Получить список уведомлений
  async getNotifications(
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    const response = await api.get<Notification[]>("/notifications", {
      params: {
        limit,
        offset,
        unread_only: unreadOnly,
      },
    });
    // Гарантируем, что всегда возвращается массив
    return Array.isArray(response.data) ? response.data : [];
  }

  // Получить уведомление по ID
  async getNotification(id: string): Promise<Notification> {
    const response = await api.get<Notification>(`/notifications/${id}`);
    return response.data;
  }

  // Получить количество непрочитанных уведомлений
  async getUnreadCount(): Promise<number> {
    const response = await api.get<NotificationCountResponse>(
      "/notifications/unread/count"
    );
    return response.data.count;
  }

  // Отметить уведомление как прочитанное
  async markAsRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  }

  // Отметить все уведомления как прочитанные
  async markAllAsRead(): Promise<void> {
    await api.put("/notifications/read-all");
  }

  // Удалить уведомление
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  }

  // Удалить все уведомления
  async deleteAllNotifications(): Promise<void> {
    await api.delete("/notifications/all");
  }

  // Получить текст уведомления из payload
  getNotificationMessage(notification: Notification): string {
    // Поддержка разных форматов payload
    let event: string;
    let data: any;
    
    const payload = notification.payload as any;
    
    if (payload && typeof payload === 'object') {
      // Если payload уже объект с event/data
      if ('event' in payload && payload.event) {
        event = String(payload.event);
        data = payload.data;
      } else if ('type' in payload && payload.type) {
        // Альтернативный формат с type
        event = String(payload.type);
        data = payload;
      } else {
        // Прямой объект
        event = String(payload.type || payload.event || 'notification');
        data = payload;
      }
    } else {
      event = 'notification';
      data = payload;
    }
    
    // Вспомогательная функция для извлечения строки из message
    const extractMessage = (msg: any): string => {
      if (!msg) return '';
      if (typeof msg === 'string') return msg;
      if (typeof msg === 'object') {
        // Если это объект Message, извлекаем content
        if ('content' in msg && typeof msg.content === 'string') {
          return msg.content;
        }
        // Если есть поле message внутри объекта
        if ('message' in msg && typeof msg.message === 'string') {
          return msg.message;
        }
        // Если есть поле text
        if ('text' in msg && typeof msg.text === 'string') {
          return msg.text;
        }
        // В крайнем случае пытаемся преобразовать в строку
        return JSON.stringify(msg);
      }
      return String(msg);
    };
    
    switch (event) {
      case "orders.new":
        return extractMessage(data.message) || `Новый заказ: ${data.order?.title || "Без названия"}`;
      case "orders.updated":
        return extractMessage(data.message) || `Заказ обновлён: ${data.order?.title || "Без названия"}`;
      case "proposals.new":
        return extractMessage(data.message) || `Новое предложение на заказ: ${data.order?.title || "Без названия"}`;
      case "proposals.sent":
        return extractMessage(data.message) || `Ваше предложение отправлено на заказ: ${data.order?.title || "Без названия"}`;
      case "proposals.updated":
        return extractMessage(data.message) || `Статус предложения изменён: ${data.proposal?.status || "неизвестно"}`;
      case "chat.message":
        // Для сообщений чата, если message - это объект Message, используем его content
        if (data.message && typeof data.message === 'object' && 'content' in data.message) {
          return data.message.content || `Новое сообщение в чате`;
        }
        return extractMessage(data.message) || `Новое сообщение в чате`;
      case "profile.updated":
        return extractMessage(data.message) || `Профиль обновлён`;
      case "notification":
        return extractMessage(data.message) || "Новое уведомление";
      default:
        return extractMessage(data.message) || `Событие: ${event}`;
    }
  }

  // Получить тип уведомления для иконки
  getNotificationType(notification: Notification): "info" | "success" | "warning" | "error" {
    // Поддержка разных форматов payload
    let event: string;
    
    const payload = notification.payload as any;
    
    if (payload && typeof payload === 'object') {
      if ('event' in payload && payload.event) {
        event = String(payload.event);
      } else if ('type' in payload && payload.type) {
        event = String(payload.type);
      } else {
        event = String(payload.type || payload.event || 'notification');
      }
    } else {
      event = 'notification';
    }
    
    if (event.includes("proposals.accepted") || event.includes("orders.completed")) {
      return "success";
    }
    if (event.includes("proposals.rejected") || event.includes("orders.cancelled")) {
      return "error";
    }
    if (event.includes("proposals") || event.includes("chat")) {
      return "info";
    }
    return "info";
  }

  // Получить URL для навигации на основе типа уведомления
  getNotificationUrl(notification: Notification): string | null {
    // Поддержка разных форматов payload
    let event: string = 'notification';
    let data: any;
    
    const payload = notification.payload as any;
    
    if (payload && typeof payload === 'object') {
      if ('event' in payload && payload.event) {
        event = String(payload.event);
        data = payload.data;
      } else if ('type' in payload && payload.type) {
        event = String(payload.type);
        data = payload;
      } else {
        event = String(payload.type || payload.event || 'notification');
        data = payload;
      }
    } else {
      event = 'notification';
      data = payload;
    }
    
    switch (event) {
      case "orders.new":
      case "orders.updated":
        if (data.order?.id) {
          return `/orders/${data.order.id}`;
        }
        return "/orders";
      
      case "proposals.new":
      case "proposals.sent":
      case "proposals.updated":
        if (data.order?.id) {
          return `/orders/${data.order.id}/proposals`;
        }
        if (data.proposal?.id) {
          return "/proposals";
        }
        return "/proposals";
      
      case "chat.message":
        // Если есть conversation ID, переходим в конкретный чат
        if (data.conversation?.id) {
          return `/messages/${data.conversation.id}`;
        }
        // Если есть order ID, переходим в чат заказа
        if (data.order?.id) {
          return `/orders/${data.order.id}/chat`;
        }
        // Иначе просто в список сообщений
        return "/messages";
      
      case "profile.updated":
        return "/profile";
      
      default:
        return null;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;

