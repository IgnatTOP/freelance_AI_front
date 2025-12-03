"use client";

import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Tooltip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
  alpha,
} from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import { Calendar, DollarSign, CheckCircle, XCircle, FileText, Briefcase, ExternalLink, AlertCircle, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";
import { markOrderAsCompletedByFreelancer, updateOrder } from "@/src/shared/api/orders";
import { getOrderStatusColor, getOrderStatusLabel } from "@/src/shared/lib/order-utils";
import type { MessagesResponse, Conversation } from "@/src/entities/conversation/model/types";
import { motion } from "framer-motion";

dayjs.extend(relativeTime);
dayjs.locale("ru");

interface OrderInfoSidebarProps {
  order?: MessagesResponse["order"];
  conversation: Conversation;
  currentUserId: string | null;
  onOrderUpdate: () => void;
}

export function OrderInfoSidebar({ order, conversation, currentUserId, onOrderUpdate }: OrderInfoSidebarProps) {
  const [loading, setLoading] = useState(false);
  const [completeByFreelancerModalOpen, setCompleteByFreelancerModalOpen] = useState(false);
  const [completeByClientModalOpen, setCompleteByClientModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  if (!order) {
    return (
      <Card
        sx={{
          height: "100%",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Информация о заказе недоступна
          </Typography>
        </Box>
      </Card>
    );
  }

  const isClient = currentUserId && conversation.client_id === currentUserId;
  const isFreelancer = currentUserId && conversation.freelancer_id === currentUserId;
  const isInProgress = order.status === "in_progress";
  const isCompleted = order.status === "completed";
  const isCancelled = order.status === "cancelled";

  const handleCompleteByFreelancer = async () => {
    setCompleteByFreelancerModalOpen(true);
  };

  const handleCompleteByFreelancerConfirm = async () => {
    setLoading(true);
    try {
      await markOrderAsCompletedByFreelancer(order.id);
      toastService.success("Заказ отмечен как выполненный!");
      onOrderUpdate();
      setCompleteByFreelancerModalOpen(false);
    } catch (error: any) {
      console.error("Error completing order:", error);
      toastService.error(error.response?.data?.error || "Ошибка при отметке заказа");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteByClient = async () => {
    setCompleteByClientModalOpen(true);
  };

  const handleCompleteByClientConfirm = async () => {
    setLoading(true);
    try {
      await updateOrder(order.id, { 
        title: order.title,
        description: order.description,
        status: "completed" 
      });
      toastService.success("Заказ успешно завершен!");
      onOrderUpdate();
      setCompleteByClientModalOpen(false);
    } catch (error: any) {
      console.error("Error completing order:", error);
      toastService.error(error.response?.data?.error || "Ошибка завершения заказа");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    setLoading(true);
    try {
      await updateOrder(order.id, { 
        title: order.title,
        description: order.description,
        status: "cancelled" 
      });
      toastService.success("Заказ отменен");
      onOrderUpdate();
      setCancelModalOpen(false);
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      toastService.error(error.response?.data?.error || "Ошибка отмены заказа");
    } finally {
      setLoading(false);
    }
  };

  const formatBudget = () => {
    if (order.budget_min && order.budget_max) {
      return `${order.budget_min.toLocaleString()} - ${order.budget_max.toLocaleString()} ₽`;
    } else if (order.budget_min) {
      return `от ${order.budget_min.toLocaleString()} ₽`;
    } else if (order.budget_max) {
      return `до ${order.budget_max.toLocaleString()} ₽`;
    }
    return "Не указан";
  };

  const formatDeadline = () => {
    if (!order.deadline_at) return "Не указан";
    const deadline = dayjs(order.deadline_at);
    const now = dayjs();
    const daysLeft = deadline.diff(now, "day");
    
    if (daysLeft < 0) {
      return `Просрочен на ${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? "день" : "дней"}`;
    } else if (daysLeft === 0) {
      return "Сегодня";
    } else if (daysLeft === 1) {
      return "Завтра";
    } else if (daysLeft <= 7) {
      return `Через ${daysLeft} ${daysLeft === 1 ? "день" : "дней"}`;
    }
    return deadline.format("D MMMM YYYY");
  };

  const isDeadlineNear = () => {
    if (!order.deadline_at) return false;
    const deadline = dayjs(order.deadline_at);
    const now = dayjs();
    return deadline.diff(now, "day") <= 3 && deadline.diff(now, "day") >= 0;
  };

  const isDeadlineOverdue = () => {
    if (!order.deadline_at) return false;
    return dayjs(order.deadline_at).isBefore(dayjs());
  };

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            zIndex: 10,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%", overflowY: "auto", overflowX: "hidden" }}>
        <Stack spacing={3} sx={{ width: "100%", flex: 1 }}>
          {/* Заголовок */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Инфо о заказе
              </Typography>
              <Chip
                label={getOrderStatusLabel(order.status || "")}
                size="small"
                color={getOrderStatusColor(order.status || "") as any}
              />
            </Box>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
              {order.title}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ExternalLink size={16} />}
              onClick={() => router.push(`/orders/${order.id}`)}
            >
              Открыть заказ
            </Button>
          </Box>

          <Divider />

          {/* Описание */}
          {order.description && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  p: 2.5,
                  bgcolor: alpha(theme.palette.background.default, 0.4),
                  borderRadius: 2.5,
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  transition: "all 0.3s",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.background.default, 0.6),
                    borderColor: alpha(theme.palette.divider, 0.15),
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 700,
                    display: "block",
                    mb: 1.5,
                    color: alpha(theme.palette.text.secondary, 0.8),
                }}
                >
                  Описание
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.65,
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    color: theme.palette.text.primary,
                    fontWeight: 400,
                  }}
                >
                  {order.description}
                </Typography>
              </Box>
            </motion.div>
          )}

          {/* Бюджет */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.3 }}
          >
            <Box
              sx={{
                p: 2.5,
                bgcolor: alpha(theme.palette.success.main, 0.06),
                borderRadius: 2.5,
                border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
                transition: "all 0.3s",
                boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.08)}`,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  borderColor: alpha(theme.palette.success.main, 0.25),
                  boxShadow: `0 4px 16px ${alpha(theme.palette.success.main, 0.15)}`,
                },
              }}
            >
              <Stack direction="row" spacing={2} sx={{ width: "100%", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    bgcolor: alpha(theme.palette.success.main, 0.15),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  }}
                >
                  <DollarSign size={24} style={{ color: theme.palette.success.main }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: 11,
                      display: "block",
                      mb: 0.75,
                      fontWeight: 700,
                      letterSpacing: 0.8,
                      textTransform: "uppercase",
                      color: alpha(theme.palette.text.secondary, 0.7),
                    }}
                  >
                    Бюджет
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: 20,
                      fontWeight: 800,
                      lineHeight: 1.2,
                      color: theme.palette.success.main,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {formatBudget()}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </motion.div>

          {/* Дедлайн */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Box
              sx={{
                p: 1.5,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                borderRadius: 1,
                border: 1,
                borderColor: isDeadlineOverdue()
                  ? "error.main"
                  : isDeadlineNear()
                  ? "warning.main"
                  : "divider",
              }}
            >
              <Stack direction="row" spacing={1.25} sx={{ width: "100%" }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: alpha(
                      isDeadlineOverdue()
                        ? theme.palette.error.main
                        : isDeadlineNear()
                        ? theme.palette.warning.main
                        : theme.palette.primary.main,
                      0.15
                    ),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Calendar
                    size={16}
                    style={{
                      color: isDeadlineOverdue()
                        ? theme.palette.error.main
                        : isDeadlineNear()
                        ? theme.palette.warning.main
                        : theme.palette.primary.main,
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: 11,
                      display: "block",
                      mb: 0.5,
                      fontWeight: 500,
                    }}
                  >
                    Дедлайн
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: 16,
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: isDeadlineOverdue()
                        ? "error.main"
                        : isDeadlineNear()
                        ? "warning.main"
                        : "text.primary",
                    }}
                  >
                    {formatDeadline()}
                  </Typography>
                  {order.deadline_at && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: 11,
                        display: "block",
                        mt: 0.5,
                      }}
                    >
                      {dayjs(order.deadline_at).format("D MMMM YYYY, HH:mm")}
                    </Typography>
                  )}
                  {isDeadlineNear() && !isDeadlineOverdue() && (
                    <Tooltip title="Дедлайн скоро истечет">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        <AlertCircle size={10} style={{ color: theme.palette.warning.main }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                          Срочно
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                </Box>
              </Stack>
            </Box>
          </motion.div>

          {/* Принятое предложение */}
          {order.accepted_proposal && (
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Stack direction="row" spacing={1.25} sx={{ width: "100%" }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.success.main, 0.15),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <TrendingUp size={16} style={{ color: theme.palette.success.main }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: 11,
                        display: "block",
                        mb: 0.5,
                        fontWeight: 500,
                      }}
                    >
                      Согласованная сумма
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: 16,
                        fontWeight: 600,
                        lineHeight: 1.3,
                        color: "success.main",
                      }}
                    >
                      {order.accepted_proposal.proposed_amount?.toLocaleString() || "Не указана"} ₽
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </motion.div>
          )}

          {/* Требования */}
          {order.requirements && order.requirements.length > 0 && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                  fontWeight: 600,
                  display: "block",
                  mb: 1,
                }}
              >
                Требования
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {order.requirements.map((req) => (
                  <Chip
                    key={req.id}
                    label={
                      <>
                        {req.skill} <span style={{ opacity: 0.7 }}>({req.level})</span>
                      </>
                    }
                    color="info"
                    size="small"
                    sx={{
                      fontSize: 12,
                      height: "auto",
                      py: 0.25,
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Вложения */}
          {order.attachments && order.attachments.length > 0 && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                  fontWeight: 600,
                  display: "block",
                  mb: 1,
                }}
              >
                Вложения
              </Typography>
              <Stack spacing={0.75} sx={{ width: "100%" }}>
                {order.attachments.map((att) => (
                  <Box
                    key={att.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1,
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      borderRadius: 1,
                      border: 1,
                      borderColor: "divider",
                      transition: "all 0.2s",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <FileText size={14} style={{ color: theme.palette.primary.main, flexShrink: 0 }} />
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        fontSize: 12,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {att.media?.file_path?.split("/").pop() || "Файл"}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          <Divider sx={{ my: 1.5 }} />

          {/* Кнопки действий */}
          {isInProgress && (
            <Stack spacing={1} sx={{ width: "100%" }}>
              {isFreelancer && (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<CheckCircle size={16} />}
                  onClick={handleCompleteByFreelancer}
                  disabled={loading}
                  sx={{
                    height: 36,
                    fontWeight: 500,
                    fontSize: 13,
                    textTransform: "none",
                  }}
                >
                  Отметить как выполненный
                </Button>
              )}
              {isClient && (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<CheckCircle size={16} />}
                  onClick={handleCompleteByClient}
                  disabled={loading}
                  sx={{
                    height: 36,
                    fontWeight: 500,
                    fontSize: 13,
                    textTransform: "none",
                  }}
                >
                  Завершить заказ
                </Button>
              )}
              {(isClient || isFreelancer) && (
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  startIcon={<XCircle size={16} />}
                  onClick={handleCancel}
                  disabled={loading}
                  sx={{
                    height: 36,
                    fontWeight: 500,
                    fontSize: 13,
                    textTransform: "none",
                  }}
                >
                  Отменить заказ
                </Button>
              )}
            </Stack>
          )}

          {isCompleted && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  borderRadius: 1,
                  border: 1,
                  borderColor: "success.main",
                }}
              >
                <CheckCircle size={24} style={{ color: theme.palette.success.main, marginBottom: 8 }} />
                <Typography
                  variant="body2"
                  sx={{ color: "success.main", fontWeight: 600, fontSize: 14, mb: 0.5 }}
                >
                  Заказ выполнен
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                  {order.updated_at && dayjs(order.updated_at).format("D MMMM YYYY, HH:mm")}
                </Typography>
              </Box>
            </motion.div>
          )}

          {isCancelled && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  borderRadius: 1,
                  border: 1,
                  borderColor: "error.main",
                }}
              >
                <XCircle size={24} style={{ color: theme.palette.error.main, marginBottom: 8 }} />
                <Typography
                  variant="body2"
                  sx={{ color: "error.main", fontWeight: 600, fontSize: 14, mb: 0.5 }}
                >
                  Заказ отменен
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                  {order.updated_at && dayjs(order.updated_at).format("D MMMM YYYY, HH:mm")}
                </Typography>
              </Box>
            </motion.div>
          )}

          {/* Метаинформация */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: alpha(theme.palette.background.default, 0.5),
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: 11,
                display: "block",
                lineHeight: 1.5,
              }}
            >
              <Box component="span" sx={{ fontWeight: 500 }}>
                Создан:
              </Box>{" "}
              {order.created_at ? dayjs(order.created_at).format("D MMMM YYYY, HH:mm") : "Неизвестно"}
            </Typography>
            {order.updated_at && order.updated_at !== order.created_at && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: 11,
                  display: "block",
                  mt: 0.5,
                  lineHeight: 1.5,
                }}
              >
                <Box component="span" sx={{ fontWeight: 500 }}>
                  Обновлен:
                </Box>{" "}
                {dayjs(order.updated_at).format("D MMMM YYYY, HH:mm")}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Complete by Freelancer Dialog */}
      <Dialog
        open={completeByFreelancerModalOpen}
        onClose={() => setCompleteByFreelancerModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Отметить заказ как выполненный?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что выполнили все требования заказа? После подтверждения заказ будет отмечен как выполненный.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteByFreelancerModalOpen(false)} disabled={loading}>
            Отмена
          </Button>
          <Button
            onClick={handleCompleteByFreelancerConfirm}
            variant="contained"
            disabled={loading}
            autoFocus
          >
            Да, выполнен
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete by Client Dialog */}
      <Dialog
        open={completeByClientModalOpen}
        onClose={() => setCompleteByClientModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Завершить заказ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите завершить этот заказ? Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteByClientModalOpen(false)} disabled={loading}>
            Отмена
          </Button>
          <Button
            onClick={handleCompleteByClientConfirm}
            variant="contained"
            disabled={loading}
            autoFocus
          >
            Завершить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Отменить заказ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите отменить этот заказ? Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelModalOpen(false)} disabled={loading}>
            Нет
          </Button>
          <Button
            onClick={handleCancelConfirm}
            variant="contained"
            color="error"
            disabled={loading}
            autoFocus
          >
            Отменить
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

