"use client";
import { toastService } from "@/src/shared/lib/toast";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Layout,
  Typography,
  Card,
  Skeleton,
  Empty,
  Row,
  Col,
  Tag,
  Space,
  Button,
  theme,
  message,
  Progress,
} from "antd";
import { motion } from "framer-motion";
import { Briefcase, Clock, Wallet, Calendar, MessageSquare, CheckCircle } from "lucide-react";
import { getMyOrders } from "@/src/shared/api/orders";
import { authService } from "@/src/shared/lib/auth/auth.service";
import Link from "next/link";
import { formatPriceRange } from "@/src/shared/lib/utils";
import type { Order } from "@/src/entities/order/model/types";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

const statusConfig = {
  in_progress: { label: "В работе", color: "processing", icon: Briefcase },
  completed: { label: "Завершён", color: "success", icon: CheckCircle },
};

export default function InProgressOrdersPage() {
  const { token } = useToken();
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
      // Объединяем заказы клиента и фрилансера, фильтруем по статусу in_progress
      const allOrders = [
        ...(response.as_client || []),
        ...(response.as_freelancer || []),
      ].filter((order) => order.status === "in_progress" || order.status === "completed");

      setOrders(allOrders);
    } catch (error: any) {
      console.error("Error loading orders:", error);
      toastService.error(error.response?.data?.error || "Ошибка загрузки заказов");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const inProgressOrders = orders.filter((o) => o.status === "in_progress");
  const completedOrders = orders.filter((o) => o.status === "completed");

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Content>
        <div
          style={{
            minHeight: "100vh",
            padding: "40px 24px",
            maxWidth: 1200,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Space direction="vertical" size={32} style={{ width: "100%" }}>
              {/* Header */}
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Title
                    level={1}
                    style={{
                      margin: 0,
                      fontSize: 32,
                      lineHeight: "40px",
                      fontWeight: 600,
                    }}
                  >
                    Заказы в работе
                  </Title>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 14,
                      lineHeight: "22px",
                      display: "block",
                      marginTop: 8,
                    }}
                  >
                    Отслеживайте прогресс выполнения ваших проектов
                  </Text>
                </Col>
                <Col xs={24} sm={12} style={{ textAlign: "right" }}>
                  <Space>
                    <Link href="/orders">
                      <Button>Все заказы</Button>
                    </Link>
                  </Space>
                </Col>
              </Row>

              {/* Stats */}
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Card
                    style={{
                      borderRadius: token.borderRadiusLG,
                      borderColor: token.colorBorder,
                      textAlign: "center",
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
                      В работе
                    </Text>
                    <Title level={2} style={{ margin: 0, color: token.colorInfo }}>
                      {inProgressOrders.length}
                    </Title>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card
                    style={{
                      borderRadius: token.borderRadiusLG,
                      borderColor: token.colorBorder,
                      textAlign: "center",
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
                      Завершено
                    </Text>
                    <Title level={2} style={{ margin: 0, color: token.colorSuccess }}>
                      {completedOrders.length}
                    </Title>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card
                    style={{
                      borderRadius: token.borderRadiusLG,
                      borderColor: token.colorBorder,
                      textAlign: "center",
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
                      Всего
                    </Text>
                    <Title level={2} style={{ margin: 0 }}>
                      {orders.length}
                    </Title>
                  </Card>
                </Col>
              </Row>

              {/* In Progress Orders */}
              {loading ? (
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  {[1, 2, 3].map((i) => (
                    <Card
                      key={i}
                      style={{
                        borderRadius: token.borderRadiusLG,
                        borderColor: token.colorBorder,
                      }}
                    >
                      <Skeleton active paragraph={{ rows: 3 }} />
                    </Card>
                  ))}
                </Space>
              ) : orders.length === 0 ? (
                <Card
                  style={{
                    borderRadius: token.borderRadiusLG,
                    borderColor: token.colorBorder,
                    textAlign: "center",
                  }}
                  styles={{
                    body: { padding: "80px 24px" },
                  }}
                >
                  <Empty
                    description={
                      <Space direction="vertical" size={8}>
                        <Text strong style={{ fontSize: 16, display: "block" }}>
                          Нет заказов в работе
                        </Text>
                        <Text type="secondary" style={{ fontSize: 14, display: "block" }}>
                          Заказы в работе появятся здесь после принятия отклика
                        </Text>
                      </Space>
                    }
                  >
                    <Link href="/orders">
                      <Button type="primary" size="large">
                        Найти заказы
                      </Button>
                    </Link>
                  </Empty>
                </Card>
              ) : (
                <Space direction="vertical" size={24} style={{ width: "100%" }}>
                  {/* In Progress Section */}
                  {inProgressOrders.length > 0 && (
                    <div>
                      <Title level={3} style={{ marginBottom: 16 }}>
                        В работе ({inProgressOrders.length})
                      </Title>
                      <Row gutter={[16, 16]}>
                        {inProgressOrders.map((order) => (
                          <Col xs={24} key={order.id}>
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Link href={`/orders/${order.id}`}>
                                <Card
                                  hoverable
                                  style={{
                                    borderRadius: token.borderRadiusLG,
                                    borderColor: token.colorBorder,
                                  }}
                                >
                                  <Row gutter={[16, 16]}>
                                    <Col xs={24} md={16}>
                                      <Space direction="vertical" size={12} style={{ width: "100%" }}>
                                        <Space>
                                          <Briefcase size={20} style={{ color: token.colorPrimary }} />
                                          <Title level={4} style={{ margin: 0 }}>
                                            {order.title}
                                          </Title>
                                          <Tag color={statusConfig.in_progress.color}>
                                            {statusConfig.in_progress.label}
                                          </Tag>
                                        </Space>
                                        {order.ai_summary && (
                                          <Paragraph
                                            ellipsis={{ rows: 2, expandable: false }}
                                            type="secondary"
                                            style={{ margin: 0 }}
                                          >
                                            {order.ai_summary}
                                          </Paragraph>
                                        )}
                                        <Row gutter={[16, 8]}>
                                          {order.budget_min && (
                                            <Col>
                                              <Space size={4} style={{ display: "flex", alignItems: "center" }}>
                                                <Wallet size={14} style={{ color: token.colorTextSecondary, flexShrink: 0 }} />
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                  {formatPriceRange(order.budget_min, order.budget_max)}
                                                </Text>
                                              </Space>
                                            </Col>
                                          )}
                                          {order.deadline_at && (
                                            <Col>
                                              <Space size={4} style={{ display: "flex", alignItems: "center" }}>
                                                <Calendar size={14} style={{ color: token.colorTextSecondary, flexShrink: 0 }} />
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                  До {formatDate(order.deadline_at)}
                                                </Text>
                                              </Space>
                                            </Col>
                                          )}
                                        </Row>
                                      </Space>
                                    </Col>
                                    <Col xs={24} md={8}>
                                      <Space direction="vertical" size={8} style={{ width: "100%" }}>
                                        <div>
                                          <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                            Прогресс
                                          </Text>
                                          <Progress
                                            percent={50}
                                            strokeColor={token.colorPrimary}
                                            showInfo={false}
                                          />
                                          <Text style={{ fontSize: 12 }}>50%</Text>
                                        </div>
                                        <Link href={`/messages?order=${order.id}`}>
                                          <Button
                                            type="default"
                                            icon={<MessageSquare size={14} />}
                                            block
                                          >
                                            Открыть чат
                                          </Button>
                                        </Link>
                                      </Space>
                                    </Col>
                                  </Row>
                                </Card>
                              </Link>
                            </motion.div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}

                  {/* Completed Section */}
                  {completedOrders.length > 0 && (
                    <div>
                      <Title level={3} style={{ marginBottom: 16 }}>
                        Завершённые ({completedOrders.length})
                      </Title>
                      <Row gutter={[16, 16]}>
                        {completedOrders.map((order) => (
                          <Col xs={24} key={order.id}>
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Link href={`/orders/${order.id}`}>
                                <Card
                                  hoverable
                                  style={{
                                    borderRadius: token.borderRadiusLG,
                                    borderColor: token.colorBorder,
                                  }}
                                >
                                  <Row gutter={[16, 16]}>
                                    <Col xs={24} md={16}>
                                      <Space direction="vertical" size={12} style={{ width: "100%" }}>
                                        <Space>
                                          <CheckCircle size={20} style={{ color: token.colorSuccess }} />
                                          <Title level={4} style={{ margin: 0 }}>
                                            {order.title}
                                          </Title>
                                          <Tag color={statusConfig.completed.color}>
                                            {statusConfig.completed.label}
                                          </Tag>
                                        </Space>
                                        {order.ai_summary && (
                                          <Paragraph
                                            ellipsis={{ rows: 2, expandable: false }}
                                            type="secondary"
                                            style={{ margin: 0 }}
                                          >
                                            {order.ai_summary}
                                          </Paragraph>
                                        )}
                                      </Space>
                                    </Col>
                                    <Col xs={24} md={8} style={{ textAlign: "right" }}>
                                      <Space direction="vertical" size={8}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                          Завершён {formatDate(order.updated_at)}
                                        </Text>
                                        <Link href={`/orders/${order.id}`}>
                                          <Button type="default" block>
                                            Просмотреть
                                          </Button>
                                        </Link>
                                      </Space>
                                    </Col>
                                  </Row>
                                </Card>
                              </Link>
                            </motion.div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                </Space>
              )}
            </Space>
          </motion.div>
        </div>
      </Content>
    </Layout>
  );
}

