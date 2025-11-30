"use client";
import { toastService } from "@/src/shared/lib/toast";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Card,
  Typography,
  Stack,
  Chip,
  Button,
  Skeleton,
  Divider,
  Grid,
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  useTheme,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
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

export default function OrderDetailPage() {
  const theme = useTheme();
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
      <Box sx={{ minHeight: "100vh", background: "transparent" }}>
        <Container maxWidth="lg" sx={{ py: 5 }}>
          <Card
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              p: 3,
            }}
          >
            <Skeleton variant="rectangular" height={20} width="60%" sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={16} width="40%" sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={16} width="80%" sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={16} width="75%" sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={16} width="70%" />
          </Card>
        </Container>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ minHeight: "100vh", background: "transparent" }}>
        <Container maxWidth="lg" sx={{ py: 5 }}>
          <Card
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              p: 4,
            }}
          >
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Заказ не найден
              </Typography>
            </Box>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "transparent" }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Stack spacing={4}>
            {/* Back Button */}
            <Button
              startIcon={<ArrowLeft size={16} />}
              onClick={() => router.back()}
              sx={{
                alignSelf: "flex-start",
                color: "text.primary",
                textTransform: "none",
                fontSize: 14,
                p: 0,
                "&:hover": {
                  background: "transparent",
                  opacity: 0.7,
                },
              }}
            >
              Назад
            </Button>

            <Grid container spacing={3}>
              {/* Main Content */}
              <Grid size={{ xs: 12, lg: 8 }}>
                <Stack spacing={3}>
                  {/* Order Header */}
                  <Card
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      p: 4,
                    }}
                  >
                    <Stack spacing={3}>
                      {/* Title & Status */}
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 2,
                            mb: 1.5,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: 24, sm: 28 },
                              lineHeight: 1.3,
                            }}
                          >
                            {order.title}
                          </Typography>
                          <Chip
                            label={getOrderStatusLabel(order.status)}
                            color={
                              order.status === "published"
                                ? "primary"
                                : order.status === "in_progress"
                                ? "warning"
                                : order.status === "completed"
                                ? "success"
                                : "default"
                            }
                            sx={{ fontSize: 14 }}
                          />
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Clock size={16} style={{ color: theme.palette.text.secondary }} />
                            <Typography variant="body2" color="text.secondary">
                              {dayjs(order.created_at).fromNow()}
                            </Typography>
                          </Box>
                          {order.proposals_count !== undefined && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                              <MessageSquare size={16} style={{ color: theme.palette.text.secondary }} />
                              <Typography variant="body2" color="text.secondary">
                                {order.proposals_count} откликов
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>

                      <Divider />

                      {/* Description */}
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                          <FileText size={20} style={{ color: theme.palette.primary.main }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16 }}>
                            Описание
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.6,
                          }}
                        >
                          {order.description}
                        </Typography>
                      </Box>

                      {/* Skills */}
                      {order.requirements && order.requirements.length > 0 && (
                        <>
                          <Divider />
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                              <Code size={20} style={{ color: theme.palette.info.main }} />
                              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16 }}>
                                Требуемые навыки
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                              {order.requirements.map((req, idx) => (
                                <Chip
                                  key={idx}
                                  label={req.skill}
                                  color="primary"
                                  variant="outlined"
                                  sx={{ fontSize: 14 }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </>
                      )}
                    </Stack>
                  </Card>

                  {/* Proposals Section for Owner */}
                  {isOwner && (
                    <Card
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Box sx={{ p: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                          <MessageSquare size={20} style={{ color: theme.palette.primary.main }} />
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Отклики на заказ
                          </Typography>
                          {proposals.length > 0 && (
                            <Chip label={proposals.length} color="primary" size="small" />
                          )}
                        </Box>

                        {loadingProposals ? (
                          <Stack spacing={2}>
                            <Skeleton variant="rectangular" height={80} />
                            <Skeleton variant="rectangular" height={80} />
                          </Stack>
                        ) : (
                          <>
                            {bestRecommendation && (
                              <Alert
                                severity="info"
                                icon={<Sparkles size={20} />}
                                sx={{ mb: 2 }}
                                action={
                                  <Button
                                    variant="contained"
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
                                    disabled={processingProposalId === bestRecommendation.proposal_id}
                                  >
                                    Принять
                                  </Button>
                                }
                              >
                                <Box>
                                  <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                                    AI рекомендует этого исполнителя
                                  </Typography>
                                  <Typography variant="body2">
                                    {bestRecommendation.justification}
                                  </Typography>
                                </Box>
                              </Alert>
                            )}

                            {proposals.length === 0 ? (
                              <Box sx={{ textAlign: "center", py: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Пока нет откликов
                                </Typography>
                              </Box>
                            ) : (
                              <Stack spacing={2}>
                                {proposals.map((proposal) => {
                                  const isRecommended = bestRecommendation?.proposal_id === proposal.id;
                                  const statusConfig: Record<string, { label: string; color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" }> = {
                                    pending: { label: "Ожидает", color: "primary" },
                                    shortlisted: { label: "В шорт-листе", color: "warning" },
                                    accepted: { label: "Принято", color: "success" },
                                    rejected: { label: "Отклонено", color: "error" },
                                  };
                                  const statusInfo = statusConfig[proposal.status] || statusConfig.pending;

                                  return (
                                    <Card
                                      key={proposal.id}
                                      sx={{
                                        border: isRecommended
                                          ? `2px solid ${theme.palette.primary.main}`
                                          : `1px solid ${theme.palette.divider}`,
                                        bgcolor: isRecommended
                                          ? `${theme.palette.primary.main}08`
                                          : "background.paper",
                                        p: 2,
                                      }}
                                    >
                                      <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 8 }}>
                                          <Stack spacing={1}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                              <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                                                {proposal.freelancer_id?.toString().charAt(0).toUpperCase()}
                                              </Avatar>
                                              <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                  Фрилансер #{proposal.freelancer_id?.toString().slice(0, 8)}
                                                </Typography>
                                                <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                                                  <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
                                                  {isRecommended && (
                                                    <Chip
                                                      icon={<Sparkles size={12} />}
                                                      label="AI рекомендует"
                                                      color="warning"
                                                      size="small"
                                                    />
                                                  )}
                                                </Box>
                                              </Box>
                                            </Box>
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                              }}
                                            >
                                              {proposal.cover_letter}
                                            </Typography>
                                            {proposal.proposed_amount && (
                                              <Typography variant="caption" color="text.secondary">
                                                Предложенная сумма: {formatPriceRange(
                                                  proposal.proposed_amount,
                                                  proposal.proposed_amount
                                                )}
                                              </Typography>
                                            )}
                                          </Stack>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 4 }}>
                                          <Stack spacing={1}>
                                            {proposal.status === "pending" && (
                                              <>
                                                <Button
                                                  variant="contained"
                                                  size="small"
                                                  startIcon={<CheckCircle size={14} />}
                                                  fullWidth
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
                                                  disabled={processingProposalId === proposal.id}
                                                >
                                                  Принять
                                                </Button>
                                                <Button
                                                  variant="outlined"
                                                  size="small"
                                                  fullWidth
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
                                                  disabled={processingProposalId === proposal.id}
                                                >
                                                  В шорт-лист
                                                </Button>
                                                <Button
                                                  variant="outlined"
                                                  color="error"
                                                  size="small"
                                                  startIcon={<XCircle size={14} />}
                                                  fullWidth
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
                                                  disabled={processingProposalId === proposal.id}
                                                >
                                                  Отклонить
                                                </Button>
                                              </>
                                            )}
                                            {proposal.status === "accepted" && (
                                              <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<MessageSquare size={14} />}
                                                fullWidth
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
                                              variant="text"
                                              size="small"
                                              fullWidth
                                              onClick={() => router.push(`/orders/${orderId}/proposals`)}
                                            >
                                              Подробнее
                                            </Button>
                                          </Stack>
                                        </Grid>
                                      </Grid>
                                    </Card>
                                  );
                                })}
                                <Box sx={{ textAlign: "center", mt: 1 }}>
                                  <Button
                                    variant="text"
                                    onClick={() => router.push(`/orders/${orderId}/proposals`)}
                                  >
                                    Посмотреть все отклики ({proposals.length})
                                  </Button>
                                </Box>
                              </Stack>
                            )}
                          </>
                        )}
                      </Box>
                    </Card>
                  )}

                  {/* Action Button */}
                  {canApply && (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<CheckCircle size={20} />}
                      fullWidth
                      disabled={checkingProposal}
                      sx={{
                        height: 48,
                        fontSize: 16,
                        fontWeight: 500,
                        textTransform: "none",
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
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: `${theme.palette.primary.main}08`,
                        p: 2,
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Typography variant="body1" fontWeight={600}>
                          Ваш отклик
                        </Typography>
                        <Chip
                          label={
                            myProposal.status === "accepted"
                              ? "Принят"
                              : myProposal.status === "rejected"
                              ? "Отклонен"
                              : myProposal.status === "shortlisted"
                              ? "В шорт-листе"
                              : "Ожидает рассмотрения"
                          }
                          color={
                            myProposal.status === "accepted"
                              ? "success"
                              : myProposal.status === "rejected"
                              ? "error"
                              : myProposal.status === "shortlisted"
                              ? "warning"
                              : "primary"
                          }
                          sx={{ alignSelf: "flex-start" }}
                        />
                        {myProposal.status === "accepted" && (
                          <Button
                            variant="contained"
                            startIcon={<MessageSquare size={16} />}
                            fullWidth
                            onClick={handleOpenChat}
                            sx={{ height: 40, fontSize: 14, textTransform: "none" }}
                          >
                            Открыть чат
                          </Button>
                        )}
                        <Link href="/proposals" style={{ textDecoration: "none" }}>
                          <Button
                            variant="text"
                            fullWidth
                            sx={{ fontSize: 12, p: 0, textTransform: "none" }}
                          >
                            Посмотреть все мои отклики
                          </Button>
                        </Link>
                      </Stack>
                    </Card>
                  )}
                </Stack>
              </Grid>

              {/* Sidebar */}
              <Grid size={{ xs: 12, lg: 4 }}>
                <Stack spacing={3}>
                  {/* Budget & Deadline */}
                  <Card
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Бюджет и сроки
                      </Typography>
                      <Stack spacing={2}>
                        {order.budget_min && (
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                              <DollarSign size={18} style={{ color: theme.palette.success.main }} />
                              <Typography variant="body2" fontWeight={600}>
                                Бюджет
                              </Typography>
                            </Box>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                fontSize: 20,
                              }}
                            >
                              {formatPriceRange(order.budget_min, order.budget_max)}
                            </Typography>
                          </Box>
                        )}

                        {order.deadline_at && (
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                              <Calendar size={18} style={{ color: theme.palette.warning.main }} />
                              <Typography variant="body2" fontWeight={600}>
                                Дедлайн
                              </Typography>
                            </Box>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500, mb: 0.5 }}
                            >
                              {dayjs(order.deadline_at).format("DD MMMM YYYY")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ({dayjs(order.deadline_at).fromNow()})
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  </Card>

                  {/* Actions */}
                  <Card
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Действия
                      </Typography>
                      <Stack spacing={1.5}>
                        {isOwner && (
                          <>
                            {order.status === "published" && (
                              <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<FileText size={16} />}
                                onClick={() => router.push(`/orders/${orderId}/proposals`)}
                                sx={{ height: 40, fontSize: 14, textTransform: "none" }}
                              >
                                Просмотреть отклики ({order.proposals_count || 0})
                              </Button>
                            )}
                            {order.status === "in_progress" && (
                              <Button
                                variant="contained"
                                fullWidth
                                startIcon={<CheckCircle size={16} />}
                                onClick={handleCompleteOrder}
                                sx={{ height: 40, fontSize: 14, textTransform: "none" }}
                              >
                                Завершить заказ
                              </Button>
                            )}
                            {order.status !== "completed" && order.status !== "cancelled" && (
                              <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<MessageSquare size={16} />}
                                onClick={handleOpenChat}
                                disabled={order.status === "published"}
                                sx={{ height: 40, fontSize: 14, textTransform: "none" }}
                              >
                                Открыть чат
                              </Button>
                            )}
                          </>
                        )}
                        {!isOwner && userRole === "freelancer" && myProposal?.status === "accepted" && (
                          <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<MessageSquare size={16} />}
                            onClick={handleOpenChat}
                            sx={{ height: 40, fontSize: 14, textTransform: "none" }}
                          >
                            Открыть чат
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </Card>

                  {/* Client Info */}
                  <Card
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        О заказчике
                      </Typography>
                      <Stack spacing={1.5}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              bgcolor: `${theme.palette.primary.main}20`,
                              color: "primary.main",
                              fontSize: 18,
                              fontWeight: 600,
                            }}
                          >
                            {order.client_id?.toString().charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body1"
                              fontWeight={600}
                              sx={{ lineHeight: 1.4 }}
                            >
                              Заказчик
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {order.client_id?.toString().slice(0, 8)}
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<User size={16} />}
                          onClick={() => router.push(`/users/${order.client_id}`)}
                          sx={{ height: 40, fontSize: 14, textTransform: "none" }}
                        >
                          Посмотреть профиль
                        </Button>
                      </Stack>
                    </Box>
                  </Card>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </motion.div>
      </Container>

      {/* Complete Order Modal */}
      <Dialog
        open={completeOrderModalOpen}
        onClose={() => setCompleteOrderModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Завершить заказ</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Вы уверены, что хотите завершить этот заказ? Это действие нельзя будет отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCompleteOrderModalOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleCompleteOrderConfirm}
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            Завершить заказ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
