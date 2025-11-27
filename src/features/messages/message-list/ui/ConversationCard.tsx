"use client";

import { Card, Typography, Badge, Avatar, theme } from "antd";
import { MessageSquare, User, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { ConversationListItem } from "@/src/entities/conversation/model/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";
import { getMediaUrl } from "@/src/shared/lib/api/axios";

dayjs.extend(relativeTime);
dayjs.locale("ru");

const { Text } = Typography;
const { useToken } = theme;

interface ConversationCardProps {
  conversation: ConversationListItem;
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  const router = useRouter();
  const { token } = useToken();
  
  const avatarUrl = conversation.other_user.photo_url 
    ? getMediaUrl(conversation.other_user.photo_url) 
    : null;

  const hasUnread = conversation.unread_count && conversation.unread_count > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="hover:border-primary/50 transition-colors cursor-pointer"
        hoverable
        onClick={() => router.push(`/messages/${conversation.id}`)}
        style={{
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <Badge count={hasUnread ? conversation.unread_count : 0}>
            <Avatar
              size={48}
              src={avatarUrl || undefined}
              style={{
                backgroundColor: "#e6f4ff",
                color: "#1890ff",
              }}
            >
              {conversation.other_user.display_name?.charAt(0).toUpperCase() || <User size={20} />}
            </Avatar>
          </Badge>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg">
                  {conversation.other_user.display_name}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <Briefcase size={12} className="text-foreground-tertiary" />
                  <Text className="text-sm text-foreground-tertiary">
                    {conversation.order_title}
                  </Text>
                </div>
              </div>
            </div>
            {conversation.last_message && (
              <div className="flex items-center justify-between">
                <Text className="text-foreground-secondary truncate">
                  {conversation.last_message.content}
                </Text>
                <Text className="text-xs text-foreground-tertiary ml-2 flex-shrink-0">
                  {dayjs(conversation.last_message.created_at).fromNow()}
                </Text>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

