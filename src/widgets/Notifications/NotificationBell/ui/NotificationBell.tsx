"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Badge, Popover, IconButton, Box, Typography, Button, CircularProgress } from "@mui/material";
import { Bell, Check, Trash2 } from "lucide-react";
import { notificationService, Notification } from "@/src/shared/lib/notifications";
import { websocketService } from "@/src/shared/lib/notifications/websocket.service";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { NotificationList } from "../../NotificationList/ui/NotificationList";
import { toastService } from "@/src/shared/lib/toast/toast.service";

export function NotificationBell() {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  
  // Обновляем ref при изменении pathname
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsError, setWsError] = useState(false);

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

  useEffect(() => {
    loadNotifications();

    const connectWebSocket = async () => {
      try {
        await websocketService.connect();
        setWsConnected(true);
        setWsError(false);
      } catch {
        setWsConnected(false);
        setWsError(true);
      }
    };

    if (authService.isAuthenticated()) connectWebSocket();

    const unsubscribe = websocketService.onNotification((newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      if (!newNotification.is_read) setUnreadCount((prev) => prev + 1);

      const message = notificationService.getNotificationMessage(newNotification);
      const type = notificationService.getNotificationType(newNotification);
      const url = notificationService.getNotificationUrl(newNotification);

      toastService.show({
        type,
        title: "Новое уведомление",
        message,
        duration: 5000,
        action: url ? { label: "Перейти", onClick: () => router.push(url) } : undefined,
      });
    });

    const unsubscribeChat = websocketService.on("chat.message", (wsMessage) => {
      const chatData = wsMessage.data;
      
      // Не показываем toast если мы уже в этом чате
      const conversationId = chatData.conversation?.id;
      if (conversationId && pathnameRef.current === `/messages/${conversationId}`) {
        return;
      }
      
      const chatNotification: Notification = {
        id: `chat-${Date.now()}`,
        user_id: "",
        payload: { event: "chat.message", data: chatData },
        is_read: false,
        created_at: new Date().toISOString(),
      };

      setNotifications((prev) => [chatNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      const message = chatData.message?.content || "Новое сообщение";
      const url = notificationService.getNotificationUrl(chatNotification);

      toastService.show({
        type: "info",
        title: "Новое сообщение",
        message: message.length > 50 ? message.substring(0, 50) + "..." : message,
        duration: 5000,
        action: url ? { label: "Открыть", onClick: () => router.push(url) } : undefined,
      });
    });

    const unsubscribeConnection = websocketService.onConnectionChange((connected) => {
      setWsConnected(connected);
      if (connected) {
        setWsError(false);
        loadNotifications();
      } else {
        setWsError(true);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeChat();
      unsubscribeConnection();
      websocketService.disconnect();
    };
  }, [loadNotifications, router]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      // Delete all notifications one by one
      await Promise.all(notifications.map((n) => notificationService.deleteNotification(n.id)));
      setNotifications([]);
      setUnreadCount(0);
      toastService.success("Все уведомления удалены");
    } catch (error) {
      console.error("Error deleting all:", error);
      toastService.error("Ошибка удаления уведомлений");
    }
  };

  return (
    <>
      <Box sx={{ position: "relative" }}>
        <IconButton onClick={(e) => { setAnchorEl(e.currentTarget); loadNotifications(); }} color="inherit">
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <Bell size={20} />
          </Badge>
        </IconButton>
        {wsError && !wsConnected && (
          <Box sx={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, bgcolor: "error.main", borderRadius: "50%", animation: "pulse 2s infinite" }} title="Проблема с подключением" />
        )}
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ width: 320, maxHeight: 400, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="subtitle1" fontWeight={600}>Уведомления</Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {unreadCount > 0 && (
                <Button size="small" startIcon={<Check size={14} />} onClick={handleMarkAllAsRead}>Прочитать все</Button>
              )}
              {notifications.length > 0 && (
                <Button size="small" color="error" startIcon={<Trash2 size={14} />} onClick={handleDeleteAll}>Удалить все</Button>
              )}
            </Box>
          </Box>

          <Box sx={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <NotificationList notifications={notifications || []} onMarkAsRead={handleMarkAsRead} onDelete={handleDelete} />
            )}
          </Box>
        </Box>
      </Popover>
    </>
  );
}
