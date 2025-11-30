"use client";

import { useRouter } from "next/navigation";
import { List, ListItem, ListItemAvatar, ListItemText, IconButton, Box, Typography, Avatar } from "@mui/material";
import { Notification } from "@/src/shared/lib/notifications";
import { notificationService } from "@/src/shared/lib/notifications";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Check,
  Trash2,
  Briefcase,
  MessageSquare,
  User,
  FileText,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@mui/material/styles";

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const getNotificationIcon = (event: string) => {
  if (event.includes("orders")) return Briefcase;
  if (event.includes("proposals")) return FileText;
  if (event.includes("chat") || event.includes("message")) return MessageSquare;
  if (event.includes("profile")) return User;
  return Sparkles;
};

export function NotificationList({
  notifications,
  onMarkAsRead,
  onDelete,
}: NotificationListProps) {
  const router = useRouter();
  const theme = useTheme();

  if (!notifications || notifications.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Нет уведомлений
        </Typography>
      </Box>
    );
  }

  const handleNotificationClick = (item: Notification, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    const url = notificationService.getNotificationUrl(item);
    if (url) {
      router.push(url);
      if (!item.is_read) {
        onMarkAsRead(item.id);
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success": return theme.palette.success.main;
      case "error": return theme.palette.error.main;
      case "warning": return theme.palette.warning.main;
      default: return theme.palette.primary.main;
    }
  };

  const getTypeBgColor = (type: string) => {
    switch (type) {
      case "success": return `${theme.palette.success.main}15`;
      case "error": return `${theme.palette.error.main}15`;
      case "warning": return `${theme.palette.warning.main}15`;
      default: return `${theme.palette.primary.main}15`;
    }
  };

  return (
    <List sx={{ p: 0 }}>
      {notifications.map((item) => {
        const message = notificationService.getNotificationMessage(item);
        const type = notificationService.getNotificationType(item);
        const Icon = getNotificationIcon(item.payload?.event || 'notification');
        const isUnread = !item.is_read;
        const url = notificationService.getNotificationUrl(item);

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ListItem
              onClick={url ? (e) => handleNotificationClick(item, e) : undefined}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: isUnread ? `${theme.palette.primary.main}08` : 'transparent',
                cursor: url ? 'pointer' : 'default',
                '&:hover': url ? {
                  bgcolor: `${theme.palette.primary.main}12`,
                } : {},
                transition: 'background-color 0.2s',
              }}
              secondaryAction={
                <Box display="flex" gap={0.5}>
                  {isUnread && (
                    <IconButton
                      size="small"
                      onClick={() => onMarkAsRead(item.id)}
                      title="Отметить как прочитанное"
                    >
                      <Check size={16} />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => onDelete(item.id)}
                    color="error"
                    title="Удалить"
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
              }
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: getTypeBgColor(type),
                    color: getTypeColor(type),
                    width: 40,
                    height: 40,
                  }}
                >
                  <Icon size={18} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                      variant="body2"
                      fontWeight={isUnread ? 600 : 400}
                      color={isUnread ? 'text.primary' : 'text.secondary'}
                    >
                      {message}
                    </Typography>
                    {isUnread && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          bgcolor: 'primary.main',
                          borderRadius: '50%',
                        }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                      locale: ru,
                    })}
                  </Typography>
                }
              />
            </ListItem>
          </motion.div>
        );
      })}
    </List>
  );
}
