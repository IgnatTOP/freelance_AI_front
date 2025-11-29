"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Button,
  Skeleton,
  Stack,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { getMyOrders, getOrders } from "@/src/shared/api/orders";
import {
  Briefcase,
  Clock,
  Wallet,
  ArrowRight,
  Calendar,
  Tag as TagIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatDate } from "@/src/shared/lib/utils/date-utils";
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
}

interface RecentOrdersProps {
  userRole: "client" | "freelancer" | null;
}

const statusConfig = {
  draft: { label: "Черновик", color: "default" as const },
  published: { label: "Опубликован", color: "info" as const },
  in_progress: { label: "В работе", color: "warning" as const },
  completed: { label: "Завершён", color: "success" as const },
  cancelled: { label: "Отменён", color: "error" as const },
};

export function RecentOrders({ userRole }: RecentOrdersProps) {
  const theme = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        if (userRole === "client") {
          // Для клиента - мои заказы
          const response = await getMyOrders();
          const myOrders = response.as_client || [];
          // Берем последние 5 заказов
          setOrders(myOrders.slice(0, 5));
        } else {
          // Для фрилансера - последние опубликованные заказы
          const response = await getOrders({
            status: "published",
            limit: 5,
            sort_by: "created_at",
            sort_order: "desc",
          });
          setOrders(response.data || []);
        }
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (userRole) {
      loadOrders();
    }
  }, [userRole]);

  const formatBudget = formatPriceRange;

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
          <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Briefcase size={18} />
            <Typography variant="h6">
              {userRole === "client" ? "Мои заказы" : "Последние заказы"}
            </Typography>
          </Stack>
          <Link href="/orders" style={{ textDecoration: 'none' }}>
            <Button
              size="small"
              endIcon={<ArrowRight size={14} />}
              sx={{ color: theme.palette.text.secondary }}
            >
              Все
            </Button>
          </Link>
        </Stack>

        {orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Нет заказов
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link href={`/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                  <ListItem
                    sx={{
                      cursor: 'pointer',
                      p: 2,
                      borderRadius: 1.5,
                      mb: 1,
                      background: theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.05)' : 'rgba(24, 144, 255, 0.03)',
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.12)' : 'rgba(24, 144, 255, 0.08)'}`,
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.08)' : 'rgba(24, 144, 255, 0.05)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '14px' }}>
                            {order.title}
                          </Typography>
                          <Chip
                            label={statusConfig[order.status].label}
                            color={statusConfig[order.status].color}
                            size="small"
                          />
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={1}>
                          {order.ai_summary && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '12px' }}>
                              {order.ai_summary}
                            </Typography>
                          )}
                          <Stack direction="row" spacing={1} divider={<span>•</span>} sx={{ fontSize: '12px' }}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Wallet size={12} />
                              <Typography variant="caption" color="text.secondary">
                                {formatBudget(order.budget_min, order.budget_max)}
                              </Typography>
                            </Stack>
                            {order.deadline_at && (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <Calendar size={12} />
                                <Typography variant="caption" color="text.secondary">
                                  До {formatDate(order.deadline_at)}
                                </Typography>
                              </Stack>
                            )}
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Clock size={12} />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(order.created_at)}
                              </Typography>
                            </Stack>
                            {order.proposals_count !== undefined && order.proposals_count > 0 && (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <TagIcon size={12} />
                                <Typography variant="caption" color="text.secondary">
                                  {order.proposals_count} откликов
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        </Stack>
                      }
                    />
                  </ListItem>
                </Link>
              </motion.div>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
