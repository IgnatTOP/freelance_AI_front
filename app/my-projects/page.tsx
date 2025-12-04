"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Grid, Typography, Stack, Chip, Button, CardActions } from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import { Clock, MessageSquare, DollarSign, Briefcase } from "lucide-react";
import { authService } from "@/src/shared/lib/auth/auth.service";
import Link from "next/link";
import type { Order } from "@/src/entities/order/model/types";
import { formatPriceRange } from "@/src/shared/lib/utils";
import { PageContainer, StyledCard, EmptyState, LoadingState, MetaItem } from "@/src/shared/ui";

function ProjectCard({ order }: { order: Order }) {
  const getStatusColor = (status: string): "info" | "success" | "default" => {
    switch (status) {
      case "in_progress": return "info";
      case "completed": return "success";
      default: return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress": return "В работе";
      case "completed": return "Завершен";
      default: return status;
    }
  };

  return (
    <StyledCard noPadding sx={{ height: "100%" }}>
      <Stack spacing={2} sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Typography variant="h6" sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}>
            {order.title}
          </Typography>
          <Chip label={getStatusText(order.status)} color={getStatusColor(order.status)} size="small" />
        </Stack>

        <Typography
          variant="body2"
          sx={{
            color: "var(--text-muted)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {order.description}
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          {(order.budget_min || order.budget_max) && (
            <MetaItem icon={DollarSign} size="md">{formatPriceRange(order.budget_min || 0, order.budget_max || 0)}</MetaItem>
          )}
          {order.deadline_at && (
            <MetaItem icon={Clock} size="md">До {new Date(order.deadline_at).toLocaleDateString("ru-RU")}</MetaItem>
          )}
        </Stack>
      </Stack>

      <CardActions sx={{ px: 2, pb: 2, gap: 1, flexWrap: "wrap" }}>
        <Link href={`/orders/${order.id}`} style={{ textDecoration: "none" }}>
          <Button variant="text">Открыть</Button>
        </Link>
        <Link href={`/messages?order=${order.id}`} style={{ textDecoration: "none" }}>
          <Button variant="text" startIcon={<MessageSquare size={16} />}>Чат</Button>
        </Link>
      </CardActions>
    </StyledCard>
  );
}

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
      const { getMyProposals } = await import("@/src/shared/api/proposals");
      const proposals = await getMyProposals();
      const acceptedProposals = proposals.filter((p: any) => p.status === "accepted");
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

  return (
    <PageContainer title="Мои проекты" subtitle="Активные заказы, над которыми вы работаете">
      {loading ? (
        <LoadingState type="list" count={3} height={150} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="У вас пока нет активных проектов"
          description="Откликайтесь на заказы, чтобы начать работу"
          action={{ label: "Найти заказы", href: "/orders" }}
        />
      ) : (
        <Grid container spacing={2}>
          {orders.map((order) => (
            <Grid size={{ xs: 12 }} key={order.id}>
              <ProjectCard order={order} />
            </Grid>
          ))}
        </Grid>
      )}
    </PageContainer>
  );
}
