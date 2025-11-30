"use client";

import { toastService } from "@/src/shared/lib/toast";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Grid,
  Chip,
  Stack,
  Button,
  LinearProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { Briefcase, Clock, Wallet, Calendar, MessageSquare, CheckCircle } from "lucide-react";
import { getMyOrders } from "@/src/shared/api/orders";
import { authService } from "@/src/shared/lib/auth/auth.service";
import Link from "next/link";
import { formatPriceRange } from "@/src/shared/lib/utils";
import type { Order } from "@/src/entities/order/model/types";

const statusConfig = {
  in_progress: { label: "В работе", color: "info" as const, icon: Briefcase },
  completed: { label: "Завершён", color: "success" as const, icon: CheckCircle },
};

export default function InProgressOrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toastService.warning("Необходимо авторизоваться");
      router.push("/auth/login");
      return;
    }

    loadOrders();
  }, [router]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await getMyOrders();
      const allOrders = [
        ...(response.as_client || []),
        ...(response.as_freelancer || []),
      ].filter((order) => order.status === "in_progress" || order.status === "completed");

      setOrders(allOrders);
    } catch (error: any) {
      console.error("Error loading orders:", error);
      toastService.error(error.response?.data?.error || "Ошибка загрузки заказов");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const inProgressOrders = orders.filter((o) => o.status === "in_progress");
  const completedOrders = orders.filter((o) => o.status === "completed");

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 3, md: 5 }, maxWidth: 1200, mx: "auto", width: "100%" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Stack spacing={4}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h3" fontWeight={600}>
                Заказы в работе
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Отслеживайте прогресс выполнения ваших проектов
              </Typography>
            </Box>
            <Link href="/orders" style={{ textDecoration: 'none' }}>
              <Button variant="outlined">Все заказы</Button>
            </Link>
          </Box>

          {/* Stats */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    В работе
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {inProgressOrders.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    Завершено
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {completedOrders.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    Всего
                  </Typography>
                  <Typography variant="h4">
                    {orders.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Orders */}
          {loading ? (
            <Stack spacing={2}>
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={32} />
                    <Skeleton variant="text" sx={{ mt: 1 }} />
                    <Skeleton variant="text" width="40%" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent sx={{ p: 10, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  Нет заказов в работе
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Заказы в работе появятся здесь после принятия отклика
                </Typography>
                <Link href="/orders" style={{ textDecoration: 'none' }}>
                  <Button variant="contained" size="large">
                    Найти заказы
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={3}>
              {/* In Progress Section */}
              {inProgressOrders.length > 0 && (
                <Box>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    В работе ({inProgressOrders.length})
                  </Typography>
                  <Stack spacing={2}>
                    {inProgressOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Link href={`/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                          <Card
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: 4,
                                transform: 'translateY(-2px)',
                              },
                            }}
                          >
                            <CardContent>
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 8 }}>
                                  <Stack spacing={1.5}>
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                      <Briefcase size={20} color="currentColor" />
                                      <Typography variant="h6">
                                        {order.title}
                                      </Typography>
                                      <Chip
                                        label={statusConfig.in_progress.label}
                                        color={statusConfig.in_progress.color}
                                        size="small"
                                      />
                                    </Stack>
                                    {order.ai_summary && (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          display: '-webkit-box',
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: 'vertical',
                                        }}
                                      >
                                        {order.ai_summary}
                                      </Typography>
                                    )}
                                    <Stack direction="row" spacing={2} flexWrap="wrap">
                                      {order.budget_min && (
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                          <Wallet size={14} />
                                          <Typography variant="caption" color="text.secondary">
                                            {formatPriceRange(order.budget_min, order.budget_max)}
                                          </Typography>
                                        </Stack>
                                      )}
                                      {order.deadline_at && (
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                          <Calendar size={14} />
                                          <Typography variant="caption" color="text.secondary">
                                            До {formatDate(order.deadline_at)}
                                          </Typography>
                                        </Stack>
                                      )}
                                    </Stack>
                                  </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                  <Stack spacing={1}>
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                        Прогресс
                                      </Typography>
                                      <LinearProgress variant="determinate" value={50} sx={{ mb: 0.5 }} />
                                      <Typography variant="caption">50%</Typography>
                                    </Box>
                                    <Link href={`/messages?order=${order.id}`} style={{ textDecoration: 'none' }}>
                                      <Button
                                        variant="outlined"
                                        startIcon={<MessageSquare size={14} />}
                                        fullWidth
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        Открыть чат
                                      </Button>
                                    </Link>
                                  </Stack>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Completed Section */}
              {completedOrders.length > 0 && (
                <Box>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    Завершённые ({completedOrders.length})
                  </Typography>
                  <Stack spacing={2}>
                    {completedOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Link href={`/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                          <Card
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: 4,
                                transform: 'translateY(-2px)',
                              },
                            }}
                          >
                            <CardContent>
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 8 }}>
                                  <Stack spacing={1.5}>
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                      <CheckCircle size={20} color="green" />
                                      <Typography variant="h6">
                                        {order.title}
                                      </Typography>
                                      <Chip
                                        label={statusConfig.completed.label}
                                        color={statusConfig.completed.color}
                                        size="small"
                                      />
                                    </Stack>
                                    {order.ai_summary && (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          display: '-webkit-box',
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: 'vertical',
                                        }}
                                      >
                                        {order.ai_summary}
                                      </Typography>
                                    )}
                                  </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'right' }}>
                                  <Stack spacing={1} alignItems="flex-end">
                                    <Typography variant="caption" color="text.secondary">
                                      Завершён {formatDate(order.updated_at)}
                                    </Typography>
                                    <Button variant="outlined" fullWidth onClick={(e) => e.stopPropagation()}>
                                      Просмотреть
                                    </Button>
                                  </Stack>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </Stack>
      </motion.div>
    </Box>
  );
}
