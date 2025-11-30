"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge, Popover, IconButton, Box, Typography, Button, CircularProgress, Divider } from "@mui/material";
import { Bell, Check } from "lucide-react";
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
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsError, setWsError] = useState(false);
  const [wsAttempted, setWsAttempted] = useState(false);

  const open = Boolean(anchorEl);

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

  const updateUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error updating unread count:", error);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    const connectWebSocket = async () => {
      setWsAttempted(true);
      try {
        await websocketService.connect();
        setWsConnected(true);
        setWsError(false);
      } catch (error) {
        setWsConnected(false);
        setWsError(true);
      }
    };

    if (authService.isAuthenticated()) {
      connectWebSocket();
    }

    const unsubscribe = websocketService.onNotification((newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);

      if (!newNotification.is_read) {
        setUnreadCount((prev) => prev + 1);
      }

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

    const unsubscribeChat = websocketService.on("chat.message", (wsMessage) => {
      const chatData = wsMessage.data;

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

      setNotifications((prev) => [chatNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);

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

    const unsubscribeConnection = websocketService.onConnectionChange((connected) => {
      setWsConnected((prevConnected) => {
        if (connected) {
          setWsError(false);
          if (!prevConnected) {
            loadNotifications();
          }
        } else {
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
      await updateUnreadCount();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    loadNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ position: 'relative' }}
      >
        <IconButton onClick={handleClick} color="inherit">
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <Bell size={20} />
          </Badge>
        </IconButton>
        {wsAttempted && wsError && !wsConnected && (
          <Box
            sx={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              bgcolor: 'error.main',
              borderRadius: '50%',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              }
            }}
            title="Проблема с подключением к серверу уведомлений"
          />
        )}
      </motion.div>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 320, maxHeight: 400, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Уведомления
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<Check size={14} />}
                onClick={handleMarkAllAsRead}
              >
                Прочитать все
              </Button>
            )}
          </Box>

          <Box sx={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <NotificationList
                notifications={notifications || []}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            )}
          </Box>
        </Box>
      </Popover>
    </>
  );
}
