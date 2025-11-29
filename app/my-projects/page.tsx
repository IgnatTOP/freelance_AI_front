"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Card,
  CardContent,
  CardActions,
  Grid,
  Typography,
  Stack,
  Chip,
  Button
} from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import { FileText, Clock, CheckCircle2, MessageSquare, DollarSign } from "lucide-react";
import { authService } from "@/src/shared/lib/auth/auth.service";
import Link from "next/link";
import type { Order } from "@/src/entities/order/model/types";
import { formatPriceRange } from "@/src/shared/lib/utils";

export default function MyProjectsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toastService.warning("Необходимо авторизоваться");
      router.push("/auth/login");
      return;
    }

    const user = authService.getCurrentUser();
    if (user?.role !== "freelancer" && user?.role !== "admin") {
      toastService.warning("Эта страница доступна только фрилансерам");
      router.push("/dashboard");
      return;
    }

    loadMyProjects();
  }, [router]);

  const loadMyProjects = async () => {
    try {
      setLoading(true);
      // Получаем предложения фрилансера
      const { getMyProposals } = await import("@/src/shared/api/proposals");
      const proposals = await getMyProposals();

      // Фильтруем только принятые предложения (активные проекты)
      const acceptedProposals = proposals.filter((p: any) => p.status === "accepted");

      // Получаем заказы для принятых предложений
      const orderIds = acceptedProposals.map((p: any) => p.order_id);
      const ordersData: Order[] = [];

      for (const orderId of orderIds) {
        try {
          const { getOrder } = await import("@/src/shared/api/orders");
          const order = await getOrder(orderId);
          if (order && (order.status === "in_progress" || order.status === "completed")) {
            ordersData.push(order);
          }
        } catch (err) {
          console.error(`Failed to load order ${orderId}:`, err);
        }
      }

      setOrders(ordersData);
    } catch (error: any) {
      console.error("Failed to load projects:", error);
      toastService.error("Не удалось загрузить проекты");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): "info" | "success" | "default" => {
    switch (status) {
      case "in_progress":
        return "info";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress":
        return "В работе";
      case "completed":
        return "Завершен";
      default:
        return status;
    }
  };

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
              Мои проекты
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Активные заказы, над которыми вы работаете
            </Typography>
          </Box>

          {loading ? (
            <Card>
              <CardContent>
                <Typography>Загрузка...</Typography>
              </CardContent>
            </Card>
          ) : orders.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                У вас пока нет активных проектов
              </Typography>
              <Link href="/orders" style={{ textDecoration: "none" }}>
                <Button variant="contained" sx={{ mt: 2, minHeight: 44 }}>
                  Найти заказы
                </Button>
              </Link>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {orders.map((order) => (
                <Grid item xs={12} key={order.id}>
                  <Card
                    sx={{
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
                          <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "auto" } }}>
                            <Typography
                              variant="h6"
                              component="h4"
                              gutterBottom
                              sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
                            >
                              {order.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {order.description}
                            </Typography>
                          </Box>
                          <Chip
                            label={getStatusText(order.status)}
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </Box>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                          {(order.budget_min || order.budget_max) && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <DollarSign size={16} />
                              <Typography variant="body2" fontWeight="bold">
                                {formatPriceRange(order.budget_min || 0, order.budget_max || 0)}
                              </Typography>
                            </Stack>
                          )}
                          {order.deadline_at && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Clock size={16} />
                              <Typography variant="body2" color="text.secondary">
                                До {new Date(order.deadline_at).toLocaleDateString("ru-RU")}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2, gap: 1, flexWrap: "wrap" }}>
                      <Link href={`/orders/${order.id}`} style={{ textDecoration: "none" }}>
                        <Button variant="text" sx={{ minHeight: 44 }}>
                          Открыть
                        </Button>
                      </Link>
                      <Link href={`/messages?order=${order.id}`} style={{ textDecoration: "none" }}>
                        <Button variant="text" startIcon={<MessageSquare size={16} />} sx={{ minHeight: 44 }}>
                          Чат
                        </Button>
                      </Link>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

