"use client";

import { useRouter } from "next/navigation";
import { List, Empty, Button, Typography, Space } from "antd";
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

const { Text, Paragraph } = Typography;

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

  // Защита от null/undefined
  if (!notifications || notifications.length === 0) {
    return (
      <Empty
        description="Нет уведомлений"
        className="py-8"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  const handleNotificationClick = (item: Notification, e: React.MouseEvent) => {
    // Если клик был на кнопку действия, не обрабатываем
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    const url = notificationService.getNotificationUrl(item);
    if (url) {
      router.push(url);
      // Отмечаем как прочитанное при переходе
      if (!item.is_read) {
        onMarkAsRead(item.id);
      }
    }
  };

  return (
    <List
      dataSource={notifications || []}
      renderItem={(item) => {
        const message = notificationService.getNotificationMessage(item);
        const type = notificationService.getNotificationType(item);
        const Icon = getNotificationIcon(item.payload?.event || 'notification');
        const isUnread = !item.is_read;
        const url = notificationService.getNotificationUrl(item);

        return (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <List.Item
              onClick={url ? (e) => handleNotificationClick(item, e) : undefined}
              className={`px-4 py-3 border-b border-border/30 hover:bg-primary/5 transition-colors ${
                isUnread ? "bg-primary/5" : ""
              } ${url ? "cursor-pointer" : ""}`}
              actions={[
                <Space key="actions" size="small">
                  {isUnread && (
                    <Button
                      type="text"
                      size="small"
                      icon={<Check size={14} />}
                      onClick={() => onMarkAsRead(item.id)}
                      className="text-primary"
                      title="Отметить как прочитанное"
                    />
                  )}
                  <Button
                    type="text"
                    size="small"
                    icon={<Trash2 size={14} />}
                    onClick={() => onDelete(item.id)}
                    className="text-red-400 hover:text-red-500"
                    title="Удалить"
                  />
                </Space>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      type === "success"
                        ? "bg-green-500/10 text-green-400"
                        : type === "error"
                        ? "bg-red-500/10 text-red-400"
                        : type === "warning"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                }
                title={
                  <div className="flex items-center gap-2">
                    <Text
                      strong={isUnread}
                      className={isUnread ? "text-foreground" : "text-foreground-secondary"}
                    >
                      {message}
                    </Text>
                    {isUnread && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                }
                description={
                  <Text type="secondary" className="text-xs">
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                      locale: ru,
                    })}
                  </Text>
                }
              />
            </List.Item>
          </motion.div>
        );
      }}
    />
  );
}

