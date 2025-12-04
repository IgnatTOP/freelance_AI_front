"use client";

import { useEffect, useState } from "react";
import { Button, LinearProgress, Alert, Stack, Typography, Box } from "@mui/material";
import { Target, Lightbulb, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useDashboardData } from "@/src/features/dashboard/context";
import { StyledCard, SectionHeader, LoadingState } from "@/src/shared/ui";
import { radius, iconSize } from "@/src/shared/lib/constants/design";

interface Insight {
  id: string;
  type: "success" | "warning" | "info" | "tip";
  title: string;
  description: string;
  action?: { label: string; href: string };
  metric?: { label: string; value: number; max: number };
}

interface AIInsightsProps {
  userRole: "client" | "freelancer" | null;
  embedded?: boolean;
}

function InsightItem({ insight }: { insight: Insight }) {
  const Icon = insight.type === "success" ? CheckCircle : insight.type === "warning" ? AlertCircle : insight.type === "info" ? Target : Lightbulb;
  const severity = insight.type === "success" ? "success" : insight.type === "warning" ? "warning" : "info";

  return (
    <Alert
      severity={severity}
      icon={<Icon size={iconSize.md} />}
      sx={{ borderRadius: `${radius.md}px`, "& .MuiAlert-message": { width: "100%" } }}
    >
      <Stack spacing={1}>
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 12 }}>{insight.title}</Typography>
        <Typography variant="caption" sx={{ color: "var(--text-muted)", fontSize: 11 }}>{insight.description}</Typography>
        {insight.metric && (
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontSize: 10 }}>{insight.metric.label}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 10 }}>{insight.metric.value}/{insight.metric.max}</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={(insight.metric.value / insight.metric.max) * 100} sx={{ height: 4, borderRadius: `${radius.sm}px` }} />
          </Box>
        )}
        {insight.action && (
          <Link href={insight.action.href} style={{ textDecoration: "none" }}>
            <Button size="small" endIcon={<ArrowRight size={iconSize.xs} />} sx={{ p: 0, fontSize: 11 }}>{insight.action.label}</Button>
          </Link>
        )}
      </Stack>
    </Alert>
  );
}

export function AIInsights({ userRole, embedded = false }: AIInsightsProps) {
  const { data, loading } = useDashboardData();
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    if (!data || !userRole) return;

    const stats = data.stats;
    const orders = data.recent_orders || [];
    const newInsights: Insight[] = [];

    if (userRole === "freelancer") {
      const proposalsTotal = stats.proposals?.total || 0;
      const proposalsAccepted = stats.proposals?.accepted || 0;

      if (proposalsTotal > 0) {
        newInsights.push({
          id: "1",
          type: "success",
          title: "Отличная активность!",
          description: `Вы откликнулись на ${proposalsTotal} заказов`,
          metric: { label: "Откликов", value: proposalsTotal, max: Math.max(proposalsTotal, 10) },
        });

        if (proposalsAccepted > 0) {
          const rate = (proposalsAccepted / proposalsTotal) * 100;
          newInsights.push({
            id: "2",
            type: rate > 50 ? "success" : "info",
            title: "Успешность откликов",
            description: `Принято ${proposalsAccepted} из ${proposalsTotal} (${rate.toFixed(0)}%)`,
            metric: { label: "Принято", value: proposalsAccepted, max: proposalsTotal },
          });
        }
      }

      newInsights.push({
        id: "3",
        type: "tip",
        title: "Улучшите профиль",
        description: "Добавьте проекты в портфолио для увеличения шансов на 40%",
        action: { label: "Обновить профиль", href: "/profile" },
      });
    } else {
      const inProgress = stats.orders?.in_progress || 0;

      if (inProgress > 0) {
        newInsights.push({
          id: "1",
          type: "success",
          title: "Проекты в работе",
          description: `У вас ${inProgress} активных проекта`,
          metric: { label: "Активных", value: inProgress, max: Math.max(inProgress, 5) },
        });
      }

      const ordersWithoutProposals = orders.filter((o) => o.status === "published" && (!o.proposals_count || o.proposals_count === 0));
      if (ordersWithoutProposals.length > 0) {
        const oldest = ordersWithoutProposals[0];
        const daysAgo = Math.floor((Date.now() - new Date(oldest.created_at).getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo >= 3) {
          newInsights.push({
            id: "2",
            type: "warning",
            title: "Требуется внимание",
            description: `Заказ "${oldest.title}" без откликов ${daysAgo} дней`,
            action: { label: "Редактировать", href: `/orders/${oldest.id}` },
          });
        }
      }

      newInsights.push({
        id: "3",
        type: "tip",
        title: "AI может помочь",
        description: "Используйте AI для улучшения описания заказов",
        action: { label: "Попробовать", href: "/orders/create?ai=true" },
      });
    }

    setInsights(newInsights);
  }, [data, userRole]);

  if (loading) {
    return embedded ? (
      <LoadingState type="list" count={2} height={80} />
    ) : (
      <StyledCard>
        <SectionHeader icon={Lightbulb} title="AI Инсайты" />
        <Box sx={{ mt: 2 }}>
          <LoadingState type="list" count={2} height={80} />
        </Box>
      </StyledCard>
    );
  }

  const content = insights.length === 0 ? (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <Typography variant="body2" sx={{ color: "var(--text-muted)", fontSize: 13 }}>Пока нет инсайтов</Typography>
    </Box>
  ) : (
    <Stack spacing={1.5}>
      {insights.map((insight) => <InsightItem key={insight.id} insight={insight} />)}
    </Stack>
  );

  if (embedded) return content;

  return (
    <StyledCard>
      <SectionHeader icon={Lightbulb} title="AI Инсайты" />
      <Box sx={{ mt: 2 }}>{content}</Box>
    </StyledCard>
  );
}
