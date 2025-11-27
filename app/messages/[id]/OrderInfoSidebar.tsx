"use client";

import { Card, Typography, Space, Button, Tag, Divider, App, Spin, Empty, Tooltip, theme, Modal } from "antd";
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

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

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
  const { token } = useToken();

  if (!order) {
    return (
      <Card 
        style={{ 
          height: "100%",
          borderRadius: token.borderRadiusLG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Empty 
          description={
            <span style={{ color: token.colorTextSecondary }}>
              Информация о заказе недоступна
            </span>
          } 
        />
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
      style={{
        height: "100%",
        borderRadius: token.borderRadiusLG,
        overflowY: "auto",
        overflowX: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
      }}
      styles={{
        body: { padding: 16, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" },
      }}
    >
      <Spin spinning={loading}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto", overflowX: "hidden" }}>
        <Space direction="vertical" size="middle" style={{ width: "100%", flex: 1 }}>
          {/* Заголовок */}
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
              <Title level={5} style={{ margin: 0, flex: 1, lineHeight: 1.3, fontSize: 15 }}>
                Информация о заказе
              </Title>
              <Tag 
                color={getOrderStatusColor(order.status || "")}
                style={{ 
                  margin: 0,
                  borderRadius: token.borderRadius,
                  padding: "2px 10px",
                  fontSize: 11,
                  fontWeight: 500,
                  flexShrink: 0,
                  lineHeight: 1.4,
                }}
              >
                {getOrderStatusLabel(order.status || "")}
              </Tag>
            </div>
            <Text 
              strong 
              style={{ 
                fontSize: 15, 
                lineHeight: 1.3,
                display: "block",
                marginBottom: 3,
              }}
            >
              {order.title}
            </Text>
            <Button
              type="link"
              size="small"
              icon={<ExternalLink size={12} />}
              onClick={() => router.push(`/orders/${order.id}`)}
              style={{
                padding: 0,
                height: "auto",
                fontSize: 12,
                color: token.colorPrimary,
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              Открыть заказ
            </Button>
          </div>

          <Divider style={{ margin: "10px 0", borderColor: token.colorBorder }} />

          {/* Описание */}
          {order.description && (
            <div style={{ 
              padding: 12,
              background: token.colorFillQuaternary || token.colorFillTertiary,
              borderRadius: token.borderRadius,
              border: `1px solid ${token.colorBorder}`,
            }}>
              <Text 
                type="secondary" 
                style={{ 
                  fontSize: 11, 
                  textTransform: "uppercase", 
                  letterSpacing: 0.6,
                  fontWeight: 600,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Описание
              </Text>
              <Paragraph
                ellipsis={{ rows: 3, expandable: true, symbol: "показать больше" }}
                style={{ 
                  margin: 0,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: token.colorText,
                }}
              >
                {order.description}
              </Paragraph>
            </div>
          )}

          {/* Бюджет */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: 12,
              background: token.colorBgContainer,
              borderRadius: token.borderRadius,
              border: `1px solid ${token.colorBorder}`,
            }}
          >
            <Space size={10} style={{ width: "100%" }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: token.borderRadius,
                background: token.colorPrimary + "15",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <DollarSign size={16} style={{ color: token.colorPrimary }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text 
                  type="secondary" 
                  style={{ 
                    fontSize: 11, 
                    display: "block",
                    marginBottom: 3,
                    fontWeight: 500,
                  }}
                >
                  Бюджет
                </Text>
                <Text strong style={{ fontSize: 16, display: "block", lineHeight: 1.3 }}>
                  {formatBudget()}
                </Text>
              </div>
            </Space>
          </motion.div>

          {/* Дедлайн */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: 12,
              background: token.colorFillQuaternary || token.colorBgContainer,
              borderRadius: token.borderRadius,
              border: `1px solid ${
                isDeadlineOverdue() 
                  ? (token.colorError || token.colorBorder)
                  : isDeadlineNear()
                  ? (token.colorWarning || token.colorBorder)
                  : token.colorBorder
              }`,
            }}
          >
            <Space size={10} style={{ width: "100%" }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: token.borderRadius,
                background: (isDeadlineOverdue() ? (token.colorError || "#ff4d4f") : isDeadlineNear() ? (token.colorWarning || "#faad14") : token.colorPrimary) + "15",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <Calendar 
                  size={16} 
                  style={{ 
                    color: isDeadlineOverdue() ? (token.colorError || "#ff4d4f") : isDeadlineNear() ? (token.colorWarning || "#faad14") : token.colorPrimary
                  }} 
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text 
                  type="secondary" 
                  style={{ 
                    fontSize: 11, 
                    display: "block",
                    marginBottom: 3,
                    fontWeight: 500,
                  }}
                >
                  Дедлайн
                </Text>
                <Text 
                  strong 
                  style={{ 
                    fontSize: 16,
                    display: "block",
                    lineHeight: 1.3,
                    color: isDeadlineOverdue() ? (token.colorError || "#ff4d4f") : isDeadlineNear() ? (token.colorWarning || "#faad14") : undefined
                  }}
                >
                  {formatDeadline()}
                </Text>
                {order.deadline_at && (
                  <Text 
                    type="secondary" 
                    style={{ 
                      fontSize: 11, 
                      display: "block", 
                      marginTop: 3,
                    }}
                  >
                    {dayjs(order.deadline_at).format("D MMMM YYYY, HH:mm")}
                  </Text>
                )}
                {isDeadlineNear() && !isDeadlineOverdue() && (
                  <Tooltip title="Дедлайн скоро истечет">
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 3, 
                      marginTop: 4,
                    }}>
                      <AlertCircle size={10} style={{ color: token.colorWarning || "#faad14" }} />
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        Срочно
                      </Text>
                    </div>
                  </Tooltip>
                )}
              </div>
            </Space>
          </motion.div>

          {/* Принятое предложение */}
          {order.accepted_proposal && (
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              style={{
                padding: 12,
                background: token.colorFillQuaternary || token.colorBgContainer,
                borderRadius: token.borderRadius,
                border: `1px solid ${token.colorBorder}`,
              }}
            >
              <Space size={10} style={{ width: "100%" }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: token.borderRadius,
                  background: (token.colorSuccess || token.colorPrimary) + "15",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <TrendingUp size={16} style={{ color: token.colorSuccess || token.colorPrimary }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text 
                    type="secondary" 
                    style={{ 
                      fontSize: 11, 
                      display: "block",
                      marginBottom: 3,
                      fontWeight: 500,
                    }}
                  >
                    Согласованная сумма
                  </Text>
                  <Text strong style={{ fontSize: 16, display: "block", lineHeight: 1.3, color: token.colorSuccess || token.colorPrimary }}>
                    {order.accepted_proposal.proposed_amount?.toLocaleString() || "Не указана"} ₽
                  </Text>
                </div>
              </Space>
            </motion.div>
          )}

          {/* Требования */}
          {order.requirements && order.requirements.length > 0 && (
            <div>
              <Text 
                type="secondary" 
                style={{ 
                  fontSize: 11, 
                  textTransform: "uppercase", 
                  letterSpacing: 0.6,
                  fontWeight: 600,
                  display: "block", 
                  marginBottom: 8 
                }}
              >
                Требования
              </Text>
              <div style={{ 
                display: "flex", 
                flexWrap: "wrap", 
                gap: 6,
              }}>
                {order.requirements.map((req) => (
                  <Tag 
                    key={req.id} 
                    color="blue"
                    style={{
                      margin: 0,
                      padding: "2px 10px",
                      borderRadius: token.borderRadius,
                      fontSize: 12,
                      border: "none",
                      lineHeight: 1.4,
                    }}
                  >
                    {req.skill} <span style={{ opacity: 0.7 }}>({req.level})</span>
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {/* Вложения */}
          {order.attachments && order.attachments.length > 0 && (
            <div>
              <Text 
                type="secondary" 
                style={{ 
                  fontSize: 11, 
                  textTransform: "uppercase", 
                  letterSpacing: 0.6,
                  fontWeight: 600,
                  display: "block", 
                  marginBottom: 8 
                }}
              >
                Вложения
              </Text>
              <Space direction="vertical" size={6} style={{ width: "100%" }}>
                {order.attachments.map((att) => (
                  <div 
                    key={att.id} 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 8,
                      padding: "8px 10px",
                      background: token.colorFillQuaternary || token.colorFillTertiary,
                      borderRadius: token.borderRadius,
                      border: `1px solid ${token.colorBorder}`,
                      transition: "all 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = token.colorFillTertiary;
                      e.currentTarget.style.borderColor = token.colorPrimary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = token.colorFillQuaternary || token.colorFillTertiary;
                      e.currentTarget.style.borderColor = token.colorBorder;
                    }}
                  >
                    <FileText size={14} style={{ color: token.colorPrimary, flexShrink: 0 }} />
                    <Text 
                      ellipsis
                      style={{ 
                        fontSize: 12,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {att.media?.file_path?.split("/").pop() || "Файл"}
                    </Text>
                  </div>
                ))}
              </Space>
            </div>
          )}

          <Divider style={{ margin: "12px 0", borderColor: token.colorBorder }} />

          {/* Кнопки действий */}
          {isInProgress && (
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              {isFreelancer && (
                <Button
                  type="primary"
                  icon={<CheckCircle size={16} />}
                  block
                  onClick={handleCompleteByFreelancer}
                  loading={loading}
                  style={{
                    height: 36,
                    borderRadius: token.borderRadius,
                    fontWeight: 500,
                    fontSize: 13,
                    boxShadow: `0 2px 8px ${token.colorPrimary}25`,
                  }}
                >
                  Отметить как выполненный
                </Button>
              )}
              {isClient && (
                <Button
                  type="primary"
                  icon={<CheckCircle size={16} />}
                  block
                  onClick={handleCompleteByClient}
                  loading={loading}
                  style={{
                    height: 36,
                    borderRadius: token.borderRadius,
                    fontWeight: 500,
                    fontSize: 13,
                    boxShadow: `0 2px 8px ${token.colorPrimary}25`,
                  }}
                >
                  Завершить заказ
                </Button>
              )}
              {(isClient || isFreelancer) && (
                <Button
                  danger
                  icon={<XCircle size={16} />}
                  block
                  onClick={handleCancel}
                  loading={loading}
                  style={{
                    height: 36,
                    borderRadius: token.borderRadius,
                    fontWeight: 500,
                    fontSize: 13,
                  }}
                >
                  Отменить заказ
                </Button>
              )}
            </Space>
          )}

          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ 
                textAlign: "center", 
                padding: "16px 12px", 
                background: token.colorFillQuaternary || token.colorBgContainer,
                borderRadius: token.borderRadius,
                border: `1px solid ${token.colorSuccess || token.colorBorder}`,
              }}
            >
              <CheckCircle size={24} style={{ color: token.colorSuccess || token.colorPrimary, marginBottom: 8 }} />
              <Text strong style={{ color: token.colorSuccess || token.colorPrimary, display: "block", fontSize: 14, marginBottom: 3 }}>
                Заказ выполнен
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {order.updated_at && dayjs(order.updated_at).format("D MMMM YYYY, HH:mm")}
              </Text>
            </motion.div>
          )}

          {isCancelled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ 
                textAlign: "center", 
                padding: "16px 12px", 
                background: token.colorFillQuaternary || token.colorBgContainer,
                borderRadius: token.borderRadius,
                border: `1px solid ${token.colorError || token.colorBorder}`,
              }}
            >
              <XCircle size={24} style={{ color: token.colorError || "#ff4d4f", marginBottom: 8 }} />
              <Text strong style={{ color: token.colorError || "#ff4d4f", display: "block", fontSize: 14, marginBottom: 3 }}>
                Заказ отменен
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {order.updated_at && dayjs(order.updated_at).format("D MMMM YYYY, HH:mm")}
              </Text>
            </motion.div>
          )}

          {/* Метаинформация */}
          <div style={{
            padding: "10px 12px",
            background: token.colorFillQuaternary || token.colorFillTertiary,
            borderRadius: token.borderRadius,
            border: `1px solid ${token.colorBorder}`,
          }}>
            <Text 
              type="secondary" 
              style={{ 
                fontSize: 11,
                display: "block",
                lineHeight: 1.5,
              }}
            >
              <span style={{ fontWeight: 500 }}>Создан:</span> {order.created_at ? dayjs(order.created_at).format("D MMMM YYYY, HH:mm") : "Неизвестно"}
            </Text>
            {order.updated_at && order.updated_at !== order.created_at && (
              <Text 
                type="secondary" 
                style={{ 
                  fontSize: 11, 
                  display: "block", 
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                <span style={{ fontWeight: 500 }}>Обновлен:</span> {dayjs(order.updated_at).format("D MMMM YYYY, HH:mm")}
              </Text>
            )}
          </div>
        </Space>
        </div>
      </Spin>

      {/* Complete by Freelancer Modal */}
      <Modal
        open={completeByFreelancerModalOpen}
        onOk={handleCompleteByFreelancerConfirm}
        onCancel={() => setCompleteByFreelancerModalOpen(false)}
        okText="Да, выполнен"
        cancelText="Отмена"
        title="Отметить заказ как выполненный?"
        confirmLoading={loading}
      >
        <p>Вы уверены, что выполнили все требования заказа? После подтверждения заказ будет отмечен как выполненный.</p>
      </Modal>

      {/* Complete by Client Modal */}
      <Modal
        open={completeByClientModalOpen}
        onOk={handleCompleteByClientConfirm}
        onCancel={() => setCompleteByClientModalOpen(false)}
        okText="Завершить"
        cancelText="Отмена"
        title="Завершить заказ?"
        confirmLoading={loading}
      >
        <p>Вы уверены, что хотите завершить этот заказ? Это действие нельзя отменить.</p>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        open={cancelModalOpen}
        onOk={handleCancelConfirm}
        onCancel={() => setCancelModalOpen(false)}
        okText="Отменить"
        cancelText="Нет"
        okType="danger"
        title="Отменить заказ?"
        confirmLoading={loading}
      >
        <p>Вы уверены, что хотите отменить этот заказ? Это действие нельзя отменить.</p>
      </Modal>
    </Card>
  );
}

