"use client";
import { toastService } from "@/src/shared/lib/toast";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Layout,
  Card,
  Typography,
  Space,
  Button,
  Input,
  Avatar,
  Spin,
  Empty,
  theme,
  message,
  Row,
  Col,
  Badge,
  Tooltip,
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, User, Briefcase, CheckCheck, ChevronDown, Wifi, WifiOff } from "lucide-react";
import { OrderInfoSidebar } from "./OrderInfoSidebar";
import { getMessages, sendMessage } from "@/src/shared/api/conversations";
import { markOrderAsCompletedByFreelancer, updateOrder } from "@/src/shared/api/orders";
import { useAuth } from "@/src/shared/lib/hooks";
import { websocketService } from "@/src/shared/lib/notifications/websocket.service";
import type { Message, MessagesResponse, Conversation } from "@/src/entities/conversation/model/types";
import { getMediaUrl } from "@/src/shared/lib/api/axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";

dayjs.extend(relativeTime);
dayjs.locale("ru");

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { useToken } = theme;

export default function ChatPage() {
  const { token } = useToken();
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageText, setMessageText] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState<MessagesResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const currentUserId = user?.id ? String(user.id) : null;
  const [isConnected, setIsConnected] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  // Проверка, находится ли пользователь внизу чата
  const checkIfAtBottom = useCallback(() => {
    if (!messagesContainerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const threshold = 150;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);

  // Обработчик скролла
  const handleScroll = useCallback(() => {
    const atBottom = checkIfAtBottom();
    setIsAtBottom(atBottom);
    shouldAutoScrollRef.current = atBottom;
  }, [checkIfAtBottom]);

  useEffect(() => {
    if (!user?.id) return;
    
    // Подключаемся к WebSocket
    const connectWebSocket = async () => {
      try {
        await websocketService.connect();
        setIsConnected(true);
      } catch (error) {
        // Silently handle connection errors - they're expected if backend is down
        setIsConnected(false);
      }
    };

    connectWebSocket();
    loadMessages();

    // Подписываемся на события WebSocket
    const unsubscribeChat = websocketService.on("chat.message", (wsMessage) => {
      const chatData = wsMessage.data;
      if (chatData?.conversation?.id === conversationId) {
        const newMessage = chatData.message;
        if (newMessage) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
          
          if (shouldAutoScrollRef.current) {
            setTimeout(() => scrollToBottom(), 100);
          }
        }
      }
    });

    // Подписываемся на обновления заказов (завершение, отмена и т.д.)
    const unsubscribeOrders = websocketService.on("orders.updated", (wsMessage) => {
      const data = wsMessage.data;
      
      // Если заказ относится к текущему чату, перезагружаем данные
      if (data.order) {
        // Проверяем через загруженный conversation или просто перезагружаем
        // (событие приходит только для заказов, связанных с текущим пользователем)
        loadMessages();
      }
    });

    const unsubscribeConnection = websocketService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    return () => {
      unsubscribeChat();
      unsubscribeOrders();
      unsubscribeConnection();
    };
  }, [conversationId, user?.id]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await getMessages(conversationId);
      setConversation(data);
      setMessages(data.messages || []);
      scrollToBottom();
    } catch (error: any) {
      console.error("Error loading messages:", error);
      toastService.error(error.response?.data?.error || "Ошибка загрузки сообщений");
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }, []);

  const handleSend = async (value?: string) => {
    const text = value || messageText;
    if (!text.trim() || sending) return;

    // Валидация длины сообщения (синхронизировано с бекендом)
    const trimmedText = text.trim();
    if (trimmedText.length < 1) {
      toastService.warning("Сообщение не может быть пустым");
      return;
    }
    if (trimmedText.length > 5000) {
      toastService.warning("Сообщение не может быть длиннее 5000 символов");
      return;
    }

    setSending(true);
    try {
      const response = await sendMessage(conversationId, {
        content: trimmedText,
      });

      setMessages((prev) => [...prev, response.message]);
      setMessageText("");
      scrollToBottom();
    } catch (error: any) {
      console.error("Error sending message:", error);
      toastService.error(error.response?.data?.error || "Ошибка отправки сообщения");
    } finally {
      setSending(false);
    }
  };

  const isMyMessage = (message: Message) => {
    if (!currentUserId) return false;
    return (
      (message.author_type === "client" || message.author_type === "freelancer") &&
      message.author_id === currentUserId
    );
  };

  const formatTime = (dateString: string) => {
    return dayjs(dateString).format("HH:mm");
  };

  const formatDate = (dateString: string) => {
    const date = dayjs(dateString);
    const now = dayjs();
    if (date.isSame(now, "day")) return "Сегодня";
    if (date.isSame(now.subtract(1, "day"), "day")) return "Вчера";
    return date.format("D MMMM YYYY");
  };

  const groupedMessages = messages.reduce((acc, msg, index) => {
    const prevMsg = index > 0 ? messages[index - 1] : null;
    const msgDate = dayjs(msg.created_at);
    const prevDate = prevMsg ? dayjs(prevMsg.created_at) : null;

    if (!prevDate || !msgDate.isSame(prevDate, "day")) {
      acc.push({ type: "date", date: msg.created_at });
    }

    acc.push({ type: "message", message: msg });
    return acc;
  }, [] as Array<{ type: "date" | "message"; date?: string; message?: Message }>);

  if (loading) {
    return (
      <Layout style={{ height: "100vh", background: "transparent", overflow: "hidden" }}>
        <Content style={{ height: "100vh", overflow: "hidden", padding: 0 }}>
          <div
            style={{
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <Card
              style={{
                borderRadius: token.borderRadiusLG,
                borderColor: token.colorBorder,
                background: token.colorBgContainer,
              }}
            >
              <Spin size="large" style={{ display: "block", textAlign: "center", padding: 40 }} />
            </Card>
          </div>
        </Content>
      </Layout>
    );
  }

  if (!conversation) {
    return (
      <Layout style={{ height: "100vh", background: "transparent", overflow: "hidden" }}>
        <Content style={{ height: "100vh", overflow: "hidden", padding: 0 }}>
          <div
            style={{
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <Card
              style={{
                borderRadius: token.borderRadiusLG,
                borderColor: token.colorBorder,
                background: token.colorBgContainer,
              }}
            >
              <Empty description="Чат не найден" />
            </Card>
          </div>
        </Content>
      </Layout>
    );
  }

  const otherUser = conversation.other_user;
  const order = conversation.order;
  const freelancer = conversation.freelancer;
  
  const avatarUrl = otherUser?.photo_url 
    ? getMediaUrl(otherUser.photo_url) 
    : null;

  return (
    <Layout style={{ height: "80vh", maxHeight: "80vh", background: "transparent", overflow: "hidden" }}>
      <Content style={{ height: "80vh", maxHeight: "80vh", overflow: "hidden", padding: 0 }}>
        <Row gutter={[20, 0]} style={{ height: "80vh", maxHeight: "80vh", maxWidth: 1400, margin: "0 auto", padding: "8px", overflow: "hidden" }}>
          {/* Чат */}
          <Col xs={24} lg={10} xl={10} style={{ display: "flex", flexDirection: "column", height: "100%", maxHeight: "100%" }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                maxHeight: "100%",
                overflow: "hidden",
                borderRadius: token.borderRadiusLG * 1.5,
                background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorBgElevated} 100%)`,
                border: `1px solid ${token.colorBorder}`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)`,
                backdropFilter: "blur(10px)",
              }}
            >
              {/* Заголовок чата */}
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: `1px solid ${token.colorBorder}`,
                  background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorBgElevated} 100%)`,
                  borderRadius: `${token.borderRadiusLG * 1.5}px ${token.borderRadiusLG * 1.5}px 0 0`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Декоративный градиент */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: `linear-gradient(90deg, transparent, ${token.colorPrimary}40, transparent)`,
                  }}
                />
                
                <Row align="middle" gutter={[12, 0]} wrap={false}>
                  <Col flex="none">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        type="text"
                        icon={<ArrowLeft size={18} />}
                        onClick={() => router.push("/messages")}
                        style={{ 
                          padding: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: token.borderRadius,
                          transition: "all 0.2s",
                          width: 36,
                          height: 36,
                          color: token.colorText,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = token.colorFillTertiary;
                          e.currentTarget.style.color = token.colorPrimary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = token.colorText;
                        }}
                      />
                    </motion.div>
                  </Col>
                  <Col flex="auto" style={{ minWidth: 0 }}>
                    <Space style={{ width: "100%" }} size={12}>
                      <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                        <Avatar
                          size={44}
                          src={avatarUrl || undefined}
                          style={{
                            backgroundColor: `${token.colorPrimary}20`,
                            color: token.colorPrimary,
                            border: `2px solid ${token.colorPrimary}30`,
                            flexShrink: 0,
                            boxShadow: `0 2px 8px ${token.colorPrimary}15`,
                          }}
                        >
                          {otherUser?.display_name?.charAt(0).toUpperCase() || <User size={20} />}
                        </Avatar>
                      </motion.div>
                      <Space direction="vertical" size={4} style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <Text 
                            strong 
                            style={{ 
                              fontSize: 16, 
                              lineHeight: 1.3, 
                              fontWeight: 600,
                              color: token.colorText,
                            }}
                          >
                            {otherUser?.display_name || "Пользователь"}
                          </Text>
                          <Tooltip title={isConnected ? "Подключено" : "Переподключение..."}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              {isConnected ? (
                                <Wifi size={14} style={{ color: token.colorSuccess || token.colorPrimary }} />
                              ) : (
                                <WifiOff size={14} style={{ color: token.colorError || "#ff4d4f" }} />
                              )}
                              <Badge 
                                status={isConnected ? "success" : "error"}
                                style={{ marginLeft: 0 }}
                              />
                            </div>
                          </Tooltip>
                        </div>
                        {order && (
                          <motion.div
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Space 
                              size={6} 
                              style={{ 
                                flexWrap: "wrap",
                                cursor: "pointer",
                              }}
                              onClick={() => router.push(`/orders/${order.id}`)}
                            >
                              <Briefcase 
                                size={12} 
                                style={{ 
                                  color: token.colorTextTertiary, 
                                  flexShrink: 0,
                                  transition: "color 0.2s",
                                }} 
                              />
                              <Text 
                                type="secondary" 
                                ellipsis
                                style={{ 
                                  fontSize: 12, 
                                  transition: "color 0.2s",
                                  maxWidth: "100%",
                                  lineHeight: 1.4,
                                  fontWeight: 500,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = token.colorPrimary;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = token.colorTextSecondary;
                                }}
                              >
                                {order.title}
                              </Text>
                            </Space>
                          </motion.div>
                        )}
                      </Space>
                    </Space>
                  </Col>
                </Row>
              </div>

              {/* Область сообщений */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="chat-messages-container"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  padding: "16px 16px 12px 16px",
                  scrollBehavior: "smooth",
                  background: `linear-gradient(180deg, ${token.colorBgElevated} 0%, ${token.colorBgContainer} 100%)`,
                  position: "relative",
                }}
              >

                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      height: "100%",
                      minHeight: "300px",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${token.colorPrimary}20, ${token.colorPrimary}10)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `2px solid ${token.colorPrimary}30`,
                      }}
                    >
                      <User size={36} style={{ color: token.colorPrimary, opacity: 0.6 }} />
                    </div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 14,
                        textAlign: "center",
                        maxWidth: 280,
                        lineHeight: 1.6,
                      }}
                    >
                      Начните общение с <strong>{otherUser?.display_name || "пользователем"}</strong>
                    </Text>
                  </motion.div>
                ) : (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4 }}>
                    <AnimatePresence>
                      {groupedMessages.map((item, index) => {
                        if (item.type === "date") {
                          return (
                            <motion.div
                              key={`date-${item.date}`}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              style={{
                                textAlign: "center",
                                margin: "24px 0 16px 0",
                                position: "relative",
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  top: "50%",
                                  left: 0,
                                  right: 0,
                                  height: "1px",
                                  background: `linear-gradient(90deg, transparent, ${token.colorBorder}, transparent)`,
                                }}
                              />
                              <Text
                                type="secondary"
                                style={{
                                  fontSize: 11,
                                  padding: "6px 14px",
                                  background: `linear-gradient(135deg, ${token.colorBgContainer}, ${token.colorBgElevated})`,
                                  borderRadius: token.borderRadius * 2,
                                  display: "inline-block",
                                  border: `1px solid ${token.colorBorder}`,
                                  fontWeight: 600,
                                  letterSpacing: 0.5,
                                  textTransform: "uppercase",
                                  position: "relative",
                                  boxShadow: `0 2px 8px rgba(0,0,0,0.08)`,
                                }}
                              >
                                {formatDate(item.date!)}
                              </Text>
                            </motion.div>
                          );
                        }

                        const msg = item.message!;
                        const isMine = isMyMessage(msg);
                        const prevMsg = index > 0 && groupedMessages[index - 1]?.type === "message" 
                          ? groupedMessages[index - 1].message 
                          : null;
                        const nextMsg = index < groupedMessages.length - 1 && groupedMessages[index + 1]?.type === "message"
                          ? groupedMessages[index + 1].message
                          : null;
                        const showAvatar = !isMine && (!prevMsg || prevMsg.author_id !== msg.author_id || 
                          dayjs(msg.created_at).diff(dayjs(prevMsg.created_at), "minute") > 5);
                        const isLastInGroup = !nextMsg || nextMsg.author_id !== msg.author_id ||
                          dayjs(nextMsg.created_at).diff(dayjs(msg.created_at), "minute") > 5;

                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                            style={{
                              display: "flex",
                              justifyContent: isMine ? "flex-end" : "flex-start",
                              width: "100%",
                              marginBottom: isLastInGroup ? "12px" : "4px",
                            }}
                          >
                            <div
                              style={{ 
                                display: "flex",
                                flexDirection: isMine ? "row-reverse" : "row",
                                gap: 10,
                                maxWidth: "75%",
                                minWidth: "100px",
                                alignItems: "flex-end",
                              }}
                            >
                              {showAvatar && !isMine && (
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Avatar
                                    size={32}
                                    src={avatarUrl || undefined}
                                    style={{
                                      backgroundColor: `${token.colorPrimary}20`,
                                      color: token.colorPrimary,
                                      flexShrink: 0,
                                      border: `2px solid ${token.colorPrimary}30`,
                                      boxShadow: `0 2px 6px ${token.colorPrimary}15`,
                                    }}
                                  >
                                    {otherUser?.display_name?.charAt(0).toUpperCase() || <User size={14} />}
                                  </Avatar>
                                </motion.div>
                              )}
                              {!showAvatar && !isMine && <div style={{ width: 32 }} />}
                              <motion.div
                                whileHover={{ scale: 1.01 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                  maxWidth: "100%",
                                  position: "relative",
                                }}
                              >
                                <div
                                  style={{
                                    borderRadius: isMine 
                                      ? `18px 18px 6px 18px`
                                      : `18px 18px 18px 6px`,
                                    background: isMine
                                      ? `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimary}dd)`
                                      : `linear-gradient(135deg, ${token.colorBgContainer}, ${token.colorBgElevated})`,
                                    border: isMine 
                                      ? "none" 
                                      : `1px solid ${token.colorBorder}`,
                                    padding: "12px 16px",
                                    boxShadow: isMine
                                      ? `0 4px 12px ${token.colorPrimary}30, 0 2px 4px ${token.colorPrimary}15`
                                      : `0 2px 8px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`,
                                    transition: "all 0.2s",
                                    position: "relative",
                                    backdropFilter: "blur(10px)",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (isMine) {
                                      e.currentTarget.style.boxShadow = `0 6px 16px ${token.colorPrimary}40, 0 3px 6px ${token.colorPrimary}20`;
                                      e.currentTarget.style.transform = "translateY(-1px)";
                                    } else {
                                      e.currentTarget.style.boxShadow = `0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)`;
                                      e.currentTarget.style.transform = "translateY(-1px)";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (isMine) {
                                      e.currentTarget.style.boxShadow = `0 4px 12px ${token.colorPrimary}30, 0 2px 4px ${token.colorPrimary}15`;
                                    } else {
                                      e.currentTarget.style.boxShadow = `0 2px 8px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`;
                                    }
                                    e.currentTarget.style.transform = "translateY(0)";
                                  }}
                                >
                                  <div style={{ width: "100%" }}>
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        lineHeight: 1.6,
                                        color: isMine ? "#ffffff" : token.colorText,
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                        display: "block",
                                        fontWeight: 400,
                                        letterSpacing: "0.01em",
                                      }}
                                    >
                                      {msg.content}
                                    </Text>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: isMine ? "flex-end" : "flex-start",
                                        gap: 6,
                                        marginTop: 6,
                                      }}
                                    >
                                      <Text
                                        style={{
                                          fontSize: 10,
                                          color: isMine ? "rgba(255,255,255,0.7)" : token.colorTextTertiary,
                                          lineHeight: 1,
                                          fontWeight: 500,
                                          letterSpacing: "0.02em",
                                        }}
                                      >
                                        {formatTime(msg.created_at)}
                                      </Text>
                                      {isMine && (
                                        <CheckCheck 
                                          size={11} 
                                          style={{ 
                                            color: "rgba(255,255,255,0.7)",
                                            flexShrink: 0,
                                          }} 
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} style={{ height: 4 }} />
                  </div>
                )}
                
                {/* Кнопка прокрутки вниз */}
                {!isAtBottom && messages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    style={{
                      position: "sticky",
                      bottom: 20,
                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 10,
                      display: "flex",
                      justifyContent: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="primary"
                        shape="circle"
                        size="small"
                        icon={<ChevronDown size={16} />}
                        onClick={() => {
                          scrollToBottom();
                          setIsAtBottom(true);
                        }}
                        style={{
                          pointerEvents: "auto",
                          boxShadow: `0 4px 12px ${token.colorPrimary}40, 0 2px 4px ${token.colorPrimary}20`,
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </div>

              {/* Область ввода */}
              <div
                style={{
                  padding: "12px 16px",
                  borderTop: `1px solid ${token.colorBorder}`,
                  background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorBgElevated} 100%)`,
                  borderRadius: `0 0 ${token.borderRadiusLG * 1.5}px ${token.borderRadiusLG * 1.5}px`,
                  position: "relative",
                }}
              >
                {!isConnected && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 8,
                      padding: "8px 12px",
                      background: `${token.colorWarning || "#faad14"}15`,
                      border: `1px solid ${token.colorWarning || "#faad14"}30`,
                      borderRadius: token.borderRadius,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <WifiOff size={14} style={{ color: token.colorWarning || "#faad14" }} />
                    <Text style={{ fontSize: 11, color: token.colorWarning || "#faad14" }}>
                      Ожидание подключения...
                    </Text>
                  </motion.div>
                )}
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <TextArea
                      placeholder="Напишите сообщение..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onPressEnter={(e) => {
                        if (!e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      disabled={sending || !isConnected}
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      style={{
                        borderRadius: token.borderRadius * 1.5,
                        fontSize: 14,
                        lineHeight: 1.5,
                        resize: "none",
                        border: `1px solid ${token.colorBorder}`,
                        background: token.colorBgElevated,
                        padding: "12px 16px",
                        transition: "all 0.2s",
                        boxShadow: `0 2px 4px rgba(0,0,0,0.05)`,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = token.colorPrimary;
                        e.target.style.boxShadow = `0 0 0 2px ${token.colorPrimary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = token.colorBorder;
                        e.target.style.boxShadow = `0 2px 4px rgba(0,0,0,0.05)`;
                      }}
                      rows={1}
                    />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="primary"
                      icon={<Send size={16} />}
                      loading={sending}
                      disabled={!messageText.trim() || sending || !isConnected}
                      onClick={() => handleSend()}
                      style={{
                        height: 44,
                        width: 44,
                        padding: 0,
                        borderRadius: token.borderRadius * 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: messageText.trim() && !sending && isConnected 
                          ? `0 4px 12px ${token.colorPrimary}40, 0 2px 4px ${token.colorPrimary}20`
                          : undefined,
                        fontSize: 14,
                        fontWeight: 600,
                        border: "none",
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </Col>
          
          {/* Сайдбар с информацией о заказе */}
          <Col xs={24} lg={14} xl={14} style={{ display: "flex", flexDirection: "column", height: "100%", maxHeight: "100%" }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              style={{ height: "100%", maxHeight: "100%", overflow: "hidden" }}
            >
              <OrderInfoSidebar 
                order={conversation.order} 
                conversation={conversation.conversation}
                currentUserId={currentUserId}
                onOrderUpdate={loadMessages}
              />
            </motion.div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
