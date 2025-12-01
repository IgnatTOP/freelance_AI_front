"use client";
import { toastService } from "@/src/shared/lib/toast";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Card,
  Typography,
  TextField,
  Avatar,
  CircularProgress,
  Badge,
  Tooltip,
  IconButton,
  Button,
  Stack,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";
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

export default function ChatPage() {
  const theme = useTheme();
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
      <Box sx={{ height: "100vh", background: "transparent", overflow: "hidden" }}>
        <Box sx={{ height: "100vh", overflow: "hidden", padding: 0 }}>
          <Box
            sx={{
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <Card
              sx={{
                borderRadius: 2,
                background: theme.palette.background.paper,
                p: 5,
              }}
            >
              <CircularProgress size={60} />
            </Card>
          </Box>
        </Box>
      </Box>
    );
  }

  if (!conversation) {
    return (
      <Box sx={{ height: "100vh", background: "transparent", overflow: "hidden" }}>
        <Box sx={{ height: "100vh", overflow: "hidden", padding: 0 }}>
          <Box
            sx={{
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <Card
              sx={{
                borderRadius: 2,
                background: theme.palette.background.paper,
                p: 5,
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Чат не найден
                </Typography>
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
    );
  }

  const otherUser = conversation.other_user;
  const order = conversation.order;
  const freelancer = conversation.freelancer;
  
  const avatarUrl = otherUser?.photo_url 
    ? getMediaUrl(otherUser.photo_url) 
    : null;

  return (
    <Box sx={{ height: "80vh", maxHeight: "80vh", background: "transparent", overflow: "hidden" }}>
      <Box sx={{ height: "80vh", maxHeight: "80vh", overflow: "hidden", padding: 0 }}>
        <Grid container spacing={2.5} sx={{ height: "80vh", maxHeight: "80vh", maxWidth: 1400, margin: "0 auto", padding: "8px", overflow: "hidden" }}>
          {/* Чат */}
          <Grid size={{ xs: 12, lg: 5, xl: 5 }} sx={{ display: "flex", flexDirection: "column", height: "100%", maxHeight: "100%" }}>
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
                borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 2 : 16,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[8],
                backdropFilter: "blur(10px)",
              }}
            >
              {/* Заголовок чата */}
              <Box
                sx={{
                  padding: "12px 16px",
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                  borderRadius: `${typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 2 : 16}px ${typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 2 : 16}px 0 0`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Декоративный градиент */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}40, transparent)`,
                  }}
                />

                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexWrap: "nowrap" }}>
                  <Box sx={{ flexShrink: 0 }}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <IconButton
                        onClick={() => router.push("/messages")}
                        sx={{
                          width: 36,
                          height: 36,
                          transition: "all 0.2s",
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                            color: theme.palette.primary.main,
                          },
                        }}
                      >
                        <ArrowLeft size={18} />
                      </IconButton>
                    </motion.div>
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1.5} sx={{ width: "100%" }}>
                      <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                        <Avatar
                          src={avatarUrl || undefined}
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: `${theme.palette.primary.main}20`,
                            color: theme.palette.primary.main,
                            border: `2px solid ${theme.palette.primary.main}30`,
                            flexShrink: 0,
                            boxShadow: `0 2px 8px ${theme.palette.primary.main}15`,
                          }}
                        >
                          {otherUser?.display_name?.charAt(0).toUpperCase() || <User size={20} />}
                        </Avatar>
                      </motion.div>
                      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontSize: 16,
                              lineHeight: 1.3,
                              fontWeight: 600,
                              color: theme.palette.text.primary,
                            }}
                          >
                            {otherUser?.display_name || "Пользователь"}
                          </Typography>
                          <Tooltip title={isConnected ? "Подключено" : "Переподключение..."}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              {isConnected ? (
                                <Wifi size={14} style={{ color: theme.palette.success.main }} />
                              ) : (
                                <WifiOff size={14} style={{ color: theme.palette.error.main }} />
                              )}
                              <Badge
                                color={isConnected ? "success" : "error"}
                                variant="dot"
                                sx={{ ml: 0 }}
                              />
                            </Box>
                          </Tooltip>
                        </Box>
                        {order && (
                          <motion.div
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Stack
                              direction="row"
                              spacing={0.75}
                              sx={{
                                flexWrap: "wrap",
                                cursor: "pointer",
                                alignItems: "center",
                              }}
                              onClick={() => router.push(`/orders/${order.id}`)}
                            >
                              <Briefcase
                                size={12}
                                style={{
                                  color: theme.palette.text.secondary,
                                  flexShrink: 0,
                                  transition: "color 0.2s",
                                }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                noWrap
                                sx={{
                                  fontSize: 12,
                                  transition: "color 0.2s",
                                  maxWidth: "100%",
                                  lineHeight: 1.4,
                                  fontWeight: 500,
                                  "&:hover": {
                                    color: theme.palette.primary.main,
                                  },
                                }}
                              >
                                {order.title}
                              </Typography>
                            </Stack>
                          </motion.div>
                        )}
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              {/* Область сообщений */}
              <Box
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="chat-messages-container"
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  padding: "16px 16px 12px 16px",
                  scrollBehavior: "smooth",
                  background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
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
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.primary.main}10)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `2px solid ${theme.palette.primary.main}30`,
                      }}
                    >
                      <User size={36} style={{ color: theme.palette.primary.main, opacity: 0.6 }} />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: 14,
                        textAlign: "center",
                        maxWidth: 280,
                        lineHeight: 1.6,
                      }}
                    >
                      Начните общение с <strong>{otherUser?.display_name || "пользователем"}</strong>
                    </Typography>
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
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: "50%",
                                  left: 0,
                                  right: 0,
                                  height: "1px",
                                  background: `linear-gradient(90deg, transparent, ${theme.palette.divider}, transparent)`,
                                }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontSize: 11,
                                  padding: "6px 14px",
                                  background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
                                  borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 2 : 16,
                                  display: "inline-block",
                                  border: `1px solid ${theme.palette.divider}`,
                                  fontWeight: 600,
                                  letterSpacing: 0.5,
                                  textTransform: "uppercase",
                                  position: "relative",
                                  boxShadow: theme.shadows[2],
                                }}
                              >
                                {formatDate(item.date!)}
                              </Typography>
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
                                    src={avatarUrl || undefined}
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      bgcolor: `${theme.palette.primary.main}20`,
                                      color: theme.palette.primary.main,
                                      flexShrink: 0,
                                      border: `2px solid ${theme.palette.primary.main}30`,
                                      boxShadow: `0 2px 6px ${theme.palette.primary.main}15`,
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
                                <Box
                                  sx={{
                                    borderRadius: isMine
                                      ? "18px 18px 6px 18px"
                                      : "18px 18px 18px 6px",
                                    background: isMine
                                      ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                                      : `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
                                    border: isMine
                                      ? "none"
                                      : `1px solid ${theme.palette.divider}`,
                                    padding: "12px 16px",
                                    boxShadow: isMine
                                      ? `0 4px 12px ${theme.palette.primary.main}30, 0 2px 4px ${theme.palette.primary.main}15`
                                      : theme.shadows[2],
                                    transition: "all 0.2s",
                                    position: "relative",
                                    backdropFilter: "blur(10px)",
                                    "&:hover": {
                                      boxShadow: isMine
                                        ? `0 6px 16px ${theme.palette.primary.main}40, 0 3px 6px ${theme.palette.primary.main}20`
                                        : theme.shadows[4],
                                      transform: "translateY(-1px)",
                                    },
                                  }}
                                >
                                  <div style={{ width: "100%" }}>
                                    <Typography
                                      sx={{
                                        fontSize: 14,
                                        lineHeight: 1.6,
                                        color: isMine ? "#ffffff" : theme.palette.text.primary,
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                        display: "block",
                                        fontWeight: 400,
                                        letterSpacing: "0.01em",
                                      }}
                                    >
                                      {msg.content}
                                    </Typography>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: isMine ? "flex-end" : "flex-start",
                                        gap: 6,
                                        marginTop: 6,
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          fontSize: 10,
                                          color: isMine ? "rgba(255,255,255,0.7)" : theme.palette.text.secondary,
                                          lineHeight: 1,
                                          fontWeight: 500,
                                          letterSpacing: "0.02em",
                                        }}
                                      >
                                        {formatTime(msg.created_at)}
                                      </Typography>
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
                                </Box>
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
                        variant="contained"
                        size="small"
                        startIcon={<ChevronDown size={16} />}
                        onClick={() => {
                          scrollToBottom();
                          setIsAtBottom(true);
                        }}
                        sx={{
                          pointerEvents: "auto",
                          boxShadow: `0 4px 12px ${theme.palette.primary.main}40, 0 2px 4px ${theme.palette.primary.main}20`,
                          width: 40,
                          height: 40,
                          minWidth: 40,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                        }}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </Box>

              {/* Область ввода */}
              <div
                style={{
                  padding: "12px 16px",
                  borderTop: `1px solid ${theme.palette.divider}`,
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                  borderRadius: `0 0 ${typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 3 : 24}px ${typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 3 : 24}px`,
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
                      background: `${theme.palette.warning.main}15`,
                      border: `1px solid ${theme.palette.warning.main}30`,
                      borderRadius: theme.shape.borderRadius,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <WifiOff size={14} style={{ color: theme.palette.warning.main }} />
                    <Typography sx={{ fontSize: 11, color: theme.palette.warning.main }}>
                      Ожидание подключения...
                    </Typography>
                  </motion.div>
                )}
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <TextField
                      placeholder="Напишите сообщение..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      disabled={sending || !isConnected}
                      multiline
                      minRows={1}
                      maxRows={4}
                      sx={{
                        borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 1.5 : 12,
                        fontSize: 14,
                        lineHeight: 1.5,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 1.5 : 12,
                          backgroundColor: theme.palette.background.default,
                          transition: "all 0.2s",
                          '& fieldset': {
                            borderColor: theme.palette.divider,
                          },
                          '&:hover fieldset': {
                            borderColor: theme.palette.divider,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                            boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
                          },
                        },
                        '& .MuiInputBase-input': {
                          padding: "12px 16px",
                          fontSize: 14,
                          lineHeight: 1.5,
                          resize: "none",
                        },
                      }}
                    />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />}
                      disabled={!messageText.trim() || sending || !isConnected}
                      onClick={() => handleSend()}
                      sx={{
                        height: 44,
                        width: 44,
                        minWidth: 44,
                        padding: 0,
                        borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 1.5 : 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: messageText.trim() && !sending && isConnected 
                          ? `0 4px 12px ${theme.palette.primary.main}40, 0 2px 4px ${theme.palette.primary.main}20`
                          : undefined,
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </Grid>
          
          {/* Сайдбар с информацией о заказе */}
          <Grid size={{ xs: 12, lg: 7, xl: 7 }} sx={{ display: "flex", flexDirection: "column", height: "100%", maxHeight: "100%" }}>
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
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
