"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Grid,
  Typography,
  Stack,
  Skeleton
} from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import { TrendingUp, TrendingDown, DollarSign, FileText, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/src/shared/lib/hooks";
import { getStats } from "@/src/shared/api/stats";

export default function AnalyticsPage() {
  const { userRole, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (authLoading) return;

    const loadStats = async () => {
      try {
        setLoading(true);
        const statsData = await getStats();
        setStats(statsData);
      } catch (error: any) {
        console.error("Failed to load stats:", error);
        toastService.error("Не удалось загрузить статистику");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <Box sx={{ minHeight: "100vh" }}>
        <Container
          maxWidth="xl"
          sx={{
            py: { xs: 2, md: 3 },
            px: { xs: 2, md: 3 }
          }}
        >
          <Stack spacing={2}>
            <Skeleton variant="text" width="40%" height={40} />
            <Skeleton variant="text" width="60%" />
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((i) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                  <Card>
                    <CardContent>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="80%" height={40} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Skeleton variant="rectangular" height={200} />
          </Stack>
        </Container>
      </Box>
    );
  }

  const StatisticCard = ({
    title,
    value,
    icon,
    color,
    suffix
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    suffix?: string;
  }) => (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ color, display: "flex", alignItems: "center" }}>
              {icon}
            </Box>
            <Typography
              variant="h4"
              component="div"
              sx={{
                color,
                fontSize: { xs: "1.5rem", md: "2.125rem" }
              }}
            >
              {value}
              {suffix && (
                <Typography
                  component="span"
                  sx={{
                    fontSize: { xs: "1rem", md: "1.25rem" },
                    ml: 0.5
                  }}
                >
                  {suffix}
                </Typography>
              )}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 2, md: 3 },
          px: { xs: 2, md: 3 }
        }}
      >
        <Stack spacing={{ xs: 2, md: 3 }}>
          <Box>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontSize: { xs: "1.5rem", md: "2.125rem" } }}>
              Аналитика
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Статистика и отчеты по вашей активности
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatisticCard
                title={userRole === "client" ? "Всего проектов" : "Всего откликов"}
                value={userRole === "client" ? stats?.orders?.total || 0 : stats?.proposals?.total || 0}
                icon={<FileText size={20} />}
                color="#1890ff"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatisticCard
                title="Активных"
                value={userRole === "client" ? stats?.orders?.in_progress || 0 : stats?.proposals?.pending || 0}
                icon={<Clock size={20} />}
                color="#52c41a"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatisticCard
                title="Завершено"
                value={userRole === "client" ? stats?.orders?.completed || 0 : stats?.proposals?.accepted || 0}
                icon={<CheckCircle2 size={20} />}
                color="#722ed1"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatisticCard
                title={userRole === "client" ? "Потрачено" : "Заработано"}
                value={stats?.balance || 0}
                icon={<DollarSign size={20} />}
                color="#fa8c16"
                suffix="₽"
              />
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Детальная статистика
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Детальная аналитика будет доступна в следующих версиях приложения.
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}

