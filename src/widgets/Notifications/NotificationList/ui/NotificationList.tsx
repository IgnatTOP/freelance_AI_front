"use client";

import { useRouter } from "next/navigation";
import { List, ListItem, ListItemAvatar, ListItemText, IconButton, Box, Typography, Avatar } from "@mui/material";
import { Notification, notificationService } from "@/src/shared/lib/notifications";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Check, Trash2, Briefcase, MessageSquare, User, FileText, Sparkles } from "lucide-react";

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const getIcon = (event: string) => {
  if (event.includes("orders")) return Briefcase;
  if (event.includes("proposals")) return FileText;
  if (event.includes("chat") || event.includes("message")) return MessageSquare;
  if (event.includes("profile")) return User;
  return Sparkles;
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "success": return "#10b981";
    case "error": return "#ef4444";
    case "warning": return "#f59e0b";
    default: return "var(--primary)";
  }
};

export function NotificationList({ notifications, onMarkAsRead, onDelete }: NotificationListProps) {
  const router = useRouter();

  if (!notifications || notifications.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="body2" sx={{ color: "var(--foreground-muted)" }}>Нет уведомлений</Typography>
      </Box>
    );
  }

  const handleClick = (item: Notification, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const url = notificationService.getNotificationUrl(item);
    if (url) {
      router.push(url);
      if (!item.is_read) onMarkAsRead(item.id);
    }
  };

  return (
    <List sx={{ p: 0 }}>
      {notifications.map((item) => {
        const message = notificationService.getNotificationMessage(item);
        const type = notificationService.getNotificationType(item);
        const Icon = getIcon(item.payload?.event || "notification");
        const isUnread = !item.is_read;
        const url = notificationService.getNotificationUrl(item);
        const color = getTypeColor(type);

        return (
          <ListItem
            key={item.id}
            onClick={url ? (e) => handleClick(item, e) : undefined}
            sx={{
              borderBottom: "1px solid var(--border)",
              bgcolor: isUnread ? "var(--primary-05)" : "transparent",
              cursor: url ? "pointer" : "default",
              "&:hover": url ? { bgcolor: "var(--primary-10)" } : {},
            }}
            secondaryAction={
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {isUnread && (
                  <IconButton size="small" onClick={() => onMarkAsRead(item.id)} title="Прочитано">
                    <Check size={16} />
                  </IconButton>
                )}
                <IconButton size="small" onClick={() => onDelete(item.id)} color="error" title="Удалить">
                  <Trash2 size={16} />
                </IconButton>
              </Box>
            }
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: `${color}15`, color, width: 40, height: 40 }}>
                <Icon size={18} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" fontWeight={isUnread ? 600 : 400} sx={{ color: isUnread ? "var(--foreground)" : "var(--foreground-secondary)" }}>
                    {message}
                  </Typography>
                  {isUnread && <Box sx={{ width: 8, height: 8, bgcolor: "var(--primary)", borderRadius: "50%" }} />}
                </Box>
              }
              secondary={
                <Typography variant="caption" sx={{ color: "var(--foreground-muted)" }}>
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ru })}
                </Typography>
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
}
