"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Skeleton,
  Box,
  Stack,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { formatCurrency } from "@/src/shared/lib/utils";
import { getStats } from "@/src/shared/api/stats";
import {
  Briefcase,
  FileText,
  CheckCircle,
  TrendingUp,
  Star,
  Wallet,
  Clock,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";

interface Stats {
  orders: {
    total: number;
    open: number;
    in_progress: number;
    completed: number;
    total_proposals?: number;
  };
  proposals?: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  balance: number;
  average_rating: number;
}

interface DashboardStatsProps {
  userRole: "client" | "freelancer" | null;
}

export function DashboardStats({ userRole }: DashboardStatsProps) {
  const theme = useTheme();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await getStats();
        setStats(statsData);
      } catch (error: any) {
        console.error("Error loading stats:", error);
        setStats({
          orders: {
            total: 0,
            open: 0,
            in_progress: 0,
            completed: 0,
            total_proposals: 0,
          },
          proposals: userRole === "freelancer" ? {
            total: 0,
            pending: 0,
            accepted: 0,
            rejected: 0,
          } : undefined,
          balance: 0,
          average_rating: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    if (userRole) {
      loadStats();
    }
  }, [userRole]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="80%" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const statsConfig =
    userRole === "client"
      ? [
          {
            title: "Всего заказов",
            value: stats.orders.total,
            icon: Briefcase,
            color: theme.palette.primary.main,
          },
          {
            title: "Активные",
            value: stats.orders.open,
            icon: Clock,
            color: theme.palette.info.main,
          },
          {
            title: "В работе",
            value: stats.orders.in_progress,
            icon: TrendingUp,
            color: theme.palette.warning.main,
          },
          {
            title: "Завершено",
            value: stats.orders.completed,
            icon: CheckCircle,
            color: theme.palette.success.main,
          },
        ]
      : [
          {
            title: "Откликов отправлено",
            value: stats.proposals?.total || 0,
            icon: FileText,
            color: theme.palette.primary.main,
          },
          {
            title: "На рассмотрении",
            value: stats.proposals?.pending || 0,
            icon: Clock,
            color: theme.palette.warning.main,
          },
          {
            title: "Принято",
            value: stats.proposals?.accepted || 0,
            icon: CheckCircle,
            color: theme.palette.success.main,
          },
          {
            title: "Проектов завершено",
            value: stats.orders.completed,
            icon: Award,
            color: theme.palette.primary.main,
          },
        ];

  const successRate =
    userRole === "client"
      ? stats.orders.total > 0
        ? ((stats.orders.completed / stats.orders.total) * 100).toFixed(0)
        : "0"
      : stats.proposals && stats.proposals.total > 0
      ? (((stats.proposals.accepted || 0) / stats.proposals.total) * 100).toFixed(0)
      : "0";

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3} width="100%">
          {/* Header */}
          <Stack direction="row" spacing={1} alignItems="center">
            <TrendingUp size={18} />
            <Typography variant="h6">Статистика</Typography>
          </Stack>

          {/* Main Stats Grid */}
          <Grid container spacing={2}>
            {statsConfig.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Grid size={{ xs: 6, sm: 6, md: 3 }} key={stat.title}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        background: theme.palette.background.paper,
                        borderColor: theme.palette.divider,
                        cursor: "pointer",
                        transition: "all 0.3s",
                        "&:hover": {
                          boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Stack spacing={1}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: "0.8125rem" }}
                          >
                            {stat.title}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Icon size={16} style={{ color: stat.color }} />
                            <Typography
                              variant="h4"
                              sx={{
                                fontWeight: "bold",
                                color: "text.primary",
                              }}
                            >
                              {stat.value}
                            </Typography>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>

          {/* Additional Stats */}
          <Grid container spacing={2}>
            {/* Rating */}
            <Grid size={{ xs: 24, sm: 8 }}>
              <Card
                sx={{
                  height: "100%",
                  background: theme.palette.background.paper,
                  borderColor: theme.palette.divider,
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.8125rem" }}
                    >
                      Рейтинг
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Star size={16} style={{ color: "#fbbf24", fill: "#fbbf24" }} />
                      <Typography variant="h5" fontWeight="bold">
                        {stats.average_rating.toFixed(1)}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Success Rate */}
            <Grid size={{ xs: 24, sm: 8 }}>
              <Card
                sx={{
                  height: "100%",
                  background: theme.palette.background.paper,
                  borderColor: theme.palette.divider,
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.8125rem" }}
                    >
                      {userRole === "client" ? "Завершено" : "Принято"}
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {successRate}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Number(successRate)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: theme.palette.background.default,
                        "& .MuiLinearProgress-bar": {
                          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
                        },
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Balance */}
            <Grid size={{ xs: 24, sm: 8 }}>
              <Card
                sx={{
                  height: "100%",
                  background: theme.palette.background.paper,
                  borderColor: theme.palette.divider,
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.8125rem" }}
                    >
                      Баланс
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Wallet size={14} />
                      <Typography variant="h5" fontWeight="bold">
                        {formatCurrency(stats.balance)}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
}
