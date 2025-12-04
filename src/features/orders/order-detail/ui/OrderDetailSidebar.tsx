"use client";

import Link from "next/link";
import { Card, Typography, Chip, Button, Stack, Box } from "@mui/material";
import { Wallet } from "lucide-react";
import dayjs from "dayjs";
import type { Order } from "@/src/entities/order/model/types";
import { formatPriceRange } from "@/src/shared/lib/utils";
import { getOrderStatusColor, getOrderStatusLabel } from "@/src/shared/lib/order-utils";

interface OrderDetailSidebarProps {
  order: Order;
  userRole: "client" | "freelancer" | null;
  isOwner: boolean;
  orderId: string;
}

export function OrderDetailSidebar({
  order,
  userRole,
  isOwner,
  orderId,
}: OrderDetailSidebarProps) {
  return (
    <Stack spacing={3}>
      {/* Budget */}
      {(order.budget_min || order.budget_max) && (
        <Card sx={{ p: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <Wallet size={20} />
            <Typography variant="h6">Бюджет</Typography>
          </Stack>
          <Typography variant="h4" fontWeight="bold">
            {formatPriceRange(order.budget_min, order.budget_max)}
          </Typography>
        </Card>
      )}

      {/* Actions */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Действия
        </Typography>
        <Stack spacing={1.5}>
          {userRole === "freelancer" && order.status === "published" && (
            <Link href={`/orders/${orderId}/proposal`} style={{ textDecoration: 'none' }}>
              <Button variant="contained" fullWidth>
                Откликнуться на заказ
              </Button>
            </Link>
          )}
          {isOwner && (
            <>
              <Link href={`/orders/${orderId}/edit`} style={{ textDecoration: 'none' }}>
                <Button variant="outlined" fullWidth>
                  Редактировать заказ
                </Button>
              </Link>
              <Link href={`/orders/${orderId}/proposals`} style={{ textDecoration: 'none' }}>
                <Button variant="outlined" fullWidth>
                  Просмотреть отклики
                </Button>
              </Link>
            </>
          )}
          <Link href={`/orders/${orderId}/chat`} style={{ textDecoration: 'none' }}>
            <Button variant="outlined" fullWidth>
              Открыть чат
            </Button>
          </Link>
        </Stack>
      </Card>

      {/* Info */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Информация
        </Typography>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Статус:
            </Typography>
            <Chip
              label={getOrderStatusLabel(order.status)}
              color={getOrderStatusColor(order.status) as any}
              size="small"
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Создан:
            </Typography>
            <Typography variant="body2">
              {dayjs(order.created_at).format("DD.MM.YYYY HH:mm")}
            </Typography>
          </Box>
          {order.deadline_at && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Срок:
              </Typography>
              <Typography variant="body2">
                {dayjs(order.deadline_at).format("DD.MM.YYYY")}
              </Typography>
            </Box>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}

