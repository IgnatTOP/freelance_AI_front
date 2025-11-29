"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Skeleton,
  LinearProgress,
  Alert,
  Stack,
  Typography,
  List,
  ListItem,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { getMyOrders, getOrders } from "@/src/shared/api/orders";
import { getStats } from "@/src/shared/api/stats";
import { aiService } from "@/src/shared/lib/ai";
import {
  TrendingUp,
  Target,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Insight {
  id: string;
  type: "success" | "warning" | "info" | "tip";
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  metric?: {
    label: string;
    value: number;
    max: number;
  };
}

interface AIInsightsProps {
  userRole: "client" | "freelancer" | null;
  embedded?: boolean; // Если true, не показываем Card обёртку
}

export function AIInsights({ userRole, embedded = false }: AIInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        // Получаем статистику для генерации инсайтов
        const stats = await getStats();

        // Получаем заказы для анализа
        let orders;
        if (userRole === "client") {
          const ordersResponse = await getMyOrders();
          orders = ordersResponse.as_client || [];
        } else {
          const ordersResponse = await getOrders({
            limit: 10,
            status: "published",
          });
          orders = ordersResponse.data || [];
        }

        const insights: Insight[] = [];

        if (userRole === "freelancer") {
          // Инсайты для фрилансера
          const proposalsTotal = stats.proposals?.total || 0;
          const proposalsAccepted = stats.proposals?.accepted || 0;
          
          if (proposalsTotal > 0) {
            insights.push({
              id: "1",
              type: "success",
              title: "Отличная активность!",
              description: `Вы откликнулись на ${proposalsTotal} заказов. Продолжайте в том же духе!`,
              metric: {
                label: "Откликов отправлено",
                value: proposalsTotal,
                max: Math.max(proposalsTotal, 10),
              },
            });
          }

          if (proposalsAccepted > 0) {
            const successRate = (proposalsAccepted / proposalsTotal) * 100;
            insights.push({
              id: "2",
              type: successRate > 50 ? "success" : "info",
              title: "Успешность откликов",
              description: `Принято ${proposalsAccepted} из ${proposalsTotal} откликов (${successRate.toFixed(0)}%)`,
              metric: {
                label: "Принято откликов",
                value: proposalsAccepted,
                max: proposalsTotal,
              },
            });
          }

          insights.push({
            id: "3",
            type: "tip",
            title: "Улучшите профиль",
            description: "Добавьте больше проектов в портфолио. Это увеличит ваши шансы на получение заказов на 40%.",
            action: {
              label: "Обновить профиль",
              href: "/profile",
            },
          });

          if (orders.length > 0) {
            insights.push({
              id: "4",
              type: "info",
              title: "Новые заказы",
              description: `Доступно ${orders.length} новых заказов, подходящих вашим навыкам.`,
              action: {
                label: "Посмотреть заказы",
                href: "/orders",
              },
            });
          }
        } else {
          // Инсайты для клиента
          const inProgress = stats.orders?.in_progress || 0;
          const total = stats.orders?.total || 0;
          
          if (inProgress > 0) {
            insights.push({
              id: "1",
              type: "success",
              title: "Проекты в работе",
              description: `У вас ${inProgress} активных проекта. Все идет по плану!`,
              metric: {
                label: "Активных проектов",
                value: inProgress,
                max: Math.max(inProgress, 5),
              },
            });
          }

          // Находим заказы без откликов
          const ordersWithoutProposals = orders.filter(
            (order: any) => order.status === "published" && (!order.proposals_count || order.proposals_count === 0)
          );

          if (ordersWithoutProposals.length > 0) {
            const oldestOrder = ordersWithoutProposals[0];
            const daysAgo = Math.floor(
              (Date.now() - new Date(oldestOrder.created_at).getTime()) / (1000 * 60 * 60 * 24)
            );
            
            if (daysAgo >= 3) {
              insights.push({
                id: "2",
                type: "warning",
                title: "Требуется внимание",
                description: `У заказа "${oldestOrder.title}" нет откликов уже ${daysAgo} дней. Попробуйте улучшить описание.`,
                action: {
                  label: "Редактировать заказ",
                  href: `/orders/${oldestOrder.id}`,
                },
              });
            }
          }

          insights.push({
            id: "3",
            type: "tip",
            title: "AI может помочь",
            description: "Используйте AI для улучшения описания заказов и поиска подходящих фрилансеров.",
            action: {
              label: "Попробовать AI",
              href: "/orders/create?ai=true",
            },
          });
        }

        setInsights(insights);
      } catch {
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };

    if (userRole) {
      loadInsights();
    }
  }, [userRole]);

  const getIcon = (type: Insight["type"]) => {
    switch (type) {
      case "success":
        return CheckCircle;
      case "warning":
        return AlertCircle;
      case "info":
        return Target;
      case "tip":
        return Lightbulb;
      default:
        return TrendingUp;
    }
  };

  const getColor = (type: Insight["type"]) => {
    switch (type) {
      case "success":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "warning":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "info":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "tip":
        return "text-purple-400 bg-purple-400/10 border-purple-400/20";
      default:
        return "text-primary bg-primary/10 border-primary/20";
    }
  };

  const getAlertSeverity = (type: Insight["type"]): "success" | "warning" | "info" | "error" => {
    switch (type) {
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "info":
      case "tip":
        return "info";
      default:
        return "info";
    }
  };

  const theme = useTheme();

  const content = (
    <>
      {insights.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Пока нет инсайтов
          </Typography>
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {insights.map((insight, index) => {
            const Icon = getIcon(insight.type);
            const alertSeverity = getAlertSeverity(insight.type);

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ListItem sx={{ p: 0, mb: 2 }}>
                  <Alert
                    severity={alertSeverity}
                    icon={<Icon size={18} />}
                    sx={{
                      width: '100%',
                      borderRadius: 1.5,
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '14px' }}>
                          {insight.title}
                        </Typography>
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: '12px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {insight.description}
                      </Typography>

                      {insight.metric && (
                        <Box sx={{ mt: 1 }}>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '12px' }}>
                              {insight.metric.label}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 600 }}>
                              {insight.metric.value} / {insight.metric.max}
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={(insight.metric.value / insight.metric.max) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 1,
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.06)' : 'rgba(24, 144, 255, 0.04)',
                            }}
                          />
                        </Box>
                      )}

                      {insight.action && (
                        <Link href={insight.action.href} style={{ textDecoration: 'none' }}>
                          <Button
                            size="small"
                            endIcon={<ArrowRight size={14} />}
                            sx={{ p: 0, mt: 1 }}
                          >
                            {insight.action.label}
                          </Button>
                        </Link>
                      )}
                    </Stack>
                  </Alert>
                </ListItem>
              </motion.div>
            );
          })}
        </List>
      )}
    </>
  );

  if (loading) {
    return embedded ? (
      <Skeleton variant="rectangular" height={200} />
    ) : (
      <Card>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Lightbulb size={20} />
            <Typography variant="h6">AI Инсайты</Typography>
          </Stack>
          <Skeleton variant="rectangular" height={100} />
          <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (embedded) {
    return content;
  }

  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, position: 'relative' }}>
          <Box sx={{ position: 'relative' }}>
            <Lightbulb size={20} />
            <motion.div
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: theme.palette.primary.main,
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [1, 0.6, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </Box>
          <Typography variant="h6">AI Инсайты</Typography>
        </Stack>
        {content}
      </CardContent>
    </Card>
  );
}

