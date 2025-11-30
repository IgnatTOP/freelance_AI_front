"use client";

import { useState, useRef, useEffect } from "react";
import {
  Button,
  TextField,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Avatar,
  Box,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Bot, Send, Sparkles, X, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { aiService } from "@/src/shared/lib/ai";
import { useAuth } from "@/src/shared/lib/hooks";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  embedded?: boolean;
}

export function AIAssistant({ embedded = false }: AIAssistantProps) {
  const theme = useTheme();
  const { user } = useAuth({ requireAuth: false });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(embedded);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Привет! Я AI-помощник. Помогу вам с вопросами о заказах, откликах, профиле и работе на платформе. Что вас интересует?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, embedded]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      await aiService.chatAssistantStream(
        {
          message: userMessage.content,
          context_data: {
            user_role: user?.role,
          },
        },
        (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        }
      );
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: "Извините, произошла ошибка. Попробуйте еще раз." }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen && !embedded) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 60,
        }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #8b5cf6 100%)`,
            boxShadow: theme.shadows[8],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <Bot size={24} style={{ color: '#fff' }} />
          <motion.div
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#4ade80',
              border: `2px solid ${theme.palette.background.paper}`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={embedded ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      style={{
        pointerEvents: 'auto',
        width: embedded ? '100%' : 380,
        maxWidth: embedded ? '100%' : 'calc(100vw - 3rem)',
        ...(embedded ? {} : {
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 60,
        }),
      }}
    >
      <Card
        sx={{
          height: embedded ? '500px' : (isMinimized ? 'auto' : '600px'),
          maxHeight: embedded ? '500px' : (isMinimized ? 'auto' : 'calc(100vh - 8rem)'),
          display: 'flex',
          flexDirection: 'column',
          background: embedded ? 'transparent' : theme.palette.mode === 'dark' ? 'rgba(17, 26, 21, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: embedded ? 'none' : 'blur(12px)',
        }}
      >
        <CardHeader
          avatar={
            <Box sx={{ position: 'relative' }}>
              <Avatar sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.12)' : 'rgba(24, 144, 255, 0.08)', color: theme.palette.primary.main }}>
                <Bot size={20} />
              </Avatar>
              <motion.div
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: theme.palette.primary.main,
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </Box>
          }
          title={
            <Typography variant="h6" sx={{ fontSize: '16px' }}>
              AI Помощник
            </Typography>
          }
          subheader={
            <Typography variant="caption" sx={{ fontSize: '12px', opacity: 0.7 }}>
              Всегда готов помочь
            </Typography>
          }
          action={
            !embedded ? (
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? "Развернуть" : "Свернуть"}
                >
                  <Minimize2 size={14} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={14} />
                </IconButton>
              </Stack>
            ) : null
          }
        />

        {!isMinimized && (
          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0, overflow: 'hidden' }}>
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                minHeight: 0,
              }}
            >
              <Stack spacing={2}>
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent={message.role === "user" ? "flex-end" : "flex-start"}
                      >
                        {message.role === "assistant" && (
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.06)' : 'rgba(24, 144, 255, 0.04)',
                              color: theme.palette.primary.main,
                            }}
                          >
                            <Bot size={14} />
                          </Avatar>
                        )}
                        <Box
                          sx={{
                            maxWidth: '80%',
                            borderRadius: 2,
                            p: 1.5,
                            background: message.role === "user"
                              ? theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.06)' : 'rgba(24, 144, 255, 0.04)'
                              : theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.05)' : 'rgba(24, 144, 255, 0.03)',
                            border: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                            {message.content}
                          </Typography>
                        </Box>
                        {message.role === "user" && (
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.06)' : 'rgba(24, 144, 255, 0.04)',
                              color: theme.palette.primary.main,
                            }}
                          >
                            <Sparkles size={14} />
                          </Avatar>
                        )}
                      </Stack>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {loading && (
                  <Stack direction="row" spacing={1}>
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.06)' : 'rgba(24, 144, 255, 0.04)',
                        color: theme.palette.primary.main,
                      }}
                    >
                      <Bot size={14} />
                    </Avatar>
                    <Card sx={{ p: 1, background: theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.05)' : 'rgba(24, 144, 255, 0.03)' }}>
                      <CircularProgress size={16} />
                    </Card>
                  </Stack>
                )}

                <div ref={messagesEndRef} />
              </Stack>
            </Box>

            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Задайте вопрос..."
                  disabled={loading}
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  sx={{ minWidth: 40 }}
                >
                  <Send size={16} />
                </Button>
              </Stack>
            </Box>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}
