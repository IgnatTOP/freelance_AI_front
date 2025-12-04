"use client";
import { toastService } from "@/src/shared/lib/toast";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Layout,
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Skeleton,
  Divider,
  theme,
  Row,
  Col,
  Avatar,
  Empty,
  App,
  Alert,
  Modal,
} from "antd";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  RussianRuble,
  Code,
  Clock,
  User,
  FileText,
  MessageSquare,
  CheckCircle,
  Sparkles,
  XCircle,
} from "lucide-react";
import { getOrder, updateOrder } from "@/src/shared/api/orders";
import { getMyProposal, getOrderProposals, updateProposalStatus } from "@/src/shared/api/proposals";
import { getOrderStatusColor, getOrderStatusLabel } from "@/src/shared/lib/order-utils";
import { formatPriceRange } from "@/src/shared/lib/utils";
import { useAuth } from "@/src/shared/lib/hooks";
import { websocketService } from "@/src/shared/lib/notifications/websocket.service";
import { authService } from "@/src/shared/lib/auth/auth.service";
import type { Order } from "@/src/entities/order/model/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";

dayjs.extend(relativeTime);
dayjs.locale("ru");

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

export default function OrderDetailPage() {
  const { token } = useToken();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const { user, userRole, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [myProposal, setMyProposal] = useState<any | null>(null);
  const [checkingProposal, setCheckingProposal] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);
  const [bestRecommendation, setBestRecommendation] = useState<{
    proposal_id: string;
    justification: string;
  } | null>(null);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [processingProposalId, setProcessingProposalId] = useState<string | null>(null);
  const [completeOrderModalOpen, setCompleteOrderModalOpen] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

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
        loadOrder();
        // Перезагружаем предложения если пользователь - владелец заказа
        if (order && user?.id && String(order.client_id) === String(user.id)) {
          loadProposals();
        }
        // Перезагружаем свой отклик если пользователь - фрилансер и не владелец
        // СТРОГАЯ проверка: только для фрилансеров
        if (userRole === "freelancer" && user?.id && authService.isAuthenticated()) {
          const isOwner = order && user?.id && String(order.client_id) === String(user.id);
          if (!isOwner) {
            checkMyProposal();
          }
        }
      }
    });

    // Подписываемся на обновления заказов (завершение, отмена и т.д.)
    const unsubscribeOrders = websocketService.on("orders.updated", (wsMessage) => {
      const data = wsMessage.data;
      
      // Проверяем, относится ли это к текущему заказу
      if (data.order?.id === orderId) {
        // Перезагружаем данные заказа
        loadOrder();
        // Перезагружаем предложения если пользователь - владелец заказа
        if (order && user?.id && String(order.client_id) === String(user.id)) {
          loadProposals();
        }
      }
    });

    // Подписываемся на изменения подключения
    const unsubscribeConnection = websocketService.onConnectionChange((connected) => {
      if (connected) {
        // При переподключении перезагружаем данные
        loadOrder();
      }
    });

    return () => {
      unsubscribeProposals();
      unsubscribeOrders();
      unsubscribeConnection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const data = await getOrder(orderId);
      setOrder(data);
      
      // Если есть параметр proposal в URL, показываем уведомление
      const proposalId = searchParams.get("proposal");
      if (proposalId) {
        toastService.success("Ваш отклик успешно отправлен!");
        // Убираем параметр из URL
        router.replace(`/orders/${orderId}`, { scroll: false });
      }
    } catch (error: any) {
      console.error("Error loading order:", error);
      toastService.error(error.response?.data?.error || "Ошибка загрузки заказа");
    } finally {
      setLoading(false);
    }
  };

  // Загружаем отклики когда заказ и пользователь загружены
  useEffect(() => {
    if (order && user?.id && orderId && String(order.client_id) === String(user.id) && !loadingProposals) {
      loadProposals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, user?.id, orderId]);

  const loadProposals = async () => {
    setLoadingProposals(true);
    try {
      const proposalsData = await getOrderProposals(orderId);
      setProposals(proposalsData.proposals || []);
      setBestRecommendation(proposalsData.best_recommendation || null);
    } catch (error: any) {
      console.error("Error loading proposals:", error);
      // Не показываем ошибку, так как это не критично
    } finally {
      setLoadingProposals(false);
    }
  };
  
  useEffect(() => {
    console.log("[OrderDetail] useEffect triggered:", {
      orderId: order?.id,
      hasOrder: !!order,
      authLoading,
      userRole,
      userId: user?.id,
      isAuthenticated: authService.isAuthenticated(),
    });

    // Не делаем запрос, если данные еще загружаются
    if (authLoading) {
      console.log("[OrderDetail] Skipping checkMyProposal: authLoading = true");
      return;
    }

    // Проверяем отклик после загрузки заказа и установки userRole
    // Делаем запрос только если:
    // 1. Заказ загружен
    // 2. Данные пользователя загружены (не loading)
    // 3. Пользователь аутентифицирован
    // 4. Пользователь - фрилансер (строго проверяем, что не null)
    // 5. Пользователь НЕ является владельцем заказа
    const isOwner = order && user?.id && String(order.client_id) === String(user.id);
    
    console.log("[OrderDetail] Checking conditions:", {
      hasOrder: !!order,
      notAuthLoading: !authLoading,
      isFreelancer: userRole === "freelancer",
      hasUserId: !!user?.id,
      isAuthenticated: authService.isAuthenticated(),
      isOwner,
      willCallCheckMyProposal: !!(
        order && 
        !authLoading &&
        userRole === "freelancer" && 
        user?.id && 
        authService.isAuthenticated() &&
        !isOwner
      ),
    });

    // СТРОГАЯ проверка: запрос делается ТОЛЬКО для фрилансеров
    if (userRole !== "freelancer") {
      console.log("[OrderDetail] NOT calling checkMyProposal - user is not freelancer, role:", userRole);
      return;
    }
    
    if (
      order && 
      !authLoading &&
      userRole === "freelancer" && 
      user?.id && 
      authService.isAuthenticated() &&
      !isOwner
    ) {
      console.log("[OrderDetail] Calling checkMyProposal()");
      checkMyProposal();
    } else {
      console.log("[OrderDetail] NOT calling checkMyProposal - conditions not met");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, userRole, user?.id, authLoading]);
  
  const checkMyProposal = async () => {
    console.log("[OrderDetail] checkMyProposal() called");
    
    // СТРОГАЯ проверка роли - запрос делается ТОЛЬКО для фрилансеров
    if (userRole !== "freelancer") {
      console.log("[OrderDetail] checkMyProposal - ABORTED: user is not freelancer, role:", userRole);
      return;
    }
    
    // Строгие проверки перед запросом - не делаем запрос, если что-то не так
    const checks = {
      hasUserId: !!user?.id,
      isFreelancer: userRole === "freelancer",
      isAuthenticated: authService.isAuthenticated(),
      notAuthLoading: !authLoading,
      hasOrder: !!order,
    };
    
    console.log("[OrderDetail] checkMyProposal - pre-checks:", checks);
    
    if (
      !user?.id || 
      userRole !== "freelancer" || 
      !authService.isAuthenticated() ||
      authLoading ||
      !order
    ) {
      console.log("[OrderDetail] checkMyProposal - ABORTED: pre-checks failed");
      return;
    }
    
    // Проверяем, что пользователь не является владельцем заказа
    const isOwner = order && user?.id && String(order.client_id) === String(user.id);
    console.log("[OrderDetail] checkMyProposal - owner check:", {
      isOwner,
      orderClientId: order?.client_id,
      userId: user?.id,
    });
    
    if (isOwner) {
      console.log("[OrderDetail] checkMyProposal - ABORTED: user is owner");
      return;
    }
    
    console.log("[OrderDetail] checkMyProposal - Making API request to /my-proposal");
    setCheckingProposal(true);
    try {
      const proposal = await getMyProposal(orderId);
      console.log("[OrderDetail] checkMyProposal - SUCCESS:", proposal);
      setMyProposal(proposal);
    } catch (error: any) {
      // Если отклик не найден (404), это нормально - значит еще не откликался
      if (error.response?.status === 404) {
        console.log("[OrderDetail] checkMyProposal - 404 (proposal not found, this is OK)");
      } else {
        console.error("[OrderDetail] checkMyProposal - ERROR:", error);
      }
      setMyProposal(null);
    } finally {
      setCheckingProposal(false);
    }
  };

  const isOwner = order && user?.id && String(order.client_id) === String(user.id);
  // Можно откликнуться только если: фрилансер, не владелец, заказ опубликован, и еще не откликался
  const canApply = userRole === "freelancer" && !isOwner && order?.status === "published" && !myProposal;
  
  const handleCompleteOrder = async () => {
    if (!order) return;
    setCompleteOrderModalOpen(true);
  };

  const handleCompleteOrderConfirm = async () => {
    if (!order) return;
    try {
      await updateOrder(orderId, { 
        title: order.title,
        description: order.description,
        status: "completed" 
      });
      toastService.success("Заказ успешно завершен!");
      loadOrder();
      setCompleteOrderModalOpen(false);
    } catch (error: any) {
      console.error("Error completing order:", error);
      toastService.error(error.response?.data?.error || "Ошибка завершения заказа");
    }
  };
  
  const handleOpenChat = async () => {
    if (!order || !user?.id) return;
    
    try {
      let participantId: string | null = null;
      
      if (isOwner) {
        // Для заказчика нужно найти фрилансера из принятого отклика
        const { getOrderProposals } = await import("@/src/shared/api/proposals");
        const proposalsData = await getOrderProposals(orderId);
        const acceptedProposal = proposalsData.proposals?.find(p => p.status === "accepted");
        
        if (!acceptedProposal) {
          toastService.warning("Нет принятого отклика для этого заказа");
          return;
        }
        
        participantId = acceptedProposal.freelancer_id;
      } else {
        // Для фрилансера - заказчик
        // Проверяем, что отклик принят
        if (myProposal && myProposal.status !== "accepted") {
          toastService.warning("Ваш отклик еще не принят заказчиком");
          return;
        }
        participantId = String(order.client_id);
      }
      
      if (!participantId) {
        toastService.error("Не удалось определить участника чата");
        return;
      }
      
      const { getConversation } = await import("@/src/shared/api/conversations");
      const convData = await getConversation(orderId, participantId);
      
      if (convData.conversation) {
        router.push(`/messages/${convData.conversation.id}`);
      } else {
        toastService.error("Чат не найден. Возможно, отклик еще не принят.");
      }
    } catch (error: any) {
      console.error("Error opening chat:", error);
      if (error.response?.status === 404) {
        toastService.warning("Чат еще не создан. Отклик должен быть принят заказчиком.");
      } else {
        toastService.error(error.response?.data?.error || "Ошибка открытия чата");
      }
    }
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
              <Skeleton active paragraph={{ rows: 8 }} />
            </Card>
          </div>
        </Content>
      </Layout>
    );
  }

  if (!order) {
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
              <Empty description="Заказ не найден" />
            </Card>
          </div>
        </Content>
      </Layout>
    );
  }

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
              {/* Back Button */}
              <Button
                type="text"
                icon={<ArrowLeft size={16} />}
                onClick={() => router.back()}
                style={{
                  padding: 0,
                  height: "auto",
                  fontSize: 14,
                  lineHeight: "22px",
                }}
              >
                Назад
              </Button>

              <Row gutter={[24, 24]}>
                {/* Main Content */}
                <Col xs={24} lg={16}>
                  <Space direction="vertical" size={24} style={{ width: "100%" }}>
                    {/* Order Header */}
                    <Card
                      style={{
                        borderRadius: token.borderRadiusLG,
                        borderColor: token.colorBorder,
                      }}
                      styles={{
                        body: { padding: 32 },
                      }}
                    >
                      <Space direction="vertical" size={24} style={{ width: "100%" }}>
                        {/* Title & Status */}
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: 16,
                              marginBottom: 12,
                            }}
                          >
                            <Title
                              level={1}
                              style={{
                                margin: 0,
                                fontSize: 28,
                                lineHeight: "36px",
                                fontWeight: 600,
                              }}
                            >
                              {order.title}
                            </Title>
                            <Tag
                              color={getOrderStatusColor(order.status)}
                              style={{
                                margin: 0,
                                fontSize: 14,
                                lineHeight: "22px",
                                padding: "4px 12px",
                                borderRadius: token.borderRadiusSM,
                              }}
                            >
                              {getOrderStatusLabel(order.status)}
                            </Tag>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                            <Space size={6}>
                              <Clock size={16} style={{ color: token.colorTextTertiary }} />
                              <Text
                                type="secondary"
                                style={{ fontSize: 14, lineHeight: "22px" }}
                              >
                                {dayjs(order.created_at).fromNow()}
                              </Text>
                            </Space>
                            {order.proposals_count !== undefined && (
                              <Space size={6}>
                                <MessageSquare size={16} style={{ color: token.colorTextTertiary }} />
                                <Text
                                  type="secondary"
                                  style={{ fontSize: 14, lineHeight: "22px" }}
                                >
                                  {order.proposals_count} откликов
                                </Text>
                              </Space>
                            )}
                          </div>
                        </div>

                        <Divider style={{ margin: 0 }} />

                        {/* Description */}
                        <div>
                          <Space align="center" size={12} style={{ marginBottom: 16 }}>
                            <FileText size={20} style={{ color: token.colorPrimary }} />
                            <Title
                              level={4}
                              style={{
                                margin: 0,
                                fontSize: 16,
                                lineHeight: "24px",
                                fontWeight: 600,
                              }}
                            >
                              Описание
                            </Title>
                          </Space>
                          <Paragraph
                            style={{
                              fontSize: 14,
                              lineHeight: "22px",
                              whiteSpace: "pre-wrap",
                              margin: 0,
                            }}
                          >
                            {order.description}
                          </Paragraph>
                        </div>

                        {/* Skills */}
                        {order.requirements && order.requirements.length > 0 && (
                          <>
                            <Divider style={{ margin: 0 }} />
                            <div>
                              <Space align="center" size={12} style={{ marginBottom: 16 }}>
                                <Code size={20} style={{ color: token.colorInfo }} />
                                <Title
                                  level={4}
                                  style={{
                                    margin: 0,
                                    fontSize: 16,
                                    lineHeight: "24px",
                                    fontWeight: 600,
                                  }}
                                >
                                  Требуемые навыки
                                </Title>
                              </Space>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {order.requirements.map((req, idx) => (
                                  <Tag
                                    key={idx}
                                    color="processing"
                                    style={{
                                      margin: 0,
                                      fontSize: 14,
                                      lineHeight: "22px",
                                      padding: "4px 12px",
                                      borderRadius: token.borderRadiusSM,
                                    }}
                                  >
                                    {req.skill}
                                  </Tag>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </Space>
                    </Card>

                    {/* Proposals Section for Owner */}
                    {isOwner && (
                      <Card
                        title={
                          <Space>
                            <MessageSquare size={20} style={{ color: token.colorPrimary }} />
                            <span>Отклики на заказ</span>
                            {proposals.length > 0 && (
                              <Tag color="blue">{proposals.length}</Tag>
                            )}
                          </Space>
                        }
                        style={{
                          borderRadius: token.borderRadiusLG,
                          borderColor: token.colorBorder,
                        }}
                        styles={{
                          body: { padding: 24 },
                        }}
                        loading={loadingProposals}
                      >
                        {bestRecommendation && (
                          <Alert
                            message={
                              <Space>
                                <Sparkles size={16} />
                                <Text strong>AI рекомендует этого исполнителя</Text>
                              </Space>
                            }
                            description={
                              <Text style={{ fontSize: 14, marginTop: 8, display: "block" }}>
                                {bestRecommendation.justification}
                              </Text>
                            }
                            type="info"
                            icon={<Sparkles size={16} />}
                            style={{ marginBottom: 16 }}
                            action={
                              <Button
                                type="primary"
                                size="small"
                                onClick={async () => {
                                  setProcessingProposalId(bestRecommendation.proposal_id);
                                  try {
                                    const result = await updateProposalStatus(
                                      orderId,
                                      bestRecommendation.proposal_id,
                                      "accepted"
                                    );
                                    toastService.success("Отклик принят! Заказ переведен в работу.");
                                    await loadProposals();
                                    await loadOrder();
                                    if (result.conversation) {
                                      router.push(`/messages/${result.conversation.id}`);
                                    }
                                  } catch (error: any) {
                                    toastService.error(error.response?.data?.error || "Ошибка принятия отклика");
                                  } finally {
                                    setProcessingProposalId(null);
                                  }
                                }}
                                loading={processingProposalId === bestRecommendation.proposal_id}
                              >
                                Принять
                              </Button>
                            }
                          />
                        )}

                        {proposals.length === 0 ? (
                          <Empty
                            description="Пока нет откликов"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        ) : (
                          <Space direction="vertical" size={16} style={{ width: "100%" }}>
                            {proposals.map((proposal) => {
                              const isRecommended = bestRecommendation?.proposal_id === proposal.id;
                              const statusConfig: Record<string, { label: string; color: string }> = {
                                pending: { label: "Ожидает", color: "processing" },
                                shortlisted: { label: "В шорт-листе", color: "warning" },
                                accepted: { label: "Принято", color: "success" },
                                rejected: { label: "Отклонено", color: "error" },
                              };
                              const statusInfo = statusConfig[proposal.status] || statusConfig.pending;

                              return (
                                <Card
                                  key={proposal.id}
                                  size="small"
                                  style={{
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
                                    <Col xs={24} md={16}>
                                      <Space direction="vertical" size={8} style={{ width: "100%" }}>
                                        <Space>
                                          <Avatar size={32}>
                                            {proposal.freelancer_id?.toString().charAt(0).toUpperCase()}
                                          </Avatar>
                                          <div>
                                            <Text strong>Фрилансер #{proposal.freelancer_id?.toString().slice(0, 8)}</Text>
                                            <div>
                                              <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                                              {isRecommended && (
                                                <Tag color="gold" icon={<Sparkles size={12} />}>
                                                  AI рекомендует
                                                </Tag>
                                              )}
                                            </div>
                                          </div>
                                        </Space>
                                        <Paragraph
                                          ellipsis={{ rows: 2, expandable: true, symbol: "показать больше" }}
                                          style={{ margin: 0, fontSize: 14 }}
                                        >
                                          {proposal.cover_letter}
                                        </Paragraph>
                                        {proposal.proposed_amount && (
                                          <Text type="secondary" style={{ fontSize: 12 }}>
                                            Предложенная сумма: {formatPriceRange(
                                              proposal.proposed_amount,
                                              proposal.proposed_amount
                                            )}
                                          </Text>
                                        )}
                                      </Space>
                                    </Col>
                                    <Col xs={24} md={8}>
                                      <Space direction="vertical" size={8} style={{ width: "100%" }}>
                                        {proposal.status === "pending" && (
                                          <>
                                            <Button
                                              type="primary"
                                              size="small"
                                              icon={<CheckCircle size={14} />}
                                              block
                                              onClick={async () => {
                                                setProcessingProposalId(proposal.id);
                                                try {
                                                  const result = await updateProposalStatus(
                                                    orderId,
                                                    proposal.id,
                                                    "accepted"
                                                  );
                                                  toastService.success("Отклик принят!");
                                                  await loadProposals();
                                                  await loadOrder();
                                                  if (result.conversation) {
                                                    router.push(`/messages/${result.conversation.id}`);
                                                  }
                                                } catch (error: any) {
                                                  toastService.error(error.response?.data?.error || "Ошибка");
                                                } finally {
                                                  setProcessingProposalId(null);
                                                }
                                              }}
                                              loading={processingProposalId === proposal.id}
                                            >
                                              Принять
                                            </Button>
                                            <Button
                                              size="small"
                                              block
                                              onClick={async () => {
                                                setProcessingProposalId(proposal.id);
                                                try {
                                                  await updateProposalStatus(orderId, proposal.id, "shortlisted");
                                                  toastService.success("Добавлено в шорт-лист");
                                                  await loadProposals();
                                                } catch (error: any) {
                                                  toastService.error(error.response?.data?.error || "Ошибка");
                                                } finally {
                                                  setProcessingProposalId(null);
                                                }
                                              }}
                                              loading={processingProposalId === proposal.id}
                                            >
                                              В шорт-лист
                                            </Button>
                                            <Button
                                              danger
                                              size="small"
                                              icon={<XCircle size={14} />}
                                              block
                                              onClick={async () => {
                                                setProcessingProposalId(proposal.id);
                                                try {
                                                  await updateProposalStatus(orderId, proposal.id, "rejected");
                                                  toastService.success("Отклик отклонен");
                                                  await loadProposals();
                                                } catch (error: any) {
                                                  toastService.error(error.response?.data?.error || "Ошибка");
                                                } finally {
                                                  setProcessingProposalId(null);
                                                }
                                              }}
                                              loading={processingProposalId === proposal.id}
                                            >
                                              Отклонить
                                            </Button>
                                          </>
                                        )}
                                        {proposal.status === "accepted" && (
                                          <Button
                                            size="small"
                                            icon={<MessageSquare size={14} />}
                                            block
                                            onClick={async () => {
                                              try {
                                                const { getConversation } = await import("@/src/shared/api/conversations");
                                                const convData = await getConversation(orderId, proposal.freelancer_id);
                                                if (convData.conversation) {
                                                  router.push(`/messages/${convData.conversation.id}`);
                                                }
                                              } catch (error: any) {
                                                toastService.error("Ошибка открытия чата");
                                              }
                                            }}
                                          >
                                            Открыть чат
                                          </Button>
                                        )}
                                        <Button
                                          type="link"
                                          size="small"
                                          block
                                          onClick={() => router.push(`/orders/${orderId}/proposals`)}
                                        >
                                          Подробнее
                                        </Button>
                                      </Space>
                                    </Col>
                                  </Row>
                                </Card>
                              );
                            })}
                            <div style={{ textAlign: "center", marginTop: 8 }}>
                              <Button
                                type="link"
                                onClick={() => router.push(`/orders/${orderId}/proposals`)}
                              >
                                Посмотреть все отклики ({proposals.length})
                              </Button>
                            </div>
                          </Space>
                        )}
                      </Card>
                    )}

                    {/* Action Button */}
                    {canApply && (
                      <Button
                        type="primary"
                        size="large"
                        icon={<CheckCircle size={20} />}
                        block
                        loading={checkingProposal}
                        style={{
                          height: 48,
                          fontSize: 16,
                          lineHeight: "24px",
                          fontWeight: 500,
                        }}
                        onClick={() => {
                          router.push(`/orders/${orderId}/proposal`);
                        }}
                      >
                        Откликнуться на заказ
                      </Button>
                    )}
                    
                    {/* My Proposal Status */}
                    {myProposal && userRole === "freelancer" && (
                      <Card
                        style={{
                          borderRadius: token.borderRadiusLG,
                          borderColor: token.colorBorder,
                          background: `${token.colorPrimary}08`,
                        }}
                      >
                        <Space direction="vertical" size={12} style={{ width: "100%" }}>
                          <Text strong style={{ fontSize: 16 }}>
                            Ваш отклик
                          </Text>
                          <Tag
                            color={
                              myProposal.status === "accepted"
                                ? "success"
                                : myProposal.status === "rejected"
                                ? "error"
                                : myProposal.status === "shortlisted"
                                ? "warning"
                                : "processing"
                            }
                          >
                            {myProposal.status === "accepted"
                              ? "Принят"
                              : myProposal.status === "rejected"
                              ? "Отклонен"
                              : myProposal.status === "shortlisted"
                              ? "В шорт-листе"
                              : "Ожидает рассмотрения"}
                          </Tag>
                          {myProposal.status === "accepted" && (
                            <Button
                              type="primary"
                              icon={<MessageSquare size={16} />}
                              block
                              onClick={handleOpenChat}
                              style={{ fontSize: 14, height: 40 }}
                            >
                              Открыть чат
                            </Button>
                          )}
                          <Link href={`/proposals`}>
                            <Button type="link" block style={{ fontSize: 12, padding: 0 }}>
                              Посмотреть все мои отклики
                            </Button>
                          </Link>
                        </Space>
                      </Card>
                    )}
                  </Space>
                </Col>

                {/* Sidebar */}
                <Col xs={24} lg={8}>
                  <Space direction="vertical" size={24} style={{ width: "100%" }}>
                    {/* Budget & Deadline */}
                    <Card
                      title="Бюджет и сроки"
                      style={{
                        borderRadius: token.borderRadiusLG,
                        borderColor: token.colorBorder,
                      }}
                      styles={{
                        body: { padding: 24 },
                      }}
                    >
                      <Space direction="vertical" size={16} style={{ width: "100%" }}>
                        {order.budget_min && (
                          <div>
                            <Space size={8} style={{ marginBottom: 4 }}>
                              <RussianRuble
                                size={18}
                                style={{ color: token.colorSuccess }}
                              />
                              <Text
                                strong
                                style={{ fontSize: 14, lineHeight: "22px" }}
                              >
                                Бюджет
                              </Text>
                            </Space>
                            <Text
                              style={{
                                fontSize: 20,
                                lineHeight: "28px",
                                fontWeight: 600,
                                display: "block",
                              }}
                            >
                              {formatPriceRange(order.budget_min, order.budget_max)}
                            </Text>
                          </div>
                        )}

                        {order.deadline_at && (
                          <div>
                            <Space size={8} style={{ marginBottom: 4 }}>
                              <Calendar
                                size={18}
                                style={{ color: token.colorWarning }}
                              />
                              <Text
                                strong
                                style={{ fontSize: 14, lineHeight: "22px" }}
                              >
                                Дедлайн
                              </Text>
                            </Space>
                            <Text
                              style={{
                                fontSize: 16,
                                lineHeight: "24px",
                                fontWeight: 500,
                                display: "block",
                              }}
                            >
                              {dayjs(order.deadline_at).format("DD MMMM YYYY")}
                            </Text>
                            <Text
                              type="secondary"
                              style={{ fontSize: 14, lineHeight: "22px" }}
                            >
                              ({dayjs(order.deadline_at).fromNow()})
                            </Text>
                          </div>
                        )}
                      </Space>
                    </Card>

                    {/* Actions */}
                    <Card
                      title="Действия"
                      style={{
                        borderRadius: token.borderRadiusLG,
                        borderColor: token.colorBorder,
                      }}
                      styles={{
                        body: { padding: 24 },
                      }}
                    >
                      <Space direction="vertical" size={12} style={{ width: "100%" }}>
                        {isOwner && (
                          <>
                            {order.status === "published" && (
                              <Button
                                block
                                icon={<FileText size={16} />}
                                onClick={() => router.push(`/orders/${orderId}/proposals`)}
                                style={{ fontSize: 14, height: 40 }}
                              >
                                Просмотреть отклики ({order.proposals_count || 0})
                              </Button>
                            )}
                            {order.status === "in_progress" && (
                              <Button
                                type="primary"
                                block
                                icon={<CheckCircle size={16} />}
                                onClick={handleCompleteOrder}
                                style={{ fontSize: 14, height: 40 }}
                              >
                                Завершить заказ
                              </Button>
                            )}
                            {order.status !== "completed" && order.status !== "cancelled" && (
                              <Button
                                block
                                icon={<MessageSquare size={16} />}
                                onClick={handleOpenChat}
                                style={{ fontSize: 14, height: 40 }}
                                disabled={order.status === "published"}
                              >
                                Открыть чат
                              </Button>
                            )}
                          </>
                        )}
                        {!isOwner && userRole === "freelancer" && myProposal?.status === "accepted" && (
                          <Button
                            block
                            icon={<MessageSquare size={16} />}
                            onClick={handleOpenChat}
                            style={{ fontSize: 14, height: 40 }}
                          >
                            Открыть чат
                          </Button>
                        )}
                      </Space>
                    </Card>

                    {/* Client Info */}
                    <Card
                      title="О заказчике"
                      style={{
                        borderRadius: token.borderRadiusLG,
                        borderColor: token.colorBorder,
                      }}
                      styles={{
                        body: { padding: 24 },
                      }}
                    >
                      <Space direction="vertical" size={12} style={{ width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <Avatar
                            size={48}
                            style={{
                              background: `${token.colorPrimary}1A`,
                              color: token.colorPrimary,
                              fontSize: 18,
                              fontWeight: 600,
                            }}
                          >
                            {order.client_id?.toString().charAt(0).toUpperCase()}
                          </Avatar>
                          <div>
                            <Text
                              strong
                              style={{
                                fontSize: 16,
                                lineHeight: "24px",
                                display: "block",
                              }}
                            >
                              Заказчик
                            </Text>
                            <Text
                              type="secondary"
                              style={{ fontSize: 14, lineHeight: "22px" }}
                            >
                              ID: {order.client_id?.toString().slice(0, 8)}
                            </Text>
                          </div>
                        </div>
                        <Button
                          block
                          icon={<User size={16} />}
                          onClick={() => router.push(`/users/${order.client_id}`)}
                          style={{ fontSize: 14, height: 40 }}
                        >
                          Посмотреть профиль
                        </Button>
                      </Space>
                    </Card>
                  </Space>
                </Col>
              </Row>
            </Space>
          </motion.div>
        </div>
      </Content>
    </Layout>
  );
}
