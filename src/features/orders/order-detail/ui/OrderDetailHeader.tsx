"use client";

import { Typography, Chip, Stack, Button, Box } from "@mui/material";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";
import type { Order } from "@/src/entities/order/model/types";
import { getOrderStatusColor, getOrderStatusLabel } from "@/src/shared/lib/order-utils";

dayjs.extend(relativeTime);
dayjs.locale("ru");

interface OrderDetailHeaderProps {
  order: Order;
}

export function OrderDetailHeader({ order }: OrderDetailHeaderProps) {
  const router = useRouter();

  return (
    <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
      <Button
        startIcon={<ArrowLeft size={18} />}
        onClick={() => router.back()}
        variant="outlined"
      >
        Назад
      </Button>
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h4" component="h1">
            {order.title}
          </Typography>
          <Chip
            label={getOrderStatusLabel(order.status)}
            color={getOrderStatusColor(order.status) as any}
            size="medium"
          />
        </Stack>
        <Stack
          direction="row"
          spacing={3}
          flexWrap="wrap"
          sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Clock size={14} />
            <span>Создан {dayjs(order.created_at).fromNow()}</span>
          </Stack>
          {order.deadline_at && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Calendar size={14} />
              <span>
                Срок: {dayjs(order.deadline_at).format("DD MMMM YYYY")}
              </span>
            </Stack>
          )}
        </Stack>
      </Box>
    </Stack>
  );
}

