"use client";

import { Avatar, Stack, Typography, Skeleton, Box, Chip } from "@mui/material";
import { FileText, MessageSquare, CheckCircle, UserPlus, Briefcase, Clock } from "lucide-react";
import { formatTimeAgo } from "@/src/shared/lib/utils/date-utils";
import { type Activity } from "@/src/shared/lib/utils/activity-parser";
import { useDashboardData } from "@/src/features/dashboard/context";
import { StyledCard, SectionHeader, LoadingState } from "@/src/shared/ui";
import { radius, iconSize, statusColors } from "@/src/shared/lib/constants/design";

interface ActivityWidgetProps {
  userRole: "client" | "freelancer" | null;
}

const activityConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  order_created: { icon: Briefcase, color: statusColors.info, label: "Заказ создан" },
  proposal_sent: { icon: FileText, color: "#a855f7", label: "Отклик отправлен" },
  proposal_accepted: { icon: CheckCircle, color: statusColors.success, label: "Отклик принят" },
  message_received: { icon: MessageSquare, color: statusColors.warning, label: "Новое сообщение" },
  order_completed: { icon: CheckCircle, color: statusColors.success, label: "Заказ завершён" },
  profile_updated: { icon: UserPlus, color: "#ec4899", label: "Профиль обновлён" },
};

function getTimeGroup(timestamp: string): string {
  const diffInHours = Math.floor((Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60));
  if (diffInHours < 24) return "Сегодня";
  if (diffInHours < 48) return "Вчера";
  if (diffInHours < 168) return "На этой неделе";
  return "Раньше";
}

function ActivityItem({ activity }: { activity: Activity }) {
  const config = activityConfig[activity.type] || activityConfig.order_created;
  const Icon = config.icon;

  return (
    <Stack direction="row" spacing={1.5}>
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: `${radius.sm}px`,
          bgcolor: `${config.color}20`,
          border: `1px solid ${config.color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={iconSize.xs} style={{ color: config.color }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" sx={{ color: "var(--text-secondary)", fontSize: 13 }}>
            {activity.title}
          </Typography>
          <Typography variant="caption" sx={{ color: "var(--text-muted)", fontSize: 11 }}>
            {formatTimeAgo(activity.timestamp)}
          </Typography>
        </Stack>
        {activity.description && (
          <Typography variant="caption" sx={{ color: "var(--text-muted)", fontSize: 11, display: "block", mt: 0.5 }}>
            {activity.description}
          </Typography>
        )}
        {activity.user && (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
            <Avatar sx={{ width: 16, height: 16, bgcolor: `${config.color}20`, fontSize: 9 }}>
              {activity.user.name[0]}
            </Avatar>
            <Typography variant="caption" sx={{ color: "var(--text-muted)", fontSize: 10 }}>
              {activity.user.name}
            </Typography>
          </Stack>
        )}
        <Chip
          label={config.label}
          size="small"
          sx={{
            mt: 0.5,
            height: 18,
            fontSize: 10,
            bgcolor: `${config.color}15`,
            color: config.color,
            border: `1px solid ${config.color}30`,
            "& .MuiChip-label": { px: 1 },
          }}
        />
      </Box>
    </Stack>
  );
}

export function ActivityWidget({ userRole }: ActivityWidgetProps) {
  const { activities, loading } = useDashboardData();

  if (loading) {
    return (
      <StyledCard>
        <SectionHeader icon={Clock} title="Последняя активность" iconColor="var(--text-muted)" />
        <Box sx={{ mt: 2 }}>
          <LoadingState type="list" count={2} height={56} />
        </Box>
      </StyledCard>
    );
  }

  const groupedActivities: Record<string, Activity[]> = {};
  activities.forEach((activity) => {
    const group = getTimeGroup(activity.timestamp);
    if (!groupedActivities[group]) groupedActivities[group] = [];
    groupedActivities[group].push(activity);
  });

  const timeGroups = ["Сегодня", "Вчера", "На этой неделе", "Раньше"].filter((g) => groupedActivities[g]);

  return (
    <StyledCard>
      <SectionHeader icon={Clock} title="Последняя активность" iconColor="var(--text-muted)" />

      {activities.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body2" sx={{ color: "var(--text-muted)", fontSize: 13 }}>
            Нет активности
          </Typography>
        </Box>
      ) : (
        <Box sx={{ maxHeight: 320, overflowY: "auto", mt: 2 }}>
          <Stack spacing={2}>
            {timeGroups.map((groupName) => (
              <Box key={groupName}>
                <Typography variant="caption" sx={{ color: "var(--text-muted)", fontWeight: 500, mb: 1, display: "block", fontSize: 11 }}>
                  {groupName}
                </Typography>
                <Stack spacing={1.5}>
                  {groupedActivities[groupName].map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </StyledCard>
  );
}
