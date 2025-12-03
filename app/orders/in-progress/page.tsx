"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Grid, Chip, Stack, Button, LinearProgress } from "@mui/material";
import { Briefcase, Clock, Wallet, Calendar, MessageSquare, CheckCircle, ArrowRight } from "lucide-react";
import { getMyOrders } from "@/src/shared/api/orders";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { toastService } from "@/src/shared/lib/toast";
import { PageContainer, EmptyState, StyledCard, StatCard, MetaItem, LoadingState } from "@/src/shared/ui";
import { formatPriceRange } from "@/src/shared/lib/utils";
import { formatDate } from "@/src/shared/lib/utils/date-utils";
import { iconSize, radius } from "@/src/shared/lib/constants/design";
import Link from "next/link";
import type { Order } from "@/src/entities/order/model/types";

function InProgressOrderCard({ order }: { order: Order }) {
  return (
    <Link href={`/orders/${order.id}`} style={{ textDecoration: "none" }}>
      <StyledCard interactive>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Briefcase size={iconSize.md} style={{ color: "var(--primary)" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 15 }}>{order.title}</Typography>
                <Chip label="В работе" color="info" size="small" sx={{ height: 22, fontSize: 11 }} />
              </Stack>
              {order.ai_summary && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "var(--text-muted)",
                    fontSize: 13,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {order.ai_summary}
                </Typography>
              )}
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {order.budget_min && <MetaItem icon={Wallet}>{formatPriceRange(order.budget_min, order.budget_max)}</MetaItem>}
                {order.deadline_at && <MetaItem icon={Calendar}>До {formatDate(order.deadline_at)}</MetaItem>}
              </Stack>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={1.5}>
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: "var(--text-muted)", fontSize: 11 }}>Прогресс</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 11 }}>50%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={50} sx={{ height: 4, borderRadius: `${radius.sm}px` }} />
              </Box>
              <Link href={`/messages?order=${order.id}`} style={{ textDecoration: "none" }} onClick={(e) => e.stopPropagation()}>
                <Button variant="outlined" size="small" startIcon={<MessageSquare size={iconSize.sm} />} fullWidth sx={{ fontSize: 12 }}>
                  Открыть чат
                </Button>
              </Link>
            </Stack>
          </Grid>
        </Grid>
      </StyledCard>
    </Link>
  );
}

function CompletedOrderCard({ order }: { order: Order }) {
  return (
    <Link href={`/orders/${order.id}`} style={{ textDecoration: "none" }}>
      <StyledCard interactive>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CheckCircle size={iconSize.lg} style={{ color: "var(--success)" }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 15 }}>{order.title}</Typography>
              <Typography variant="caption" sx={{ color: "var(--text-muted)", fontSize: 11 }}>
                Завершён {formatDate(order.updated_at)}
              </Typography>
            </Box>
          </Stack>
          <Chip label="Завершён" color="success" size="small" sx={{ height: 22, fontSize: 11 }} />
        </Stack>
      </StyledCard>
    </Link>
  );
}

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
      const allOrders = [...(response.as_client || []), ...(response.as_freelancer || [])]
        .filter((order) => order.status === "in_progress" || order.status === "completed");
      setOrders(allOrders);
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Ошибка загрузки");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const inProgressOrders = orders.filter((o) => o.status === "in_progress");
  const completedOrders = orders.filter((o) => o.status === "completed");

  return (
    <PageContainer
      title="Мои проекты"
      subtitle="Отслеживайте прогресс выполнения"
      actions={
        <Link href="/orders" style={{ textDecoration: "none" }}>
          <Button variant="outlined" endIcon={<ArrowRight size={iconSize.sm} />}>Все заказы</Button>
        </Link>
      }
    >
      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 4 }}>
          <StatCard icon={Clock} label="В работе" value={inProgressOrders.length} color="var(--info)" bg="rgba(59, 130, 246, 0.1)" />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <StatCard icon={CheckCircle} label="Завершено" value={completedOrders.length} color="var(--success)" bg="rgba(16, 185, 129, 0.1)" />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <StatCard icon={Briefcase} label="Всего" value={orders.length} />
        </Grid>
      </Grid>

      {/* Orders */}
      {loading ? (
        <LoadingState type="list" count={3} height={120} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Нет проектов"
          description="Заказы появятся здесь после принятия отклика"
          action={{ label: "Найти заказы", href: "/orders" }}
        />
      ) : (
        <Stack spacing={3}>
          {/* In Progress */}
          {inProgressOrders.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, fontSize: 16 }}>
                В работе ({inProgressOrders.length})
              </Typography>
              <Stack spacing={2}>
                {inProgressOrders.map((order) => <InProgressOrderCard key={order.id} order={order} />)}
              </Stack>
            </Box>
          )}

          {/* Completed */}
          {completedOrders.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, fontSize: 16 }}>
                Завершённые ({completedOrders.length})
              </Typography>
              <Stack spacing={2}>
                {completedOrders.map((order) => <CompletedOrderCard key={order.id} order={order} />)}
              </Stack>
            </Box>
          )}
        </Stack>
      )}
    </PageContainer>
  );
}
