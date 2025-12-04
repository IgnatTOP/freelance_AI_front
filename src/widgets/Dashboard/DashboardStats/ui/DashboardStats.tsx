"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Typography, LinearProgress, Skeleton, Box, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import { formatCurrency } from "@/src/shared/lib/utils";
import { getStats } from "@/src/shared/api/stats";
import { Briefcase, FileText, CheckCircle, TrendingUp, Star, Wallet, Clock, Award } from "lucide-react";

interface Stats {
  orders: { total: number; open: number; in_progress: number; completed: number };
  proposals?: { total: number; pending: number; accepted: number; rejected: number };
  balance: number;
  average_rating: number;
}

interface DashboardStatsProps {
  userRole: "client" | "freelancer" | null;
}

export function DashboardStats({ userRole }: DashboardStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch {
        setStats({ orders: { total: 0, open: 0, in_progress: 0, completed: 0 }, balance: 0, average_rating: 0 });
      } finally {
        setLoading(false);
      }
    };
    if (userRole) loadStats();
  }, [userRole]);

  if (loading) {
    return (
      <Card sx={{ background: "var(--glass-bg)", border: "1px solid var(--border)" }}>
        <CardContent>
          <Skeleton variant="text" width="40%" height={28} />
          <Skeleton variant="rectangular" height={80} sx={{ mt: 2, borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const statsConfig = userRole === "client"
    ? [
        { title: "Всего заказов", value: stats.orders.total, icon: Briefcase, color: "var(--primary)" },
        { title: "Активные", value: stats.orders.open, icon: Clock, color: "#14b8a6" },
        { title: "В работе", value: stats.orders.in_progress, icon: TrendingUp, color: "#f59e0b" },
        { title: "Завершено", value: stats.orders.completed, icon: CheckCircle, color: "#10b981" },
      ]
    : [
        { title: "Откликов", value: stats.proposals?.total || 0, icon: FileText, color: "var(--primary)" },
        { title: "На рассмотрении", value: stats.proposals?.pending || 0, icon: Clock, color: "#f59e0b" },
        { title: "Принято", value: stats.proposals?.accepted || 0, icon: CheckCircle, color: "#10b981" },
        { title: "Завершено", value: stats.orders.completed, icon: Award, color: "var(--primary)" },
      ];

  const successRate = userRole === "client"
    ? stats.orders.total > 0 ? ((stats.orders.completed / stats.orders.total) * 100).toFixed(0) : "0"
    : stats.proposals && stats.proposals.total > 0 ? ((stats.proposals.accepted / stats.proposals.total) * 100).toFixed(0) : "0";

  return (
    <Card sx={{ background: "var(--glass-bg)", border: "1px solid var(--border)" }}>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TrendingUp size={16} style={{ color: "var(--primary)" }} />
            <Typography variant="subtitle2" fontWeight={600}>Статистика</Typography>
          </Stack>

          <Grid container spacing={1.5}>
            {statsConfig.map((stat) => {
              const Icon = stat.icon;
              return (
                <Grid size={{ xs: 6, md: 3 }} key={stat.title}>
                  <Card sx={{ height: "100%", border: "1px solid var(--border)", cursor: "pointer", "&:hover": { borderColor: "var(--primary)" } }}>
                    <CardContent sx={{ p: 1.5 }}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" sx={{ color: "var(--foreground-muted)", fontSize: 11 }}>{stat.title}</Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Icon size={14} style={{ color: stat.color }} />
                          <Typography variant="h6" fontWeight={600}>{stat.value}</Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ height: "100%", border: "1px solid var(--border)" }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ color: "var(--foreground-muted)", fontSize: 11 }}>Рейтинг</Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Star size={14} style={{ color: "#fbbf24", fill: "#fbbf24" }} />
                      <Typography variant="h6" fontWeight={600}>{stats.average_rating.toFixed(1)}</Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ height: "100%", border: "1px solid var(--border)" }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ color: "var(--foreground-muted)", fontSize: 11 }}>{userRole === "client" ? "Завершено" : "Принято"}</Typography>
                    <Typography variant="h6" fontWeight={600} sx={{ color: "#10b981" }}>{successRate}%</Typography>
                    <LinearProgress variant="determinate" value={Number(successRate)} sx={{ height: 4, borderRadius: 1 }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ height: "100%", border: "1px solid var(--border)" }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ color: "var(--foreground-muted)", fontSize: 11 }}>Баланс</Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Wallet size={14} style={{ color: "var(--primary)" }} />
                      <Typography variant="h6" fontWeight={600}>{formatCurrency(stats.balance)}</Typography>
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
