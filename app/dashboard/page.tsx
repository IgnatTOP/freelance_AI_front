"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Typography,
  Grid,
  Skeleton,
  Card,
  CardContent,
  Stack,
  Button,
  Badge,
  useTheme,
  Container
} from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import { getStats } from "@/src/shared/api/stats";
import { useAuth } from "@/src/shared/lib/hooks";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target,
  Rocket,
  MessageSquare,
  FileText,
  Users,
  Settings,
  BarChart3,
  Calendar,
  FolderKanban,
} from "lucide-react";
import { ActivityWidget } from "@/src/widgets/Dashboard/ActivityWidget";
import { ProjectsCards } from "@/src/widgets/Dashboard/ProjectsCards";
import { AIHub } from "@/src/widgets/Dashboard/AIHub";

export default function DashboardPage() {
  const router = useRouter();
  const theme = useTheme();
  const { user, profile, userRole, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    earnings: number;
    trend: {
      projects: number;
      earnings: number;
    };
  } | null>(null);
  const [quickStats, setQuickStats] = useState<{
    rating: number;
    completionRate: number;
    responseTimeHours: number;
    totalReviews: number;
  } | null>(null);

  useEffect(() => {
    if (authLoading) return;

    const loadStats = async () => {
      if (!user || !profile) return;

      setLoading(true);
      try {
        const statsData = await getStats();
        
        if (userRole === "client") {
          setStats({
            totalProjects: statsData.orders.total,
            activeProjects: statsData.orders.in_progress,
            completedProjects: statsData.orders.completed,
            earnings: statsData.balance,
            trend: {
              projects: statsData.orders.total > 0 ? Math.round((statsData.orders.in_progress / statsData.orders.total) * 100) : 0,
              earnings: 0, // TODO: добавить расчет тренда
            },
          });
        } else {
          setStats({
            totalProjects: statsData.proposals.total,
            activeProjects: statsData.proposals.pending,
            completedProjects: statsData.proposals.accepted,
            earnings: statsData.balance,
            trend: {
              projects: statsData.proposals.total > 0 ? Math.round((statsData.proposals.accepted / statsData.proposals.total) * 100) : 0,
              earnings: 0, // TODO: добавить расчет тренда
            },
          });
        }
        
        // Устанавливаем быструю статистику
        setQuickStats({
          rating: statsData.average_rating || 0,
          completionRate: statsData.completion_rate || 0,
          responseTimeHours: statsData.response_time_hours || 0,
          totalReviews: statsData.total_reviews || 0,
        });
      } catch (error: any) {
        console.error("Failed to load stats:", error);
        toastService.error("Не удалось загрузить статистику");
        // Устанавливаем значения по умолчанию
        setStats({
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          earnings: 0,
          trend: { projects: 0, earnings: 0 },
        });
        setQuickStats({
          rating: 0,
          completionRate: 0,
          responseTimeHours: 0,
          totalReviews: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user, profile, userRole, authLoading]);

  // Определение времени суток
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Доброе утро";
    if (hour < 18) return "Добрый день";
    return "Добрый вечер";
  };

  if (authLoading || loading) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'transparent' }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={200} />
          </Stack>
        </Container>
      </Box>
    );
  }

  // Используем реальные данные из API или значения по умолчанию
  const displayStats = stats || {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    earnings: 0,
    trend: {
      projects: 0,
      earnings: 0,
    },
  };

  const quickActions = userRole === "client"
    ? [
        {
          icon: Rocket,
          title: "Создать проект",
          description: "Опубликуйте новый заказ",
          color: theme.palette.primary.main,
          href: "/orders/create",
          badge: null,
        },
        {
          icon: Sparkles,
          title: "AI генератор",
          description: "Создать ТЗ с помощью AI",
          color: theme.palette.primary.main,
          href: "/orders/create?ai=true",
          badge: "NEW",
        },
        {
          icon: Users,
          title: "Фрилансеры",
          description: "Найти исполнителей",
          color: theme.palette.info.main,
          href: "/freelancers",
          badge: null,
        },
        {
          icon: MessageSquare,
          title: "Сообщения",
          description: "Чаты и уведомления",
          color: theme.palette.success.main,
          href: "/messages",
          badge: 3,
        },
        {
          icon: FileText,
          title: "Мои заказы",
          description: "Управление проектами",
          color: theme.palette.warning.main,
          href: "/orders",
          badge: null,
        },
        {
          icon: BarChart3,
          title: "Аналитика",
          description: "Статистика и отчеты",
          color: theme.palette.error.main,
          href: "/analytics",
          badge: null,
        },
      ]
    : [
        {
          icon: Target,
          title: "Найти заказы",
          description: "Просмотр активных проектов",
          color: theme.palette.primary.main,
          href: "/orders",
          badge: null,
        },
        {
          icon: Sparkles,
          title: "AI рекомендации",
          description: "Подходящие заказы для вас",
          color: theme.palette.primary.main,
          href: "/orders?ai=true",
          badge: "NEW",
        },
        {
          icon: FileText,
          title: "Мои отклики",
          description: "Управление предложениями",
          color: theme.palette.info.main,
          href: "/proposals",
          badge: null,
        },
        {
          icon: MessageSquare,
          title: "Сообщения",
          description: "Чаты с заказчиками",
          color: theme.palette.success.main,
          href: "/messages",
          badge: 5,
        },
        {
          icon: Calendar,
          title: "Мои проекты",
          description: "Активные заказы",
          color: theme.palette.warning.main,
          href: "/my-projects",
          badge: null,
        },
        {
          icon: Settings,
          title: "Профиль",
          description: "Настройки и портфолио",
          color: theme.palette.error.main,
          href: "/profile",
          badge: null,
        },
        {
          icon: FolderKanban,
          title: "Портфолио",
          description: "Мои работы и проекты",
          color: theme.palette.primary.main,
          href: "/portfolio",
          badge: null,
        },
      ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'transparent' }}>
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 2, md: 3 },
          px: { xs: 2, md: 4 }
        }}
      >
        <Stack spacing={4}>
          {/* HERO SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.background.paper} 100%)`,
                borderColor: theme.palette.divider,
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                <Grid container spacing={{ xs: 2, md: 4 }} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Stack spacing={1}>
                      <Typography variant="body1" color="text.secondary">
                        {getGreeting()}, {profile?.display_name || user?.username}!
                      </Typography>
                      <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
                        {userRole === "client" ? "Управляйте проектами эффективно" : "Найдите идеальный проект"}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {userRole === "client"
                          ? "У вас 8 активных проектов. 3 ожидают вашего внимания."
                          : "12 новых заказов подходят вашему профилю"
                        }
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                    <Link href={userRole === "client" ? "/orders/create" : "/orders?ai=true"} style={{ textDecoration: 'none' }}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={userRole === "client" ? <Rocket size={20} /> : <Sparkles size={20} />}
                        sx={{
                          height: 56,
                          fontSize: theme.typography.body1.fontSize,
                          borderRadius: 2,
                          px: 4,
                        }}
                      >
                        {userRole === "client" ? "Создать проект" : "AI рекомендации"}
                      </Button>
                    </Link>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>

          {/* QUICK METRICS */}
          <Grid container spacing={2}>
            {[
              {
                icon: FileText,
                title: userRole === "client" ? "Всего проектов" : "Откликов",
                value: displayStats.totalProjects,
                trend: displayStats.trend.projects,
                color: theme.palette.primary.main,
              },
              {
                icon: Clock,
                title: "Активных",
                value: displayStats.activeProjects,
                trend: displayStats.activeProjects > 0 ? 5 : 0,
                color: theme.palette.info.main,
              },
              {
                icon: CheckCircle2,
                title: "Завершено",
                value: displayStats.completedProjects,
                trend: displayStats.completedProjects > 0 ? 10 : 0,
                color: theme.palette.success.main,
              },
              {
                icon: Wallet,
                title: userRole === "client" ? "Потрачено" : "Заработано",
                value: displayStats.earnings > 0
                  ? `${(displayStats.earnings / 1000).toFixed(0)}K ₽`
                  : "0 ₽",
                trend: displayStats.trend.earnings,
                color: theme.palette.warning.main,
              },
            ].map((metric, index) => {
              const Icon = metric.icon;
              const TrendIcon = metric.trend >= 0 ? ArrowUpRight : ArrowDownRight;
              return (
                <Grid item xs={6} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        borderColor: theme.palette.divider,
                        borderRadius: 2,
                        height: '100%',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[4],
                        }
                      }}
                    >
                      <CardContent>
                        <Stack spacing={1}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 2,
                                background: `${metric.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Icon size={24} style={{ color: metric.color }} />
                            </Box>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <TrendIcon
                                size={16}
                                style={{ color: metric.trend >= 0 ? theme.palette.success.main : theme.palette.error.main }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  color: metric.trend >= 0 ? theme.palette.success.main : theme.palette.error.main,
                                }}
                              >
                                {Math.abs(metric.trend)}%
                              </Typography>
                            </Stack>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {metric.title}
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {metric.value}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>

          {/* MAIN LAYOUT */}
          <Grid container spacing={4}>
            {/* MAIN CONTENT */}
            <Grid item xs={12} lg={8} xl={8}>
              <Stack spacing={3}>
                {/* ACTION CENTER */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card
                    sx={{
                      borderColor: theme.palette.divider,
                      borderRadius: 2,
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <Zap size={20} style={{ color: theme.palette.primary.main }} />
                        <Typography variant="h6">Быстрые действия</Typography>
                      </Stack>
                      <Grid container spacing={2}>
                        {quickActions.map((action, index) => {
                          const Icon = action.icon;
                          return (
                            <Grid item xs={6} sm={4} md={4} key={index}>
                              <Link href={action.href} style={{ textDecoration: 'none' }}>
                                <motion.div
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Card
                                    sx={{
                                      borderColor: theme.palette.divider,
                                      borderRadius: 2,
                                      height: '100%',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                      '&:hover': {
                                        boxShadow: theme.shadows[4],
                                      }
                                    }}
                                  >
                                    <CardContent sx={{ p: 2 }}>
                                      <Stack spacing={1}>
                                        <Badge
                                          badgeContent={action.badge}
                                          color={action.badge === "NEW" ? "primary" : "error"}
                                          sx={{ alignSelf: 'flex-start' }}
                                        >
                                          <Box
                                            sx={{
                                              width: 40,
                                              height: 40,
                                              borderRadius: 1,
                                              background: `${action.color}15`,
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                            }}
                                          >
                                            <Icon size={20} style={{ color: action.color }} />
                                          </Box>
                                        </Badge>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          {action.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {action.description}
                                        </Typography>
                                      </Stack>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              </Link>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* RECENT ACTIVITY */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <ActivityWidget userRole={userRole} variant="grouped" />
                </motion.div>

                {/* PROJECTS */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <ProjectsCards userRole={userRole} />
                </motion.div>
              </Stack>
            </Grid>

            {/* SIDEBAR */}
            <Grid item xs={12} lg={4} xl={4}>
              <Stack spacing={3}>
                {/* AI HUB */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <AIHub userRole={userRole} />
                </motion.div>

                {/* STATS MINI */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card
                    sx={{
                      borderColor: theme.palette.divider,
                      borderRadius: 2,
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <BarChart3 size={20} style={{ color: theme.palette.primary.main }} />
                        <Typography variant="h6">Быстрая статистика</Typography>
                      </Stack>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Card
                            sx={{
                              background: `${theme.palette.primary.main}08`,
                              borderColor: theme.palette.divider,
                            }}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Stack spacing={0.5}>
                                <Typography variant="caption" color="text.secondary">
                                  Рейтинг
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {quickStats?.rating ? `${quickStats.rating.toFixed(1)} ⭐` : "0.0 ⭐"}
                                </Typography>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card
                            sx={{
                              background: `${theme.palette.success.main}08`,
                              borderColor: theme.palette.divider,
                            }}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Stack spacing={0.5}>
                                <Typography variant="caption" color="text.secondary">
                                  Выполнено
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {quickStats?.completionRate ? `${Math.round(quickStats.completionRate)}%` : "0%"}
                                </Typography>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card
                            sx={{
                              background: `${theme.palette.info.main}08`,
                              borderColor: theme.palette.divider,
                            }}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Stack spacing={0.5}>
                                <Typography variant="caption" color="text.secondary">
                                  Ответ
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {quickStats?.responseTimeHours
                                    ? quickStats.responseTimeHours < 1
                                      ? `${Math.round(quickStats.responseTimeHours * 60)} мин`
                                      : `${Math.round(quickStats.responseTimeHours)} ч`
                                    : "—"}
                                </Typography>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card
                            sx={{
                              background: `${theme.palette.warning.main}08`,
                              borderColor: theme.palette.divider,
                            }}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Stack spacing={0.5}>
                                <Typography variant="caption" color="text.secondary">
                                  Отзывы
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {quickStats?.totalReviews || 0}
                                </Typography>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
