"use client";

import { useEffect, useState } from "react";
import { Card, Button, Empty, Skeleton, Row, Col, Tag, Space, Typography, Progress, Avatar, theme } from "antd";
import { getMyOrders, getOrders } from "@/src/shared/api/orders";
import {
  Briefcase,
  Clock,
  Wallet,
  ArrowRight,
  Calendar,
  User,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDate as formatDateUtil } from "@/src/shared/lib/utils/date-utils";
import Link from "next/link";
import { formatPriceRange } from "@/src/shared/lib/utils";

const { Text, Paragraph } = Typography;
const { useToken } = theme;

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
  progress?: number;
}

interface ProjectsCardsProps {
  userRole: "client" | "freelancer" | null;
}

const statusConfig = {
  draft: { label: "Черновик", color: "default" },
  published: { label: "Опубликован", color: "processing" },
  in_progress: { label: "В работе", color: "warning" },
  completed: { label: "Завершён", color: "success" },
  cancelled: { label: "Отменён", color: "error" },
};

export function ProjectsCards({ userRole }: ProjectsCardsProps) {
  const { token } = useToken();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        if (userRole === "client") {
          const response = await getMyOrders();
          const myOrders = response.as_client || [];
          setOrders(myOrders.slice(0, 3));
        } else {
          const response = await getOrders({
            status: "published",
            limit: 3,
            sort_by: "created_at",
            sort_order: "desc",
          });
          setOrders(response.data || []);
        }
      } catch (error) {
        console.error("Error loading orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (userRole) {
      loadOrders();
    }
  }, [userRole]);

  const formatDate = (dateString: string) =>
    formatDateUtil(dateString, { includeYear: true });

  if (loading) {
    return (
      <Card
        title={userRole === "client" ? "Мои проекты" : "Доступные заказы"}
        style={{
          borderColor: token.colorBorder,
          borderRadius: token.borderRadiusLG,
        }}
      >
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <Briefcase size={20} style={{ color: token.colorPrimary }} />
          <span>{userRole === "client" ? "Мои проекты" : "Доступные заказы"}</span>
        </Space>
      }
      extra={
        <Link href="/orders">
          <Button type="text" icon={<ArrowRight size={16} />}>
            Все
          </Button>
        </Link>
      }
      style={{
        borderColor: token.colorBorder,
        borderRadius: token.borderRadiusLG,
      }}
    >
      {orders.length === 0 ? (
        <Empty
          description={userRole === "client" ? "Нет проектов" : "Нет доступных заказов"}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Row gutter={[token.margin, token.margin]}>
          {orders.map((order, index) => {
            const statusInfo = statusConfig[order.status];
            // Прогресс на основе статуса (можно будет добавить реальный прогресс из API)
            const progress = order.status === "in_progress"
              ? 50 // По умолчанию 50% для заказов в работе
              : order.status === "completed"
              ? 100
              : 0;

            return (
              <Col xs={24} key={order.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link href={`/orders/${order.id}`}>
                    <Card
                      hoverable
                      style={{
                        borderColor: token.colorBorder,
                        borderRadius: token.borderRadiusLG,
                        cursor: 'pointer',
                      }}
                      styles={{
                        body: { padding: token.paddingLG }
                      }}
                    >
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        {/* Header */}
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Space>
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: token.borderRadius,
                                background: `${token.colorPrimary}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Briefcase size={20} style={{ color: token.colorPrimary }} />
                            </div>
                            <div>
                              <Text strong style={{ fontSize: token.fontSizeLG }}>
                                {order.title}
                              </Text>
                              <br />
                              <Tag color={statusInfo.color} style={{ marginTop: 4 }}>
                                {statusInfo.label}
                              </Tag>
                            </div>
                          </Space>
                        </Space>

                        {/* Description */}
                        {order.ai_summary && (
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            type="secondary"
                            style={{ margin: 0, fontSize: token.fontSize }}
                          >
                            {order.ai_summary}
                          </Paragraph>
                        )}

                        {/* Progress Bar */}
                        {progress > 0 && (
                          <div>
                            <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }}>
                              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                                Прогресс
                              </Text>
                              <Text strong style={{ fontSize: token.fontSizeSM }}>
                                {progress}%
                              </Text>
                            </Space>
                            <Progress
                              percent={progress}
                              strokeColor={{
                                "0%": token.colorPrimary,
                                "100%": token.colorSuccess,
                              }}
                              trailColor={token.colorBgContainer}
                              showInfo={false}
                            />
                          </div>
                        )}

                        {/* Meta Info */}
                        <Row gutter={[token.marginSM, token.marginSM]}>
                          <Col xs={12} sm={8}>
                            <Space size={4}>
                              <Wallet size={14} style={{ color: token.colorTextSecondary }} />
                              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                                {formatPriceRange(order.budget_min, order.budget_max)}
                              </Text>
                            </Space>
                          </Col>
                          {order.deadline_at && (
                            <Col xs={12} sm={8}>
                              <Space size={4}>
                                <Calendar size={14} style={{ color: token.colorTextSecondary }} />
                                <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                                  {formatDate(order.deadline_at)}
                                </Text>
                              </Space>
                            </Col>
                          )}
                          {order.proposals_count !== undefined && order.proposals_count > 0 && (
                            <Col xs={12} sm={8}>
                              <Space size={4}>
                                <User size={14} style={{ color: token.colorTextSecondary }} />
                                <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                                  {order.proposals_count} откликов
                                </Text>
                              </Space>
                            </Col>
                          )}
                        </Row>

                        {/* Footer Actions */}
                        <Space style={{ width: '100%', justifyContent: 'space-between', paddingTop: token.paddingXS, borderTop: `1px solid ${token.colorBorder}` }}>
                          <Space size={4}>
                            <Clock size={14} style={{ color: token.colorTextSecondary }} />
                            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                              {formatDate(order.created_at)}
                            </Text>
                          </Space>
                          {userRole === "client" && (
                            <Button
                              type="text"
                              size="small"
                              icon={<MessageSquare size={14} />}
                              style={{ fontSize: token.fontSizeSM }}
                            >
                              Сообщения
                            </Button>
                          )}
                        </Space>
                      </Space>
                    </Card>
                  </Link>
                </motion.div>
              </Col>
            );
          })}
        </Row>
      )}

      {/* View All Button */}
      {orders.length > 0 && (
        <Link href="/orders">
          <Button
            type="primary"
            block
            size="large"
            icon={<ArrowRight size={16} />}
            style={{
              marginTop: token.marginLG,
              borderRadius: token.borderRadiusLG,
            }}
          >
            {userRole === "client" ? "Все проекты" : "Все заказы"}
          </Button>
        </Link>
      )}
    </Card>
  );
}
