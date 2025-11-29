"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Button, Skeleton, Stack, Typography, Box, Chip, LinearProgress, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid";
import { getMyOrders, getOrders } from "@/src/shared/api/orders";
import {
  Briefcase,
  Clock,
  Wallet,
  ArrowRight,
  Calendar,
  User,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDate as formatDateUtil } from "@/src/shared/lib/utils/date-utils";
import Link from "next/link";
import { formatPriceRange } from "@/src/shared/lib/utils";

interface Order {
  id: string;
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  status: "draft" | "published" | "in_progress" | "completed" | "cancelled";
  deadline_at?: string;
  ai_summary?: string;
  created_at: string;
  proposals_count?: number;
  progress?: number;
}

interface ProjectsCardsProps {
  userRole: "client" | "freelancer" | null;
}

const statusConfig = {
  draft: { label: "Черновик", color: "default" as const },
  published: { label: "Опубликован", color: "info" as const },
  in_progress: { label: "В работе", color: "warning" as const },
  completed: { label: "Завершён", color: "success" as const },
  cancelled: { label: "Отменён", color: "error" as const },
};

export function ProjectsCards({ userRole }: ProjectsCardsProps) {
  const theme = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        if (userRole === "client") {
          const response = await getMyOrders();
          const myOrders = response.as_client || [];
          setOrders(myOrders.slice(0, 3));
        } else {
          const response = await getOrders({
            status: "published",
            limit: 3,
            sort_by: "created_at",
            sort_order: "desc",
          });
          setOrders(response.data || []);
        }
      } catch (error) {
        console.error("Error loading orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (userRole) {
      loadOrders();
    }
  }, [userRole]);

  const formatDate = (dateString: string) =>
    formatDateUtil(dateString, { includeYear: true });

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
            <Briefcase size={20} />
            <Typography variant="h6">{userRole === "client" ? "Мои проекты" : "Доступные заказы"}</Typography>
          </Box>
          <Skeleton variant="rectangular" height={120} />
          <Skeleton variant="rectangular" height={120} sx={{ mt: 2 }} />
          <Skeleton variant="rectangular" height={120} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Briefcase size={20} style={{ color: theme.palette.primary.main }} />
            <Typography variant="h6">{userRole === "client" ? "Мои проекты" : "Доступные заказы"}</Typography>
          </Box>
          <Link href="/orders" style={{ textDecoration: 'none' }}>
            <Button variant="text" endIcon={<ArrowRight size={16} />}>
              Все
            </Button>
          </Link>
        </Box>

        {orders.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary">
              {userRole === "client" ? "Нет проектов" : "Нет доступных заказов"}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {orders.map((order, index) => {
              const statusInfo = statusConfig[order.status];
              const progress = order.status === "in_progress"
                ? 50
                : order.status === "completed"
                ? 100
                : 0;

              return (
                <Grid size={{ xs: 12 }} key={order.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link href={`/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: 2,
                          }
                        }}
                      >
                        <CardContent>
                          <Stack spacing={2}>
                            {/* Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 1,
                                    bgcolor: `${theme.palette.primary.main}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Briefcase size={20} style={{ color: theme.palette.primary.main }} />
                                </Box>
                                <Box>
                                  <Typography variant="body1" fontWeight="bold">
                                    {order.title}
                                  </Typography>
                                  <Chip label={statusInfo.label} color={statusInfo.color} size="small" sx={{ mt: 0.5 }} />
                                </Box>
                              </Box>
                            </Box>

                            {/* Description */}
                            {order.ai_summary && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {order.ai_summary}
                              </Typography>
                            )}

                            {/* Progress Bar */}
                            {progress > 0 && (
                              <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Прогресс
                                  </Typography>
                                  <Typography variant="caption" fontWeight="bold">
                                    {progress}%
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={progress}
                                  sx={{
                                    height: 6,
                                    borderRadius: 1,
                                    bgcolor: theme.palette.background.default,
                                  }}
                                />
                              </Box>
                            )}

                            {/* Meta Info */}
                            <Grid container spacing={1}>
                              <Grid size={{ xs: 12, sm: 4 }}>
                                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                  <Wallet size={14} style={{ color: theme.palette.text.secondary }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {formatPriceRange(order.budget_min, order.budget_max)}
                                  </Typography>
                                </Box>
                              </Grid>
                              {order.deadline_at && (
                                <Grid size={{ xs: 12, sm: 4 }}>
                                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                    <Calendar size={14} style={{ color: theme.palette.text.secondary }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {formatDate(order.deadline_at)}
                                    </Typography>
                                  </Box>
                                </Grid>
                              )}
                              {order.proposals_count !== undefined && order.proposals_count > 0 && (
                                <Grid size={{ xs: 12, sm: 4 }}>
                                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                    <User size={14} style={{ color: theme.palette.text.secondary }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {order.proposals_count} откликов
                                    </Typography>
                                  </Box>
                                </Grid>
                              )}
                            </Grid>

                            {/* Footer Actions */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                <Clock size={14} style={{ color: theme.palette.text.secondary }} />
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(order.created_at)}
                                </Typography>
                              </Box>
                              {userRole === "client" && (
                                <Button
                                  variant="text"
                                  size="small"
                                  startIcon={<MessageSquare size={14} />}
                                  sx={{ fontSize: '0.75rem' }}
                                >
                                  Сообщения
                                </Button>
                              )}
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* View All Button */}
        {orders.length > 0 && (
          <Link href="/orders" style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              endIcon={<ArrowRight size={16} />}
              sx={{ mt: 2 }}
            >
              {userRole === "client" ? "Все проекты" : "Все заказы"}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
