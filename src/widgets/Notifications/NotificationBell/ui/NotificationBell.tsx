"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge, Popover, Button, Spin } from "antd";
import { Bell, Check, Trash2 } from "lucide-react";
import { notificationService, Notification } from "@/src/shared/lib/notifications";
import { websocketService } from "@/src/shared/lib/notifications/websocket.service";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { NotificationList } from "../../NotificationList/ui/NotificationList";
import { toastService } from "@/src/shared/lib/toast/toast.service";
import { motion } from "framer-motion";

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsError, setWsError] = useState(false); // Флаг ошибки подключения
  const [wsAttempted, setWsAttempted] = useState(false); // Флаг того, что была попытка подключения

  // Загрузить уведомления
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const [notifs, count] = await Promise.all([
        notificationService.getNotifications(20, 0, false),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновить количество непрочитанных
  const updateUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error updating unread count:", error);
    }
  }, []);

  // Инициализация
  useEffect(() => {
    loadNotifications();

    // Подключиться к WebSocket
    const connectWebSocket = async () => {
      setWsAttempted(true); // Отмечаем, что была попытка подключения
      try {
        await websocketService.connect();
        setWsConnected(true);
        setWsError(false); // Сбрасываем ошибку при успешном подключении
      } catch (error) {
        // Silently handle connection errors - they're expected if backend is down
        setWsConnected(false);
        // Устанавливаем ошибку только если это не просто недоступность сервера
        // (код 1006 может означать, что сервер не запущен - это не критично)
        setWsError(true);
        // Не прерываем выполнение, WebSocket попытается переподключиться автоматически
      }
    };

    // Подключаемся только если пользователь авторизован
    if (authService.isAuthenticated()) {
      connectWebSocket();
    }

    // Подписаться на уведомления через WebSocket
    const unsubscribe = websocketService.onNotification((newNotification) => {
      // Добавить новое уведомление в начало списка
      setNotifications((prev) => [newNotification, ...prev]);
      
      // Обновить счетчик
      if (!newNotification.is_read) {
        setUnreadCount((prev) => prev + 1);
      }

      // Показать toast уведомление с возможностью перехода
      const message = notificationService.getNotificationMessage(newNotification);
      const type = notificationService.getNotificationType(newNotification);
      const url = notificationService.getNotificationUrl(newNotification);
      
      toastService.show({
        type,
        title: "Новое уведомление",
        message,
        duration: 5000,
        action: url ? {
          label: "Перейти",
          onClick: () => {
            router.push(url);
          },
        } : undefined,
      });
    });

    // Подписаться на события chat.message для показа уведомлений о новых сообщениях
    const unsubscribeChat = websocketService.on("chat.message", (wsMessage) => {
      const chatData = wsMessage.data;
      
      // Создаем уведомление из события чата
      const chatNotification: Notification = {
        id: `chat-${Date.now()}-${Math.random()}`,
        user_id: "",
        payload: {
          event: "chat.message",
          data: chatData,
        },
        is_read: false,
        created_at: new Date().toISOString(),
      };

      // Добавить новое уведомление в начало списка
      setNotifications((prev) => [chatNotification, ...prev]);
      
      // Обновить счетчик
      setUnreadCount((prev) => prev + 1);

      // Показать toast уведомление
      const message = chatData.message?.content || "Новое сообщение в чате";
      const url = notificationService.getNotificationUrl(chatNotification);
      
      toastService.show({
        type: "info",
        title: "Новое сообщение",
        message: message.length > 50 ? message.substring(0, 50) + "..." : message,
        duration: 5000,
        action: url ? {
          label: "Открыть чат",
          onClick: () => {
            router.push(url);
          },
        } : undefined,
      });
    });

    // Подписаться на изменения подключения
    const unsubscribeConnection = websocketService.onConnectionChange((connected) => {
      setWsConnected((prevConnected) => {
        if (connected) {
          setWsError(false); // Сбрасываем ошибку при успешном подключении
          // Перезагрузить уведомления при переподключении
          if (!prevConnected) {
            // Перезагружаем только если было переподключение
            loadNotifications();
          }
        } else {
          // Устанавливаем ошибку только если было подключение и оно разорвалось
          if (prevConnected) {
            setWsError(true);
          }
        }
        return connected;
      });
    });

    return () => {
      unsubscribe();
      unsubscribeChat();
      unsubscribeConnection();
      websocketService.disconnect();
    };
  }, [loadNotifications, router]);

  // Отметить как прочитанное
  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      await updateUnreadCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Отметить все как прочитанные
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Удалить уведомление
  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await updateUnreadCount();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Обновить список при открытии popover
  const handlePopoverOpenChange = (open: boolean) => {
    setPopoverOpen(open);
    if (open) {
      loadNotifications();
    }
  };

  const content = (
    <div className="w-80 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <h3 className="font-semibold text-foreground">Уведомления</h3>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            onClick={handleMarkAllAsRead}
            className="text-primary"
          >
            <Check size={14} className="mr-1" />
            Прочитать все
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spin />
        </div>
      ) : (
        <NotificationList
          notifications={notifications || []}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDelete}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      open={popoverOpen}
      onOpenChange={handlePopoverOpenChange}
      overlayClassName="notification-popover"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Badge count={unreadCount} overflowCount={99} showZero={false}>
          <Button
            type="text"
            icon={<Bell size={18} />}
            className="flex items-center justify-center text-foreground-secondary hover:text-primary"
          />
        </Badge>
        {/* Показываем красный индикатор только если была попытка подключения и она не удалась */}
        {wsAttempted && wsError && !wsConnected && (
          <div 
            className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"
            title="Проблема с подключением к серверу уведомлений"
          />
        )}
      </motion.div>
    </Popover>
  );
}

