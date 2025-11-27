"use client";
import { toastService } from "@/src/shared/lib/toast";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Layout,
  Card,
  Typography,
  Space,
  Button,
  Avatar,
  Spin,
  Empty,
  theme,
  message,
  Row,
  Col,
  Tag,
  Alert,
  Modal,
  Divider,
} from "antd";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, XCircle, User, Sparkles, MessageSquare } from "lucide-react";
import { getOrderProposals, updateProposalStatus } from "@/src/shared/api/proposals";
import { getOrder } from "@/src/shared/api/orders";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { websocketService } from "@/src/shared/lib/notifications/websocket.service";
import type { Proposal, ProposalListResponse } from "@/src/shared/api/proposals";
import type { Order } from "@/src/entities/order/model/types";
import { formatPriceRange } from "@/src/shared/lib/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";

dayjs.extend(relativeTime);
dayjs.locale("ru");

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

const statusConfig = {
  pending: { label: "Ожидает", color: "processing", icon: CheckCircle },
  shortlisted: { label: "В шорт-листе", color: "warning", icon: CheckCircle },
  accepted: { label: "Принято", color: "success", icon: CheckCircle },
  rejected: { label: "Отклонено", color: "error", icon: XCircle },
};

export default function OrderProposalsPage() {
  const { token } = useToken();
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [bestRecommendation, setBestRecommendation] = useState<{
    proposal_id: string;
    justification: string;
  } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successModalConversationId, setSuccessModalConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toastService.warning("Необходимо авторизоваться");
      router.push("/auth/login");
      return;
    }

    const user = authService.getCurrentUser();
    if (user?.role !== "client" && user?.role !== "admin") {
      toastService.error("Только заказчики могут просматривать отклики");
      router.push(`/orders/${orderId}`);
      return;
    }

    loadData();
  }, [orderId, router]);

  // Подписка на WebSocket события для обновления в реальном времени
  useEffect(() => {
    if (!authService.isAuthenticated() || !orderId) return;

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
      
      // Проверяем, относится ли это к текущему заказу
      if (data.order?.id === orderId || data.proposal?.order_id === orderId) {
        // Перезагружаем данные
        loadData();
      }
    });

    // Подписываемся на обновления заказов (завершение, отмена и т.д.)
    const unsubscribeOrders = websocketService.on("orders.updated", (wsMessage) => {
      const data = wsMessage.data;
      
      // Проверяем, относится ли это к текущему заказу
      if (data.order?.id === orderId) {
        // Перезагружаем данные
        loadData();
      }
    });

    // Подписываемся на изменения подключения
    const unsubscribeConnection = websocketService.onConnectionChange((connected) => {
      if (connected) {
        // При переподключении перезагружаем данные
        loadData();
      }
    });

    return () => {
      unsubscribeProposals();
      unsubscribeOrders();
      unsubscribeConnection();
    };
  }, [orderId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [orderData, proposalsData] = await Promise.all([
        getOrder(orderId),
        getOrderProposals(orderId),
      ]);

      setOrder(orderData);
      setProposals(proposalsData.proposals || []);
      setBestRecommendation(proposalsData.best_recommendation || null);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toastService.error(error.response?.data?.error || "Ошибка загрузки данных");
      router.push(`/orders/${orderId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    proposalId: string,
    status: "pending" | "shortlisted" | "accepted" | "rejected"
  ) => {
    setProcessingId(proposalId);

    try {
      const result = await updateProposalStatus(orderId, proposalId, status);

      if (status === "accepted") {
        toastService.success("Отклик принят! Заказ переведен в работу.");
        // Если есть conversation, показываем модальное окно
        if (result.conversation) {
          setSuccessModalConversationId(result.conversation.id);
          setSuccessModalOpen(true);
        }
      } else {
        toastService.success(`Статус отклика изменен на "${statusConfig[status].label}"`);
      }

      // Перезагружаем данные
      await loadData();
    } catch (error: any) {
      console.error("Error updating proposal status:", error);
      toastService.error(error.response?.data?.error || "Ошибка изменения статуса");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("D MMMM YYYY, HH:mm");
  };

  const formatTimeAgo = (dateString: string) => {
    return dayjs(dateString).fromNow();
  };

  if (loading) {
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
            <Card
              style={{
                borderRadius: token.borderRadiusLG,
                borderColor: token.colorBorder,
              }}
            >
              <Spin size="large" style={{ display: "block", textAlign: "center", padding: 40 }} />
            </Card>
          </div>
        </Content>
      </Layout>
    );
  }

  if (!order) {
    return null;
  }

  const recommendedProposal = bestRecommendation
    ? proposals.find((p) => p.id === bestRecommendation.proposal_id)
    : null;

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
            <Space direction="vertical" size={24} style={{ width: "100%" }}>
              {/* Header */}
              <Row gutter={[16, 16]} align="middle">
                <Col>
                  <Button
                    type="text"
                    icon={<ArrowLeft size={16} />}
                    onClick={() => router.push(`/orders/${orderId}`)}
                    style={{ padding: 0 }}
                  />
                </Col>
                <Col flex="auto">
                  <Title
                    level={1}
                    style={{
                      margin: 0,
                      fontSize: 28,
                      lineHeight: "36px",
                      fontWeight: 600,
                    }}
                  >
                    Отклики на заказ
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
                    {order.title}
                  </Text>
                </Col>
                <Col>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Всего: {proposals.length}
                  </Text>
                </Col>
              </Row>

              {/* AI Recommendation */}
              {recommendedProposal && bestRecommendation && (
                <Alert
                  message={
                    <Space>
                      <Sparkles size={16} />
                      <Text strong>AI рекомендует этого исполнителя</Text>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={8} style={{ width: "100%", marginTop: 8 }}>
                      <Text style={{ fontSize: 14 }}>{bestRecommendation.justification}</Text>
                      <Button
                        type="primary"
                        icon={<CheckCircle size={16} />}
                        onClick={() => handleStatusChange(recommendedProposal.id, "accepted")}
                        loading={processingId === recommendedProposal.id}
                      >
                        Принять рекомендацию
                      </Button>
                    </Space>
                  }
                  type="info"
                  icon={<Sparkles size={16} />}
                  style={{ marginBottom: 16 }}
                />
              )}

              {/* Proposals List */}
              {proposals.length === 0 ? (
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
                          Пока нет откликов
                        </Text>
                        <Text type="secondary" style={{ fontSize: 14, display: "block" }}>
                          Отклики появятся здесь, когда фрилансеры начнут откликаться на ваш заказ
                        </Text>
                      </Space>
                    }
                  />
                </Card>
              ) : (
                <Row gutter={[16, 16]}>
                  {proposals.map((proposal) => {
                    const statusInfo = statusConfig[proposal.status];
                    const isRecommended = recommendedProposal?.id === proposal.id;

                    return (
                      <Col xs={24} key={proposal.id}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card
                            style={{
                              borderRadius: token.borderRadiusLG,
                              borderColor: isRecommended
                                ? token.colorPrimary
                                : token.colorBorder,
                              borderWidth: isRecommended ? 2 : 1,
                              background: isRecommended
                                ? `${token.colorPrimary}08`
                                : token.colorBgContainer,
                            }}
                          >
                            <Row gutter={[16, 16]}>
                              <Col xs={24} md={18}>
                                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                                  {/* Header */}
                                  <Row gutter={[16, 8]} align="middle">
                                    <Col>
                                      <Avatar
                                        size={48}
                                        style={{
                                          backgroundColor: token.colorPrimary + "20",
                                          color: token.colorPrimary,
                                        }}
                                      >
                                        <User size={24} />
                                      </Avatar>
                                    </Col>
                                    <Col flex="auto">
                                      <Space direction="vertical" size={4}>
                                        <Text strong style={{ fontSize: 16 }}>
                                          Фрилансер #{proposal.freelancer_id.slice(0, 8)}
                                        </Text>
                                        <Space>
                                          <Tag
                                            color={statusInfo.color}
                                            icon={<statusInfo.icon size={12} />}
                                          >
                                            {statusInfo.label}
                                          </Tag>
                                          {isRecommended && (
                                            <Tag color="gold" icon={<Sparkles size={12} />}>
                                              AI рекомендует
                                            </Tag>
                                          )}
                                        </Space>
                                      </Space>
                                    </Col>
                                    <Col>
                                      <Text type="secondary" style={{ fontSize: 12 }}>
                                        {formatTimeAgo(proposal.created_at)}
                                      </Text>
                                    </Col>
                                  </Row>

                                  <Divider style={{ margin: "12px 0" }} />

                                  {/* Cover Letter */}
                                  <div>
                                    <Text strong style={{ fontSize: 14, display: "block", marginBottom: 8 }}>
                                      Сопроводительное письмо
                                    </Text>
                                    <Paragraph
                                      ellipsis={{ rows: 4, expandable: true, symbol: "показать больше" }}
                                      style={{
                                        margin: 0,
                                        fontSize: 14,
                                        lineHeight: "22px",
                                      }}
                                    >
                                      {proposal.cover_letter}
                                    </Paragraph>
                                  </div>

                                  {/* AI Feedback */}
                                  {proposal.ai_feedback && (
                                    <Alert
                                      message="AI анализ отклика"
                                      description={proposal.ai_feedback}
                                      type="info"
                                      icon={<Sparkles size={14} />}
                                      style={{ fontSize: 12 }}
                                    />
                                  )}

                                  {/* Meta */}
                                  <Row gutter={[16, 8]}>
                                    {proposal.proposed_amount && (
                                      <Col>
                                        <Space size={4}>
                                          <Text type="secondary" style={{ fontSize: 12 }}>
                                            Предложенная сумма:
                                          </Text>
                                          <Text strong style={{ fontSize: 14 }}>
                                            {formatPriceRange(
                                              proposal.proposed_amount,
                                              proposal.proposed_amount
                                            )}
                                          </Text>
                                        </Space>
                                      </Col>
                                    )}
                                    <Col>
                                      <Text type="secondary" style={{ fontSize: 12 }}>
                                        Отправлен: {formatDate(proposal.created_at)}
                                      </Text>
                                    </Col>
                                  </Row>
                                </Space>
                              </Col>

                              <Col xs={24} md={6}>
                                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                                  {proposal.status === "pending" && (
                                    <>
                                      <Button
                                        type="primary"
                                        icon={<CheckCircle size={16} />}
                                        block
                                        onClick={() => handleStatusChange(proposal.id, "accepted")}
                                        loading={processingId === proposal.id}
                                      >
                                        Принять
                                      </Button>
                                      <Button
                                        icon={<CheckCircle size={16} />}
                                        block
                                        onClick={() => handleStatusChange(proposal.id, "shortlisted")}
                                        loading={processingId === proposal.id}
                                      >
                                        В шорт-лист
                                      </Button>
                                      <Button
                                        danger
                                        icon={<XCircle size={16} />}
                                        block
                                        onClick={() => handleStatusChange(proposal.id, "rejected")}
                                        loading={processingId === proposal.id}
                                      >
                                        Отклонить
                                      </Button>
                                    </>
                                  )}
                                  {proposal.status === "shortlisted" && (
                                    <>
                                      <Button
                                        type="primary"
                                        icon={<CheckCircle size={16} />}
                                        block
                                        onClick={() => handleStatusChange(proposal.id, "accepted")}
                                        loading={processingId === proposal.id}
                                      >
                                        Принять
                                      </Button>
                                      <Button
                                        danger
                                        icon={<XCircle size={16} />}
                                        block
                                        onClick={() => handleStatusChange(proposal.id, "rejected")}
                                        loading={processingId === proposal.id}
                                      >
                                        Отклонить
                                      </Button>
                                    </>
                                  )}
                                  {proposal.status === "accepted" && (
                                    <Button
                                      type="default"
                                      icon={<MessageSquare size={16} />}
                                      block
                                      onClick={async () => {
                                        try {
                                          // Получаем conversation через API
                                          const { getConversation } = await import("@/src/shared/api/conversations");
                                          const convData = await getConversation(orderId, proposal.freelancer_id);
                                          if (convData.conversation) {
                                            router.push(`/messages/${convData.conversation.id}`);
                                          } else {
                                            toastService.error("Чат не найден");
                                          }
                                        } catch (error: any) {
                                          console.error("Error getting conversation:", error);
                                          toastService.error("Ошибка открытия чата");
                                        }
                                      }}
                                    >
                                      Открыть чат
                                    </Button>
                                  )}
                                </Space>
                              </Col>
                            </Row>
                          </Card>
                        </motion.div>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Space>
          </motion.div>
        </div>
      </Content>
      
      {/* Success Modal */}
      <Modal
        open={successModalOpen}
        onOk={() => {
          if (successModalConversationId) {
            router.push(`/messages/${successModalConversationId}`);
          }
          setSuccessModalOpen(false);
          setSuccessModalConversationId(null);
        }}
        onCancel={() => {
          setSuccessModalOpen(false);
          setSuccessModalConversationId(null);
        }}
        okText="Открыть чат"
        cancelText="Закрыть"
        title="Отклик принят!"
      >
        <p>Заказ переведен в работу. Вы можете начать общение с исполнителем.</p>
      </Modal>
    </Layout>
  );
}

