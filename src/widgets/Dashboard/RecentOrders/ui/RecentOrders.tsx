"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Button, Skeleton, Stack, Typography, Box, Chip, List, ListItem, ListItemText } from "@mui/material";
import { getMyOrders, getOrders } from "@/src/shared/api/orders";
import { Briefcase, Clock, Wallet, ArrowRight, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/src/shared/lib/utils/date-utils";
import { formatPriceRange } from "@/src/shared/lib/utils";

interface Order {
  id: string;
  title: string;
  budget_min?: number;
  budget_max?: number;
  status: "draft" | "published" | "in_progress" | "pending_completion" | "completed" | "cancelled";
  deadline_at?: string;
  ai_summary?: string;
  created_at: string;
  proposals_count?: number;
}

interface RecentOrdersProps {
  userRole: "client" | "freelancer" | null;
}

const statusConfig: Record<string, { label: string; color: "default" | "info" | "warning" | "success" | "error" }> = {
  draft: { label: "Черновик", color: "default" },
  published: { label: "Опубликован", color: "info" },
  in_progress: { label: "В работе", color: "warning" },
  pending_completion: { label: "Ожидает подтверждения", color: "warning" },
  completed: { label: "Завершён", color: "success" },
  cancelled: { label: "Отменён", color: "error" },
};

export function RecentOrders({ userRole }: RecentOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        if (userRole === "client") {
          const response = await getMyOrders();
          setOrders((response.as_client || []).slice(0, 5));
        } else {
          const response = await getOrders({ status: "published", limit: 5, sort_by: "created_at", sort_order: "desc" });
          setOrders(response.data || []);
        }
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    if (userRole) loadOrders();
  }, [userRole]);

  if (loading) {
    return (
      <Card sx={{ background: "var(--glass-bg)", border: "1px solid var(--border)" }}>
        <CardContent>
          <Skeleton variant="text" width={150} height={24} />
          <Skeleton variant="rectangular" height={80} sx={{ mt: 2, borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={80} sx={{ mt: 1, borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ background: "var(--glass-bg)", border: "1px solid var(--border)" }}>
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Briefcase size={16} style={{ color: "var(--primary)" }} />
            <Typography variant="subtitle2" fontWeight={600}>{userRole === "client" ? "Мои заказы" : "Последние заказы"}</Typography>
          </Stack>
          <Link href="/orders" style={{ textDecoration: "none" }}>
            <Button size="small" endIcon={<ArrowRight size={14} />}>Все</Button>
          </Link>
        </Stack>

        {orders.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" sx={{ color: "var(--foreground-muted)" }}>Нет заказов</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} style={{ textDecoration: "none" }}>
                <ListItem sx={{ cursor: "pointer", p: 1.5, borderRadius: 1, mb: 1, bgcolor: "var(--primary-05)", border: "1px solid var(--border)", "&:hover": { borderColor: "var(--primary)" } }}>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" fontWeight={600}>{order.title}</Typography>
                        <Chip label={statusConfig[order.status]?.label || order.status} color={statusConfig[order.status]?.color || "default"} size="small" sx={{ height: 18, fontSize: 10 }} />
                      </Stack>
                    }
                    secondary={
                      <Stack spacing={0.5}>
                        {order.ai_summary && <Typography variant="caption" sx={{ color: "var(--foreground-muted)", fontSize: 11 }}>{order.ai_summary}</Typography>}
                        <Stack direction="row" spacing={1} divider={<span style={{ color: "var(--foreground-muted)" }}>•</span>} sx={{ fontSize: 10 }}>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Wallet size={10} />
                            <Typography variant="caption" sx={{ color: "var(--foreground-muted)", fontSize: 10 }}>{formatPriceRange(order.budget_min, order.budget_max)}</Typography>
                          </Stack>
                          {order.deadline_at && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Calendar size={10} />
                              <Typography variant="caption" sx={{ color: "var(--foreground-muted)", fontSize: 10 }}>До {formatDate(order.deadline_at)}</Typography>
                            </Stack>
                          )}
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Clock size={10} />
                            <Typography variant="caption" sx={{ color: "var(--foreground-muted)", fontSize: 10 }}>{formatDate(order.created_at)}</Typography>
                          </Stack>
                          {order.proposals_count !== undefined && order.proposals_count > 0 && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Tag size={10} />
                              <Typography variant="caption" sx={{ color: "var(--foreground-muted)", fontSize: 10 }}>{order.proposals_count} откликов</Typography>
                            </Stack>
                          )}
                        </Stack>
                      </Stack>
                    }
                  />
                </ListItem>
              </Link>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
