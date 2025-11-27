"use client";

import { useEffect, useState } from "react";
import { Card, Button, Badge, Empty, Skeleton, List, Tag, Space, Typography } from "antd";
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

const { Text } = Typography;

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
  draft: { label: "Черновик", color: "text-gray-400" },
  published: { label: "Опубликован", color: "text-blue-400" },
  in_progress: { label: "В работе", color: "text-yellow-400" },
  completed: { label: "Завершён", color: "text-green-400" },
  cancelled: { label: "Отменён", color: "text-red-400" },
};

export function RecentOrders({ userRole }: RecentOrdersProps) {
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
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  const statusColorMap: Record<string, string> = {
    draft: 'default',
    published: 'processing',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'error',
  };

  return (
    <Card
      title={
        <Space>
          <Briefcase size={18} />
          {userRole === "client" ? "Мои заказы" : "Последние заказы"}
        </Space>
      }
      extra={
        <Link href="/orders">
          <Button type="text" icon={<ArrowRight size={14} />}>
            Все
          </Button>
        </Link>
      }
    >
      {orders.length === 0 ? (
        <Empty
          description="Нет заказов"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          dataSource={orders}
          renderItem={(order, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link href={`/orders/${order.id}`}>
                <List.Item
                  style={{
                    cursor: 'pointer',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '8px',
                    background: 'var(--primary-05)',
                    borderColor: 'var(--primary-12)',
                    transition: 'all 0.3s',
                  }}
                  className="hover:border-primary/50"
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong style={{ fontSize: '14px' }}>{order.title}</Text>
                        <Tag color={statusColorMap[order.status]}>
                          {statusConfig[order.status].label}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        {order.ai_summary && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {order.ai_summary}
                          </Text>
                        )}
                        <Space split={<span>•</span>} style={{ fontSize: '12px' }}>
                          <Space size={4}>
                            <Wallet size={12} />
                            <Text type="secondary">{formatBudget(order.budget_min, order.budget_max)}</Text>
                          </Space>
                          {order.deadline_at && (
                            <Space size={4}>
                              <Calendar size={12} />
                              <Text type="secondary">До {formatDate(order.deadline_at)}</Text>
                            </Space>
                          )}
                          <Space size={4}>
                            <Clock size={12} />
                            <Text type="secondary">{formatDate(order.created_at)}</Text>
                          </Space>
                          {order.proposals_count !== undefined && order.proposals_count > 0 && (
                            <Space size={4}>
                              <TagIcon size={12} />
                              <Text type="secondary">{order.proposals_count} откликов</Text>
                            </Space>
                          )}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              </Link>
            </motion.div>
          )}
        />
      )}
    </Card>
  );
}
