"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout, Card, Row, Col, Typography, Space, Empty, Tag, Button } from "antd";
import { toastService } from "@/src/shared/lib/toast";
import { FileText, Clock, CheckCircle2, MessageSquare, RussianRuble } from "lucide-react";
import { authService } from "@/src/shared/lib/auth/auth.service";
import Link from "next/link";
import type { Order } from "@/src/entities/order/model/types";
import { formatPriceRange } from "@/src/shared/lib/utils";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

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
      // Получаем предложения фрилансера
      const { getMyProposals } = await import("@/src/shared/api/proposals");
      const proposals = await getMyProposals();

      // Фильтруем только принятые предложения (активные проекты)
      const acceptedProposals = proposals.filter((p: any) => p.status === "accepted");

      // Получаем заказы для принятых предложений
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "processing";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress":
        return "В работе";
      case "completed":
        return "Завершен";
      default:
        return status;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Content style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Title level={2}>Мои проекты</Title>
            <Text type="secondary">Активные заказы, над которыми вы работаете</Text>
          </div>

          {loading ? (
            <Card>
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Text>Загрузка...</Text>
              </Space>
            </Card>
          ) : orders.length === 0 ? (
            <Empty
              description="У вас пока нет активных проектов"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Link href="/orders">
                <Button type="primary">Найти заказы</Button>
              </Link>
            </Empty>
          ) : (
            <Row gutter={[16, 16]}>
              {orders.map((order) => (
                <Col xs={24} key={order.id}>
                  <Link href={`/orders/${order.id}`}>
                    <Card
                      hoverable
                      actions={[
                        <Link key="view" href={`/orders/${order.id}`}>
                          <Button type="link">Открыть</Button>
                        </Link>,
                        <Link key="chat" href={`/messages?order=${order.id}`}>
                          <Button type="link" icon={<MessageSquare size={16} />}>
                            Чат
                          </Button>
                        </Link>,
                      ]}
                    >
                      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                          <div style={{ flex: 1 }}>
                            <Title level={4} style={{ marginBottom: 8 }}>
                              {order.title}
                            </Title>
                            <Paragraph
                              ellipsis={{ rows: 2, expandable: false }}
                              type="secondary"
                              style={{ margin: 0 }}
                            >
                              {order.description}
                            </Paragraph>
                          </div>
                          <Tag color={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Tag>
                        </div>

                        <Space>
                          {(order.budget_min || order.budget_max) && (
                            <Space size="small">
                              <RussianRuble size={16} />
                              <Text strong>
                                {formatPriceRange(order.budget_min || 0, order.budget_max || 0)}
                              </Text>
                            </Space>
                          )}
                          {order.deadline_at && (
                            <Space size="small">
                              <Clock size={16} />
                              <Text type="secondary">
                                До {new Date(order.deadline_at).toLocaleDateString("ru-RU")}
                              </Text>
                            </Space>
                          )}
                        </Space>
                      </Space>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          )}
        </Space>
      </Content>
    </Layout>
  );
}

