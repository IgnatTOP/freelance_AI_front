"use client";
import { toastService } from "@/src/shared/lib/toast";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Card,
  Typography,
  Stack,
  Button,
  Avatar,
  CircularProgress,
  useTheme,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  IconButton,
  alpha,
} from "@mui/material";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, XCircle, User, Sparkles, MessageSquare, Wallet } from "lucide-react";
import { getOrderProposals, updateProposalStatus } from "@/src/shared/api/proposals";
import { getOrder } from "@/src/shared/api/orders";
import { getBalance } from "@/src/shared/api/payments";
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

const statusConfig: Record<string, { label: string; color: "info" | "warning" | "success" | "error" | "default"; icon: typeof CheckCircle }> = {
  pending: { label: "Ожидает", color: "info", icon: CheckCircle },
  accepted: { label: "Принято", color: "success", icon: CheckCircle },
  rejected: { label: "Отклонено", color: "error", icon: XCircle },
  withdrawn: { label: "Отозвано", color: "default", icon: XCircle },
};

// Компонент для текста с кнопкой "Показать всё"
function ExpandableText({ text, maxLines = 4 }: { text: string; maxLines?: number }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 200;

  return (
    <Box>
      <Typography
        variant="body2"
        sx={!expanded && isLong ? {
          display: "-webkit-box",
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        } : {}}
      >
        {text}
      </Typography>
      {isLong && (
        <Button
          size="small"
          onClick={() => setExpanded(!expanded)}
          sx={{ p: 0, mt: 0.5, minWidth: 0, fontSize: 12, textTransform: "none" }}
        >
          {expanded ? "Свернуть" : "Показать всё"}
        </Button>
      )}
    </Box>
  );
}

export default function OrderProposalsPage() {
  const theme = useTheme();
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
  
  // Escrow confirmation
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);

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
    loadBalance();
  }, [orderId, router]);

  const loadBalance = async () => {
    try {
      const balance = await getBalance();
      setUserBalance(balance.available || 0);
    } catch {
      // ignore
    }
  };

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
    const unsubscribeProposalsUpdated = websocketService.on("proposals.updated", (wsMessage) => {
      const data = wsMessage.data;
      if (data.order?.id === orderId || data.proposal?.order_id === orderId) {
        loadData();
      }
    });

    // Подписываемся на новые отклики
    const unsubscribeProposalsNew = websocketService.on("proposals.new", (wsMessage) => {
      const data = wsMessage.data;
      if (data.order?.id === orderId || data.proposal?.order_id === orderId || data.order_id === orderId) {
        refreshProposals();
        toastService.info("Новый отклик на заказ!");
      }
    });

    // Подписываемся на готовность AI анализа
    const unsubscribeAIAnalysis = websocketService.on("proposals.ai_analysis_ready", (wsMessage) => {
      const data = wsMessage.data;
      if (data.order_id === orderId) {
        refreshProposals();
        toastService.success("AI анализ откликов готов");
      }
    });

    // Подписываемся на обновления заказов (завершение, отмена и т.д.)
    const unsubscribeOrders = websocketService.on("orders.updated", (wsMessage) => {
      const data = wsMessage.data;

      // Проверяем, относится ли это к текущему заказу
      if (data.order?.id === orderId) {
        refreshProposals();
      }
    });

    // Подписываемся на уведомления (new_proposal приходит как notification)
    const unsubscribeNotifications = websocketService.onNotification((notification) => {
      if (notification.payload?.type === "new_proposal" && notification.payload?.order_id === orderId) {
        refreshProposals();
        toastService.info("Новый отклик на заказ!");
      }
    });

    // Подписываемся на изменения подключения
    const unsubscribeConnection = websocketService.onConnectionChange((connected) => {
      if (connected) {
        refreshProposals();
      }
    });

    return () => {
      unsubscribeProposalsUpdated();
      unsubscribeProposalsNew();
      unsubscribeAIAnalysis();
      unsubscribeOrders();
      unsubscribeNotifications();
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
      // Support both old and new API response format
      const bestRec = proposalsData.best_recommendation || (proposalsData.best_recommendation_proposal_id ? {
        proposal_id: proposalsData.best_recommendation_proposal_id,
        justification: proposalsData.recommendation_justification || "",
      } : null);
      setBestRecommendation(bestRec);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toastService.error(error.response?.data?.error || "Ошибка загрузки данных");
      router.push(`/orders/${orderId}`);
    } finally {
      setLoading(false);
    }
  };

  // Фоновое обновление без перезагрузки страницы
  const refreshProposals = async () => {
    try {
      const proposalsData = await getOrderProposals(orderId);
      setProposals(proposalsData.proposals || []);
      const bestRec = proposalsData.best_recommendation || (proposalsData.best_recommendation_proposal_id ? {
        proposal_id: proposalsData.best_recommendation_proposal_id,
        justification: proposalsData.recommendation_justification || "",
      } : null);
      setBestRecommendation(bestRec);
    } catch {
      // ignore background refresh errors
    }
  };

  const getProposalAmount = (proposal: Proposal): number => {
    return proposal.proposed_amount || order?.budget_max || order?.budget_min || 0;
  };

  const handleAcceptClick = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setConfirmModalOpen(true);
  };

  const handleStatusChange = async (
    proposalId: string,
    status: "accepted" | "rejected"
  ) => {
    setProcessingId(proposalId);
    setConfirmModalOpen(false);

    try {
      const result = await updateProposalStatus(orderId, proposalId, status);

      if (status === "accepted") {
        toastService.success("Отклик принят! Средства зарезервированы.");
        // Если есть conversation, показываем модальное окно
        if (result.conversation) {
          setSuccessModalConversationId(result.conversation.id);
          setSuccessModalOpen(true);
        }
        loadBalance(); // Обновляем баланс
      } else {
        const statusInfo = statusConfig[status];
        toastService.success(`Статус отклика изменен на "${statusInfo?.label || status}"`);
      }

      // Перезагружаем данные
      await loadData();
    } catch (error: any) {
      console.error("Error updating proposal status:", error);
      const errorMsg = error.response?.data?.error || "Ошибка изменения статуса";
      
      // Проверяем на ошибку недостаточности средств
      if (errorMsg.includes("недостаточно средств")) {
        toastService.error("Недостаточно средств на балансе. Пополните баланс для продолжения.");
      } else {
        toastService.error(errorMsg);
      }
    } finally {
      setProcessingId(null);
      setSelectedProposal(null);
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
      <Box sx={{ minHeight: 'auto', background: "transparent" }}>
        <Container maxWidth="lg" sx={{ py: 5 }}>
          <Card sx={{ p: 5, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CircularProgress size={60} />
          </Card>
        </Container>
      </Box>
    );
  }

  if (!order) {
    return null;
  }

  const recommendedProposal = bestRecommendation
    ? proposals.find((p) => p.id === bestRecommendation.proposal_id)
    : null;

  // Check if any proposal is already accepted - hide action buttons for others
  const hasAcceptedProposal = proposals.some((p) => p.status === "accepted");

  return (
    <Box sx={{ minHeight: 'auto', background: "transparent" }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Stack spacing={3}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                onClick={() => router.push(`/orders/${orderId}`)}
                sx={{ flexShrink: 0 }}
              >
                <ArrowLeft size={20} />
              </IconButton>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Отклики на заказ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.title}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Всего: {proposals.length}
              </Typography>
            </Box>

            {/* Proposals List */}
            {proposals.length === 0 ? (
              <Card sx={{ p: 10, textAlign: "center" }}>
                <Stack spacing={2} alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Пока нет откликов
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Отклики появятся здесь, когда фрилансеры начнут откликаться на ваш заказ
                  </Typography>
                </Stack>
              </Card>
            ) : (
              <>
                {/* AI анализ индикатор */}
                {proposals.length >= 2 && !bestRecommendation && (
                  <Alert 
                    severity="info" 
                    icon={<Sparkles size={18} className="animate-pulse" />}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="body2">
                      AI анализирует кандидатов...
                    </Typography>
                  </Alert>
                )}
                <Grid container spacing={2}>
                {[...proposals].sort((a, b) => {
                  // Рекомендованный всегда первый
                  if (a.id === bestRecommendation?.proposal_id) return -1;
                  if (b.id === bestRecommendation?.proposal_id) return 1;
                  return 0;
                }).map((proposal) => {
                  const statusInfo = statusConfig[proposal.status];
                  const StatusIcon = statusInfo.icon;
                  const isRecommended = recommendedProposal?.id === proposal.id;

                  return (
                    <Grid size={{ xs: 12 }} key={proposal.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card
                          sx={{
                            border: 2,
                            borderColor: isRecommended ? "primary.main" : "divider",
                            bgcolor: isRecommended ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
                          }}
                        >
                          <Box sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, md: 9 }}>
                                <Stack spacing={1.5}>
                                  {/* Header */}
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Avatar
                                      sx={{
                                        width: 48,
                                        height: 48,
                                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                                        color: "primary.main",
                                      }}
                                    >
                                      <User size={24} />
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        Фрилансер #{proposal.freelancer_id.slice(0, 8)}
                                      </Typography>
                                      <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                                        <Chip
                                          label={statusInfo.label}
                                          color={statusInfo.color}
                                          size="small"
                                          icon={<StatusIcon size={12} />}
                                        />
                                        {isRecommended && (
                                          <Chip
                                            label="AI рекомендует"
                                            color="warning"
                                            size="small"
                                            icon={<Sparkles size={12} />}
                                          />
                                        )}
                                      </Box>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatTimeAgo(proposal.created_at)}
                                    </Typography>
                                  </Box>

                                  <Divider />

                                  {/* Cover Letter */}
                                  <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                      Сопроводительное письмо
                                    </Typography>
                                    <ExpandableText text={proposal.cover_letter} maxLines={4} />
                                  </Box>

                                  {/* AI Feedback */}
                                  {isRecommended && bestRecommendation?.justification && (
                                    <Alert
                                      severity="success"
                                      icon={<Sparkles size={14} />}
                                      sx={{ fontSize: 12 }}
                                    >
                                      <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                                        Почему AI рекомендует
                                      </Typography>
                                      <Typography variant="caption">{bestRecommendation.justification}</Typography>
                                    </Alert>
                                  )}
                                  {proposal.ai_feedback && !isRecommended && (
                                    <Alert
                                      severity="info"
                                      icon={<Sparkles size={14} />}
                                      sx={{ fontSize: 12 }}
                                    >
                                      <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                                        AI анализ отклика
                                      </Typography>
                                      <Typography variant="caption">{proposal.ai_feedback}</Typography>
                                    </Alert>
                                  )}

                                  {/* Meta */}
                                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                    {proposal.proposed_amount && (
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">
                                          Предложенная сумма:
                                        </Typography>{" "}
                                        <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                                          {formatPriceRange(proposal.proposed_amount, proposal.proposed_amount)}
                                        </Typography>
                                      </Box>
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                      Отправлен: {formatDate(proposal.created_at)}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Grid>

                              <Grid size={{ xs: 12, md: 3 }}>
                                <Stack spacing={1}>
                                  {proposal.status === "pending" && !hasAcceptedProposal && (
                                    <>
                                      <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={<CheckCircle size={16} />}
                                        onClick={() => handleAcceptClick(proposal)}
                                        disabled={processingId === proposal.id}
                                      >
                                        Принять
                                      </Button>
                                      <Button
                                        variant="outlined"
                                        color="error"
                                        fullWidth
                                        startIcon={<XCircle size={16} />}
                                        onClick={() => handleStatusChange(proposal.id, "rejected")}
                                        disabled={processingId === proposal.id}
                                      >
                                        Отклонить
                                      </Button>
                                    </>
                                  )}
                                  {proposal.status === "accepted" && (
                                    <Button
                                      variant="outlined"
                                      fullWidth
                                      startIcon={<MessageSquare size={16} />}
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
                                </Stack>
                              </Grid>
                            </Grid>
                          </Box>
                        </Card>
                      </motion.div>
                    </Grid>
                  );
                })}
              </Grid>
              </>
            )}
          </Stack>
        </motion.div>
      </Container>

      {/* Confirm Accept Dialog */}
      <Dialog
        open={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setSelectedProposal(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Подтверждение выбора исполнителя</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info" icon={<Wallet size={20} />}>
              <Typography variant="body2">
                При выборе исполнителя средства будут зарезервированы до завершения заказа.
              </Typography>
            </Alert>
            <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
              <Stack spacing={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Ваш баланс:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {userBalance.toLocaleString("ru-RU")} ₽
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Будет зарезервировано:</Typography>
                  <Typography variant="body2" fontWeight={600} color="warning.main">
                    {selectedProposal ? getProposalAmount(selectedProposal).toLocaleString("ru-RU") : 0} ₽
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Останется:</Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    color={userBalance - (selectedProposal ? getProposalAmount(selectedProposal) : 0) >= 0 ? "success.main" : "error.main"}
                  >
                    {(userBalance - (selectedProposal ? getProposalAmount(selectedProposal) : 0)).toLocaleString("ru-RU")} ₽
                  </Typography>
                </Box>
              </Stack>
            </Box>
            {userBalance < (selectedProposal ? getProposalAmount(selectedProposal) : 0) && (
              <Alert severity="error">
                Недостаточно средств. Пополните баланс для продолжения.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setConfirmModalOpen(false);
            setSelectedProposal(null);
          }}>
            Отмена
          </Button>
          {userBalance < (selectedProposal ? getProposalAmount(selectedProposal) : 0) ? (
            <Button
              variant="contained"
              onClick={() => router.push("/wallet")}
            >
              Пополнить баланс
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => selectedProposal && handleStatusChange(selectedProposal.id, "accepted")}
              disabled={processingId !== null}
            >
              {processingId ? "Обработка..." : "Подтвердить"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={successModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          setSuccessModalConversationId(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Отклик принят!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Средства зарезервированы. Заказ переведен в работу. Вы можете начать общение с исполнителем.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSuccessModalOpen(false);
              setSuccessModalConversationId(null);
            }}
          >
            Закрыть
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (successModalConversationId) {
                router.push(`/messages/${successModalConversationId}`);
              }
              setSuccessModalOpen(false);
              setSuccessModalConversationId(null);
            }}
            autoFocus
          >
            Открыть чат
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
