"use client";

import {
  Card,
  CardContent,
  Avatar,
  Stack,
  Typography,
  Skeleton,
  Box,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
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
  const theme = useTheme();
  const { activities, loading } = useActivities(userRole);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Последняя активность</Typography>
          <Skeleton variant="rectangular" height={100} />
          <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (variant === "grouped") {
    return <GroupedActivityView activities={activities} />;
  }

  return <SimpleActivityView activities={activities} />;
}

function SimpleActivityView({ activities }: { activities: Activity[] }) {
  const theme = useTheme();

  const colorMap: Record<string, string> = {
    order_created: '#3b82f6',
    proposal_sent: '#a855f7',
    proposal_accepted: theme.palette.primary.main,
    message_received: '#fbbf24',
    order_completed: theme.palette.primary.main,
    profile_updated: '#ec4899',
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <TrendingUp size={18} />
          <Typography variant="h6">Последняя активность</Typography>
        </Stack>

        {activities.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Нет активности
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {activities.map((activity, index) => {
              const Icon = activityConfig[activity.type].icon;
              const color = colorMap[activity.type];

              return (
                <motion.div
                  key={activity.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Stack direction="row" spacing={2}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.06)' : 'rgba(24, 144, 255, 0.04)',
                        border: `2px solid ${color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} style={{ color }} />
                    </Box>
                    <Stack spacing={1} sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '14px' }}>
                          {activity.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '12px' }}>
                          {formatTimeAgo(activity.timestamp)}
                        </Typography>
                      </Stack>

                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px' }}>
                        {activity.description}
                      </Typography>

                      {activity.user && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.06)' : 'rgba(24, 144, 255, 0.04)',
                              color: theme.palette.primary.main,
                            }}
                          >
                            <User size={14} />
                          </Avatar>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '12px' }}>
                            {activity.user.name}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </motion.div>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function GroupedActivityView({ activities }: { activities: Activity[] }) {
  const theme = useTheme();

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
      sx={{
        borderColor: theme.palette.divider,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Clock size={18} style={{ color: theme.palette.text.secondary }} />
          <Typography variant="body2" color="text.secondary">
            Последняя активность
          </Typography>
        </Stack>

        {activities.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Нет активности
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              maxHeight: '400px',
              overflowY: 'auto',
              pr: 1,
              pl: 1,
            }}
          >
            <Stack spacing={2}>
              {sortedGroups.map((groupName, groupIndex) => (
                <Box key={groupName}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      mb: 1,
                      fontWeight: 500,
                    }}
                  >
                    {groupName}
                  </Typography>
                  <Stack spacing={2}>
                    {groupedActivities[groupName].map((activity, index) => {
                      const config = activityConfig[activity.type];
                      const Icon = config.icon;

                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            duration: 0.3,
                            delay: groupIndex * 0.1 + index * 0.05,
                          }}
                        >
                          <Stack direction="row" spacing={2}>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: 1,
                                background: `${config.color}20`,
                                border: `1.5px solid ${config.color}60`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Icon size={12} style={{ color: config.color }} />
                            </Box>
                            <Stack spacing={0.5} sx={{ flex: 1 }}>
                              <Stack direction="row" justifyContent="space-between">
                                <Typography variant="caption" color="text.secondary">
                                  {activity.title}
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '11px' }}>
                                  {formatTimeAgo(activity.timestamp)}
                                </Typography>
                              </Stack>

                              {activity.description && (
                                <Typography
                                  variant="caption"
                                  color="text.disabled"
                                  sx={{ fontSize: '11px' }}
                                >
                                  {activity.description}
                                </Typography>
                              )}

                              {activity.user && (
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                                  <Avatar
                                    sx={{
                                      width: 20,
                                      height: 20,
                                      backgroundColor: `${config.color}20`,
                                      color: config.color,
                                      fontSize: '10px',
                                    }}
                                  >
                                    {activity.user.name[0]}
                                  </Avatar>
                                  <Typography
                                    variant="caption"
                                    color="text.disabled"
                                    sx={{ fontSize: '11px' }}
                                  >
                                    {activity.user.name}
                                  </Typography>
                                </Stack>
                              )}

                              <Chip
                                label={config.label}
                                size="small"
                                sx={{
                                  mt: 0.5,
                                  height: 'auto',
                                  fontSize: '10px',
                                  py: 0.25,
                                  px: 1,
                                  backgroundColor: `${config.color}15`,
                                  color: config.color,
                                  border: `1px solid ${config.color}30`,
                                  '& .MuiChip-label': {
                                    px: 0,
                                  },
                                }}
                              />
                            </Stack>
                          </Stack>
                        </motion.div>
                      );
                    })}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
