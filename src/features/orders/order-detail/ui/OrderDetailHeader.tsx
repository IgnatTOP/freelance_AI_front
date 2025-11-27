"use client";

import { Typography, Tag, Space, Button as AntButton } from "antd";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";
import type { Order } from "@/src/entities/order/model/types";
import { getOrderStatusColor, getOrderStatusLabel } from "@/src/shared/lib/order-utils";

dayjs.extend(relativeTime);
dayjs.locale("ru");

const { Title, Text } = Typography;

interface OrderDetailHeaderProps {
  order: Order;
}

export function OrderDetailHeader({ order }: OrderDetailHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4 mb-6">
      <AntButton
        icon={<ArrowLeft size={18} />}
        onClick={() => router.back()}
      >
        Назад
      </AntButton>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <Title level={2} className="mb-0">
            {order.title}
          </Title>
          <Tag color={getOrderStatusColor(order.status)}>
            {getOrderStatusLabel(order.status)}
          </Tag>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-tertiary">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>Создан {dayjs(order.created_at).fromNow()}</span>
          </div>
          {order.deadline_at && (
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>
                Срок: {dayjs(order.deadline_at).format("DD MMMM YYYY")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

