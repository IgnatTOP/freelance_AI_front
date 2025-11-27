"use client";
import { toastService } from "@/src/shared/lib/toast";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Layout,
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Empty,
  Skeleton,
  theme,
  message,
  List,
  Row,
  Col,
} from "antd";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, XCircle, Hourglass, ArrowRight } from "lucide-react";
import { getMyProposals } from "@/src/shared/api/proposals";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { websocketService } from "@/src/shared/lib/notifications/websocket.service";
import Link from "next/link";
import { formatPriceRange } from "@/src/shared/lib/utils";
import type { Proposal } from "@/src/shared/api/proposals";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

const statusConfig = {
  pending: { label: "Ожидает", color: "processing", icon: Hourglass },
  shortlisted: { label: "В шорт-листе", color: "warning", icon: Clock },
  accepted: { label: "Принято", color: "success", icon: CheckCircle },
  rejected: { label: "Отклонено", color: "error", icon: XCircle },
};

export default function ProposalsPage() {
  const { token } = useToken();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toastService.warning("Необходимо авторизоваться");
      router.push("/auth/login");
      return;
    }

    const user = authService.getCurrentUser();
    if (user?.role !== "freelancer") {
      toastService.error("Только фрилансеры могут просматривать отклики");
      router.push("/dashboard");
      return;
    }

    loadProposals();
  }, [router]);

  // Подписка на WebSocket события для обновления в реальном времени
  useEffect(() => {
    if (!authService.isAuthenticated()) return;

    // Подключаемся к WebSocket
    const connectWebSocket = async () => {
      try {
        await websocketService.connect();
      } catch (error) {
        // Silently handle connection errors
      }
    };

    connectWebSocket();

    // Подписываемся на обновления предложений
    const unsubscribeProposals = websocketService.on("proposals.updated", (wsMessage) => {
      const data = wsMessage.data;
      
      // Если это обновление нашего предложения, перезагружаем данные
      if (data.proposal) {
        loadProposals();
      }
    });

    // Подписываемся на изменения подключения
    const unsubscribeConnection = websocketService.onConnectionChange((connected) => {
      if (connected) {
        // При переподключении перезагружаем данные
        loadProposals();
      }
    });

    return () => {
      unsubscribeProposals();
      unsubscribeConnection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await getMyProposals();
      setProposals(data);
    } catch (error: any) {
      console.error("Error loading proposals:", error);
      toastService.error(error.response?.data?.error || "Ошибка загрузки откликов");
      setProposals([]);
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

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "только что";
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ч назад`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "вчера";
    if (diffInDays < 7) return `${diffInDays} дн назад`;

    return formatDate(dateString);
  };

  const groupedProposals = {
    pending: proposals.filter((p) => p.status === "pending"),
    shortlisted: proposals.filter((p) => p.status === "shortlisted"),
    accepted: proposals.filter((p) => p.status === "accepted"),
    rejected: proposals.filter((p) => p.status === "rejected"),
  };

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
              <div>
                <Title
                  level={1}
                  style={{
                    margin: 0,
                    fontSize: 32,
                    lineHeight: "40px",
                    fontWeight: 600,
                  }}
                >
                  Мои отклики
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
                  Управляйте своими предложениями и отслеживайте их статус
                </Text>
              </div>

              {/* Stats */}
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
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
                      {proposals.length}
                    </Title>
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card
                    style={{
                      borderRadius: token.borderRadiusLG,
                      borderColor: token.colorBorder,
                      textAlign: "center",
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
                      Ожидают
                    </Text>
                    <Title level={2} style={{ margin: 0, color: token.colorInfo }}>
                      {groupedProposals.pending.length}
                    </Title>
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card
                    style={{
                      borderRadius: token.borderRadiusLG,
                      borderColor: token.colorBorder,
                      textAlign: "center",
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
                      Принято
                    </Text>
                    <Title level={2} style={{ margin: 0, color: token.colorSuccess }}>
                      {groupedProposals.accepted.length}
                    </Title>
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card
                    style={{
                      borderRadius: token.borderRadiusLG,
                      borderColor: token.colorBorder,
                      textAlign: "center",
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
                      Отклонено
                    </Text>
                    <Title level={2} style={{ margin: 0, color: token.colorError }}>
                      {groupedProposals.rejected.length}
                    </Title>
                  </Card>
                </Col>
              </Row>

              {/* Proposals List */}
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
              ) : proposals.length === 0 ? (
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
                          У вас пока нет откликов
                        </Text>
                        <Text type="secondary" style={{ fontSize: 14, display: "block" }}>
                          Найдите подходящие заказы и отправьте свой первый отклик
                        </Text>
                      </Space>
                    }
                  >
                    <Link href="/orders">
                      <Button type="primary" size="large" icon={<ArrowRight size={16} />}>
                        Найти заказы
                      </Button>
                    </Link>
                  </Empty>
                </Card>
              ) : (
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  {proposals.map((proposal) => {
                    const statusInfo = statusConfig[proposal.status];
                    const StatusIcon = statusInfo.icon;

                    return (
                      <motion.div
                        key={proposal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card
                          hoverable
                          style={{
                            borderRadius: token.borderRadiusLG,
                            borderColor: token.colorBorder,
                          }}
                        >
                          <Space direction="vertical" size={16} style={{ width: "100%" }}>
                            {/* Header */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                gap: 16,
                              }}
                            >
                              <Space direction="vertical" size={8} style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                  <FileText size={20} style={{ color: token.colorPrimary }} />
                                  <Link href={`/orders/${proposal.order_id}`}>
                                    <Text
                                      strong
                                      style={{
                                        fontSize: 16,
                                        cursor: "pointer",
                                        color: token.colorPrimary,
                                      }}
                                    >
                                      Заказ #{proposal.order_id.slice(0, 8)}
                                    </Text>
                                  </Link>
                                </div>
                                <Tag
                                  color={statusInfo.color}
                                  icon={<StatusIcon size={14} />}
                                  style={{
                                    alignSelf: "flex-start",
                                  }}
                                >
                                  {statusInfo.label}
                                </Tag>
                              </Space>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {formatTimeAgo(proposal.created_at)}
                              </Text>
                            </div>

                            {/* Cover Letter */}
                            <Paragraph
                              ellipsis={{ rows: 3, expandable: true, symbol: "показать больше" }}
                              style={{
                                margin: 0,
                                fontSize: 14,
                                lineHeight: "22px",
                              }}
                            >
                              {proposal.cover_letter}
                            </Paragraph>

                            {/* Footer */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingTop: 12,
                                borderTop: `1px solid ${token.colorBorder}`,
                              }}
                            >
                              <Space>
                                {proposal.proposed_amount && (
                                  <Text strong style={{ fontSize: 14 }}>
                                    {formatPriceRange(proposal.proposed_amount, proposal.proposed_amount)}
                                  </Text>
                                )}
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {formatDate(proposal.created_at)}
                                </Text>
                              </Space>
                              <Link href={`/orders/${proposal.order_id}`}>
                                <Button type="link" icon={<ArrowRight size={14} />}>
                                  Перейти к заказу
                                </Button>
                              </Link>
                            </div>

                            {/* AI Feedback */}
                            {proposal.ai_feedback && (
                              <Card
                                size="small"
                                style={{
                                  background: `${token.colorPrimary}08`,
                                  borderColor: `${token.colorPrimary}20`,
                                }}
                              >
                                <Text
                                  type="secondary"
                                  style={{
                                    fontSize: 12,
                                    fontStyle: "italic",
                                  }}
                                >
                                  <strong>AI рекомендация:</strong> {proposal.ai_feedback}
                                </Text>
                              </Card>
                            )}
                          </Space>
                        </Card>
                      </motion.div>
                    );
                  })}
                </Space>
              )}
            </Space>
          </motion.div>
        </div>
      </Content>
    </Layout>
  );
}

