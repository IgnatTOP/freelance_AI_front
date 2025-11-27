"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Input, Spin, Typography, Card, Space, Avatar } from "antd";
import { Bot, Send, Sparkles, X, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { aiService } from "@/src/shared/lib/ai";
import { useAuth } from "@/src/shared/lib/hooks";

const { TextArea } = Input;
const { Text } = Typography;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  embedded?: boolean; // Если true, работает встроенно без floating button
}

export function AIAssistant({ embedded = false }: AIAssistantProps) {
  const { user } = useAuth({ requireAuth: false });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(embedded); // Если embedded, сразу открыт
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Инициализируем приветственное сообщение
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

    // Создаем сообщение ассистента для стриминга
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Используем стриминг для ответа AI
      await aiService.chatAssistantStream(
        {
          message: userMessage.content,
          context_data: {
            user_role: user?.role,
          },
        },
        (chunk) => {
          // Обновляем сообщение ассистента по мере получения чанков
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

  // Floating button когда закрыт (только если не embedded)
  if (!isOpen && !embedded) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-[60]"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-500 shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        >
          <Bot size={24} className="text-white" />
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background"
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
        </motion.button>
      </motion.div>
    );
  }

  // Chat panel когда открыт
  return (
    <motion.div
      initial={embedded ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={embedded ? "w-full" : "fixed bottom-6 right-6 z-[60] w-[380px] max-w-[calc(100vw-3rem)]"}
      style={{ pointerEvents: 'auto' }}
    >
      <Card
        title={
          <Space>
            <div className="relative">
              <Avatar
                icon={<Bot size={20} />}
                style={{ backgroundColor: 'var(--primary-12)', color: 'var(--primary)' }}
              />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
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
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>AI Помощник</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Всегда готов помочь</div>
            </div>
          </Space>
        }
        extra={
          !embedded ? (
            <Space>
              <Button
                type="text"
                size="small"
                icon={<Minimize2 size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
                title={isMinimized ? "Развернуть" : "Свернуть"}
              />
              <Button
                type="text"
                size="small"
                icon={<X size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              />
            </Space>
          ) : null
        }
        style={{
          height: embedded ? '500px' : (isMinimized ? 'auto' : '600px'),
          maxHeight: embedded ? '500px' : (isMinimized ? 'auto' : 'calc(100vh - 8rem)'),
          display: 'flex',
          flexDirection: 'column',
          background: embedded ? 'transparent' : 'rgba(17, 26, 21, 0.8)',
          backdropFilter: embedded ? 'none' : 'blur(12px)',
          border: embedded ? 'none' : undefined,
          boxShadow: embedded ? 'none' : undefined,
        }}
        bodyStyle={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0,
        }}
      >

        {!isMinimized && (
          <>
            {/* Messages - Scrollable Area */}
            <div 
              className="flex-1 space-y-4 p-4 overflow-y-auto overflow-x-hidden"
              style={{ 
                minHeight: 0,
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--primary-18) transparent',
              }}
              onWheel={(e) => {
                const target = e.currentTarget;
                const { scrollTop, scrollHeight, clientHeight } = target;
                const isAtTop = scrollTop <= 0;
                const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 1;
                const deltaY = e.deltaY;
                
                // Если скроллим вверх и мы вверху, или скроллим вниз и мы внизу
                if ((deltaY < 0 && isAtTop) || (deltaY > 0 && isAtBottom)) {
                  // Позволяем скроллу страницы продолжиться
                  return;
                }
                
                // Иначе останавливаем распространение события на страницу
                e.stopPropagation();
              }}
              onTouchMove={(e) => {
                // Для мобильных устройств
                e.stopPropagation();
              }}
            >
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                      marginBottom: '16px',
                    }}
                  >
                    {message.role === "assistant" && (
                      <Avatar
                        icon={<Bot size={14} />}
                        style={{ backgroundColor: 'var(--primary-06)', color: 'var(--primary)' }}
                        size={28}
                      />
                    )}
                    <div
                      style={{
                        maxWidth: '80%',
                        borderRadius: '16px',
                        padding: '8px 12px',
                        fontSize: '14px',
                        background: message.role === "user"
                          ? 'var(--primary-06)'
                          : 'var(--primary-05)',
                        border: '1px solid var(--primary-12)',
                      }}
                    >
                      <Text style={{ fontSize: '14px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {message.content}
                      </Text>
                    </div>
                    {message.role === "user" && (
                      <Avatar
                        icon={<Sparkles size={14} />}
                        style={{ backgroundColor: 'var(--primary-06)', color: 'var(--primary)' }}
                        size={28}
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <Space>
                  <Avatar
                    icon={<Bot size={14} />}
                    style={{ backgroundColor: 'var(--primary-06)', color: 'var(--primary)' }}
                    size={28}
                  />
                  <Card size="small" style={{ background: 'var(--primary-05)' }}>
                    <Spin size="small" />
                  </Card>
                </Space>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '16px', borderTop: '1px solid var(--primary-12)', display: 'flex', gap: '8px' }}>
              <TextArea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Задайте вопрос..."
                autoSize={{ minRows: 1, maxRows: 3 }}
                disabled={loading}
                style={{ resize: "none", flex: 1 }}
              />
              <Button
                type="primary"
                icon={<Send size={16} />}
                onClick={handleSend}
                disabled={!input.trim() || loading}
              />
            </div>
          </>
        )}
      </Card>
    </motion.div>
  );
}
