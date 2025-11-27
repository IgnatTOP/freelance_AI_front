"use client";

import { Card, Timeline, Avatar, Space, Typography, Empty, Skeleton, theme, Tag } from "antd";
import {
  FileText,
  MessageSquare,
  CheckCircle,
  UserPlus,
  Briefcase,
  TrendingUp,
  Clock,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatTimeAgo } from "@/src/shared/lib/utils/date-utils";
import { useActivities, Activity } from "@/src/shared/lib/hooks/useActivities";

const { Text } = Typography;
const { useToken } = theme;

interface ActivityWidgetProps {
  userRole: "client" | "freelancer" | null;
  variant?: "simple" | "grouped";
}

const activityConfig = {
  order_created: { icon: Briefcase, color: "#3b82f6", label: "Заказ создан" },
  proposal_sent: { icon: FileText, color: "#a855f7", label: "Отклик отправлен" },
  proposal_accepted: { icon: CheckCircle, color: "#10b981", label: "Отклик принят" },
  message_received: { icon: MessageSquare, color: "#fbbf24", label: "Новое сообщение" },
  order_completed: { icon: CheckCircle, color: "#10b981", label: "Заказ завершён" },
  profile_updated: { icon: UserPlus, color: "#ec4899", label: "Профиль обновлён" },
};

function getTimeGroup(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 24) return "Сегодня";
  if (diffInHours < 48) return "Вчера";
  if (diffInHours < 168) return "На этой неделе";
  return "Раньше";
}

export function ActivityWidget({ userRole, variant = "simple" }: ActivityWidgetProps) {
  const { token } = useToken();
  const { activities, loading } = useActivities(userRole);

  if (loading) {
    return (
      <Card title="Последняя активность">
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    );
  }

  if (variant === "grouped") {
    return <GroupedActivityView activities={activities} token={token} />;
  }

  return <SimpleActivityView activities={activities} />;
}

function SimpleActivityView({ activities }: { activities: Activity[] }) {
  const colorMap: Record<string, string> = {
    order_created: '#3b82f6',
    proposal_sent: '#a855f7',
    proposal_accepted: 'var(--primary)',
    message_received: '#fbbf24',
    order_completed: 'var(--primary)',
    profile_updated: '#ec4899',
  };

  return (
    <Card
      title={
        <span>
          <TrendingUp size={18} style={{ marginRight: 8 }} />
          Последняя активность
        </span>
      }
    >
      {activities.length === 0 ? (
        <Empty description="Нет активности" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Timeline
          items={activities.map((activity, index) => {
            const Icon = activityConfig[activity.type].icon;
            const color = colorMap[activity.type];

            return {
              key: activity.id,
              color: color,
              dot: (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  style={{
                    background: 'var(--primary-06)',
                    padding: '8px',
                    borderRadius: '50%',
                    border: `2px solid ${color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={14} style={{ color }} />
                </motion.div>
              ),
              children: (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  style={{ paddingBottom: '16px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <Text strong style={{ fontSize: '14px' }}>
                      {activity.title}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {formatTimeAgo(activity.timestamp)}
                    </Text>
                  </div>

                  <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                    {activity.description}
                  </Text>

                  {activity.user && (
                    <Space>
                      <Avatar
                        size={24}
                        icon={<User size={14} />}
                        style={{ backgroundColor: 'var(--primary-06)', color: 'var(--primary)' }}
                      />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {activity.user.name}
                      </Text>
                    </Space>
                  )}
                </motion.div>
              ),
            };
          })}
        />
      )}
    </Card>
  );
}

function GroupedActivityView({ activities, token }: { activities: Activity[]; token: any }) {
  const groupedActivities: Record<string, Activity[]> = {};
  activities.forEach((activity) => {
    const group = getTimeGroup(activity.timestamp);
    if (!groupedActivities[group]) {
      groupedActivities[group] = [];
    }
    groupedActivities[group].push(activity);
  });

  const timeGroups = ["Сегодня", "Вчера", "На этой неделе", "Раньше"];
  const sortedGroups = timeGroups.filter((group) => groupedActivities[group]);

  return (
    <Card
      title={
        <Space>
          <Clock size={18} style={{ color: token.colorTextTertiary }} />
          <span style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>Последняя активность</span>
        </Space>
      }
      style={{
        borderColor: token.colorBorder,
        borderRadius: token.borderRadiusLG,
      }}
      styles={{
        body: { padding: token.paddingMD }
      }}
    >
      {activities.length === 0 ? (
        <Empty description="Нет активности" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            paddingRight: token.paddingXS,
            paddingLeft: token.paddingSM,
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {sortedGroups.map((groupName, groupIndex) => (
              <div key={groupName}>
                <Text
                  style={{
                    fontSize: token.fontSizeSM,
                    color: token.colorTextTertiary,
                    display: 'block',
                    marginBottom: token.marginXS,
                    fontWeight: 500,
                  }}
                >
                  {groupName}
                </Text>
                <Timeline
                  items={groupedActivities[groupName].map((activity, index) => {
                    const config = activityConfig[activity.type];
                    const Icon = config.icon;

                    return {
                      key: activity.id,
                      color: config.color,
                      dot: (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            duration: 0.3,
                            delay: groupIndex * 0.1 + index * 0.05,
                          }}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: token.borderRadius,
                            background: `${config.color}20`,
                            border: `1.5px solid ${config.color}60`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={12} style={{ color: config.color }} />
                        </motion.div>
                      ),
                      children: (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: groupIndex * 0.1 + index * 0.05,
                          }}
                          style={{ paddingBottom: token.paddingSM }}
                        >
                          <Space direction="vertical" size={2} style={{ width: '100%' }}>
                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                              <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
                                {activity.title}
                              </Text>
                              <Text
                                type="secondary"
                                style={{ fontSize: token.fontSizeSM - 1, color: token.colorTextTertiary }}
                              >
                                {formatTimeAgo(activity.timestamp)}
                              </Text>
                            </Space>

                            {activity.description && (
                              <Text
                                type="secondary"
                                style={{
                                  fontSize: token.fontSizeSM - 1,
                                  display: 'block',
                                  color: token.colorTextTertiary,
                                }}
                              >
                                {activity.description}
                              </Text>
                            )}

                            {activity.user && (
                              <Space size="small" style={{ marginTop: 2 }}>
                                <Avatar
                                  size={20}
                                  style={{
                                    backgroundColor: `${config.color}20`,
                                    color: config.color,
                                    fontSize: token.fontSizeSM - 2,
                                  }}
                                >
                                  {activity.user.name[0]}
                                </Avatar>
                                <Text
                                  type="secondary"
                                  style={{ fontSize: token.fontSizeSM - 1, color: token.colorTextTertiary }}
                                >
                                  {activity.user.name}
                                </Text>
                              </Space>
                            )}

                            <Tag
                              style={{
                                marginTop: 2,
                                borderRadius: token.borderRadius,
                                fontSize: token.fontSizeSM - 1,
                                padding: `2px ${token.paddingXS}px`,
                                height: 'auto',
                                lineHeight: '1.4',
                                backgroundColor: `${config.color}15`,
                                color: config.color,
                                border: `1px solid ${config.color}30`,
                              }}
                            >
                              {config.label}
                            </Tag>
                          </Space>
                        </motion.div>
                      ),
                    };
                  })}
                />
              </div>
            ))}
          </Space>
        </div>
      )}
    </Card>
  );
}
