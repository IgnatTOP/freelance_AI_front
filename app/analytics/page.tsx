"use client";

import { useState, useEffect } from "react";
import { Grid, Typography, Stack, Box } from "@mui/material";
import { TrendingUp, DollarSign, FileText, Clock, CheckCircle2 } from "lucide-react";
import { PageContainer, StyledCard, StatCard, LoadingState } from "@/src/shared/ui";
import { useAuth } from "@/src/shared/lib/hooks";
import { getStats } from "@/src/shared/api/stats";
import { toastService } from "@/src/shared/lib/toast";

export default function AnalyticsPage() {
  const { userRole, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const isClient = userRole === "client" || userRole === "admin";

  useEffect(() => {
    if (authLoading) return;

    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await getStats();
        setStats(data);
      } catch {
        toastService.error("Не удалось загрузить статистику");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [authLoading]);

  const statsConfig = isClient
    ? [
        { label: "Всего заказов", value: stats?.orders?.total || 0, icon: FileText },
        { label: "В работе", value: stats?.orders?.in_progress || 0, icon: Clock },
        { label: "Завершено", value: stats?.orders?.completed || 0, icon: CheckCircle2 },
        { label: "Потрачено", value: stats?.balance ? `${(stats.balance / 1000).toFixed(0)}K ₽` : "0 ₽", icon: DollarSign },
      ]
    : [
        { label: "Откликов", value: stats?.proposals?.total || 0, icon: FileText },
        { label: "Ожидают", value: stats?.proposals?.pending || 0, icon: Clock },
        { label: "Принято", value: stats?.proposals?.accepted || 0, icon: CheckCircle2 },
        { label: "Заработано", value: stats?.balance ? `${(stats.balance / 1000).toFixed(0)}K ₽` : "0 ₽", icon: DollarSign },
      ];

  return (
    <PageContainer
      title="Аналитика"
      subtitle={isClient ? "Статистика ваших проектов" : "Статистика вашей работы"}
      loading={authLoading || loading}
    >
      {loading ? (
        <LoadingState type="cards" count={4} height={120} />
      ) : (
        <Stack spacing={3}>
          {/* Main Stats */}
          <Grid container spacing={2}>
            {statsConfig.map((stat, index) => (
              <Grid size={{ xs: 6, md: 3 }} key={index}>
                <StatCard icon={stat.icon} label={stat.label} value={stat.value} />
              </Grid>
            ))}
          </Grid>

          {/* Additional Stats */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <StyledCard>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Рейтинг
                </Typography>
                <Stack direction="row" spacing={2} alignItems="baseline">
                  <Typography variant="h3" fontWeight={700}>
                    {stats?.average_rating?.toFixed(1) || "0.0"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
                    из 5.0 ({stats?.total_reviews || 0} отзывов)
                  </Typography>
                </Stack>
              </StyledCard>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <StyledCard>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Выполнение
                </Typography>
                <Stack direction="row" spacing={2} alignItems="baseline">
                  <Typography variant="h3" fontWeight={700}>
                    {Math.round(stats?.completion_rate || 0)}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
                    успешно завершённых проектов
                  </Typography>
                </Stack>
              </StyledCard>
            </Grid>
          </Grid>
        </Stack>
      )}
    </PageContainer>
  );
}
