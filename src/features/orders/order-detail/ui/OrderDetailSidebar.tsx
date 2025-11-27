"use client";

import Link from "next/link";
import { Card, Typography, Tag, Button as AntButton, Space } from "antd";
import { Wallet } from "lucide-react";
import dayjs from "dayjs";
import type { Order } from "@/src/entities/order/model/types";
import { formatPriceRange } from "@/src/shared/lib/utils";
import { getOrderStatusColor, getOrderStatusLabel } from "@/src/shared/lib/order-utils";

const { Title, Text } = Typography;

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
    <div className="space-y-6">
      {/* Budget */}
      {(order.budget_min || order.budget_max) && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={20} className="text-primary" />
            <Title level={5} className="mb-0">Бюджет</Title>
          </div>
          <Text className="text-2xl font-bold">
            {formatPriceRange(order.budget_min, order.budget_max)}
          </Text>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <Title level={5} className="mb-4">Действия</Title>
        <Space direction="vertical" className="w-full">
          {userRole === "freelancer" && order.status === "published" && (
            <Link href={`/orders/${orderId}/proposal`} className="block w-full">
              <AntButton type="primary" block>
                Откликнуться на заказ
              </AntButton>
            </Link>
          )}
          {isOwner && (
            <>
              <Link href={`/orders/${orderId}/edit`} className="block w-full">
                <AntButton block>Редактировать заказ</AntButton>
              </Link>
              <Link href={`/orders/${orderId}/proposals`} className="block w-full">
                <AntButton block>Просмотреть отклики</AntButton>
              </Link>
            </>
          )}
          <Link href={`/orders/${orderId}/chat`} className="block w-full">
            <AntButton block>Открыть чат</AntButton>
          </Link>
        </Space>
      </Card>

      {/* Info */}
      <Card>
        <Title level={5} className="mb-4">Информация</Title>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <Text className="text-foreground-tertiary">Статус:</Text>
            <Tag color={getOrderStatusColor(order.status)}>
              {getOrderStatusLabel(order.status)}
            </Tag>
          </div>
          <div className="flex justify-between">
            <Text className="text-foreground-tertiary">Создан:</Text>
            <Text>{dayjs(order.created_at).format("DD.MM.YYYY HH:mm")}</Text>
          </div>
          {order.deadline_at && (
            <div className="flex justify-between">
              <Text className="text-foreground-tertiary">Срок:</Text>
              <Text>{dayjs(order.deadline_at).format("DD.MM.YYYY")}</Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

