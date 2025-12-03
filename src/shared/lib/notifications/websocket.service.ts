import { authService } from "../auth/auth.service";
import { Notification } from "./notification.service";

export type WebSocketEventType =
  | "orders.new"
  | "orders.updated"
  | "proposals.new"
  | "proposals.sent"
  | "proposals.updated"
  | "proposals.ai_analysis_ready"
  | "chat.message"
  | "chat.reaction"
  | "message.reaction.added"
  | "message.reaction.removed"
  | "profile.updated"
  | "notification";

export interface WebSocketMessage {
  type: WebSocketEventType;
  data: any;
}

export type WebSocketEventHandler = (message: WebSocketMessage) => void;
export type NotificationEventHandler = (notification: Notification) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private connectionPromise: { resolve: () => void; reject: (error: Error) => void } | null = null;
  private eventHandlers: Map<WebSocketEventType, WebSocketEventHandler[]> = new Map();
  private notificationHandlers: NotificationEventHandler[] = [];
  private connectionHandlers: Array<(connected: boolean) => void> = [];

  // Подключиться к WebSocket
  connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.isConnecting) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.isConnecting = true;

      const token = authService.getAccessToken();
      if (!token) {
        this.isConnecting = false;
        reject(new Error("No access token available"));
        return;
      }

      // Получаем API URL и преобразуем в WebSocket URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      
      // Преобразуем HTTP/HTTPS в WS/WSS
      let wsUrl: string;
      if (apiUrl.startsWith("https://")) {
        wsUrl = apiUrl.replace("https://", "wss://");
      } else if (apiUrl.startsWith("http://")) {
        wsUrl = apiUrl.replace("http://", "ws://");
      } else {
        // Если нет протокола, добавляем ws://
        wsUrl = `ws://${apiUrl}`;
      }
      
      // Убеждаемся, что URL заканчивается на /ws
      if (!wsUrl.endsWith("/ws")) {
        wsUrl = wsUrl.replace(/\/api$/, "") + "/api/ws";
      }
      
      const url = `${wsUrl}?token=${token}`;
      // Silently attempt connection - don't log connection attempts

      // Сохраняем промис для возможного отклонения в onclose
      this.connectionPromise = { resolve, reject };

      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          // Silently handle successful connection
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.notifyConnectionHandlers(true);
          this.connectionPromise = null;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.ws.onerror = (error) => {
          // Silently handle connection errors - they're expected if backend is down
          // The onclose handler will handle reconnection logic
          this.isConnecting = false;
          this.notifyConnectionHandlers(false);
          
          // Silently reject the promise - connection errors are expected
          // Components should handle connection failures gracefully
          if (this.connectionPromise) {
            // Reject silently - don't throw errors for expected connection failures
            try {
              this.connectionPromise.reject(new Error("WebSocket connection error"));
            } catch {
              // Ignore rejection errors
            }
            this.connectionPromise = null;
          }
        };

        this.ws.onclose = (event) => {
          // Silently handle disconnections - they're expected if backend is down
          this.isConnecting = false;
          this.notifyConnectionHandlers(false);
          this.ws = null;

          // Если соединение не было установлено (onopen не вызвался), отклоняем промис
          // Silently reject - connection failures are expected
          if (this.connectionPromise) {
            try {
              this.connectionPromise.reject(
                new Error(`WebSocket connection closed: ${event.code} ${event.reason || "Unknown error"}`)
              );
            } catch {
              // Ignore rejection errors
            }
            this.connectionPromise = null;
          }

          // Автоматическое переподключение только если это не было намеренное закрытие
          // и не превышен лимит попыток
          // Код 1000 - нормальное закрытие, 1006 - аномальное закрытие
          // Код 1001 - уход со страницы, 1002 - ошибка протокола, 1003 - неподдерживаемый тип данных
          const shouldReconnect = 
            event.code !== 1000 && 
            event.code !== 1001 && 
            this.reconnectAttempts < this.maxReconnectAttempts;
            
          if (shouldReconnect) {
            this.reconnectAttempts++;
            const delay = Math.min(
              this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
              30000 // Максимальная задержка 30 секунд
            );
            // Silently attempt reconnection
            setTimeout(() => {
              if (authService.isAuthenticated() && !this.ws) {
                // Silently attempt reconnection - failures are expected if backend is down
                this.connect().catch(() => {
                  // Silently handle reconnection failures
                });
              }
            }, delay);
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            // Silently stop reconnection attempts - backend may be unavailable
            this.notifyConnectionHandlers(false);
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // Отключиться от WebSocket
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Остановить переподключение
  }

  // Подписаться на событие
  on(event: WebSocketEventType, handler: WebSocketEventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);

    // Возвращаем функцию для отписки
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  // Подписаться на уведомления
  onNotification(handler: NotificationEventHandler): () => void {
    this.notificationHandlers.push(handler);
    return () => {
      const index = this.notificationHandlers.indexOf(handler);
      if (index > -1) {
        this.notificationHandlers.splice(index, 1);
      }
    };
  }

  // Подписаться на изменения состояния подключения
  onConnectionChange(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.push(handler);
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  // Проверить состояние подключения
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private handleMessage(message: WebSocketMessage): void {
    // Вызываем обработчики для конкретного события
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }

    // Если это уведомление, вызываем специальные обработчики
    if (message.type === "notification") {
      const notification: Notification = {
        id: message.data.id,
        user_id: message.data.user_id || "",
        payload: message.data.payload || message.data,
        is_read: message.data.is_read || false,
        created_at: message.data.created_at || new Date().toISOString(),
      };
      this.notificationHandlers.forEach((handler) => handler(notification));
    }
  }

  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach((handler) => handler(connected));
  }
}

export const websocketService = new WebSocketService();
export default websocketService;

