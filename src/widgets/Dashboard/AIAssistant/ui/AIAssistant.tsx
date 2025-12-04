"use client";

import { useState, useRef, useEffect } from "react";
import { Button, TextField, CircularProgress, Typography, Card, CardContent, CardHeader, Stack, Avatar, Box, IconButton } from "@mui/material";
import { Bot, Send, Sparkles, X, Minimize2 } from "lucide-react";
import { aiService } from "@/src/shared/lib/ai";
import { useAuth } from "@/src/shared/lib/hooks";
import { spacing, radius, iconSize } from "@/src/shared/lib/constants/design";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  embedded?: boolean;
}

const cardSx = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: `${radius.lg}px`,
};

export function AIAssistant({ embedded = false }: AIAssistantProps) {
  const { user } = useAuth({ requireAuth: false });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(embedded);
  const [isMinimized, setIsMinimized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: "Привет! Я AI-помощник. Помогу с вопросами о заказах, откликах и работе на платформе.",
      }]);
    }
  }, [isOpen, messages.length]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      await aiService.chatAssistantStream(
        { message: userMessage.content, context_data: { user_role: user?.role } },
        (chunk) => {
          setMessages((prev) => prev.map((msg) => msg.id === assistantId ? { ...msg, content: msg.content + chunk } : msg));
        }
      );
    } catch {
      setMessages((prev) => prev.map((msg) => msg.id === assistantId ? { ...msg, content: "Произошла ошибка. Попробуйте еще раз." } : msg));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !embedded) {
    return (
      <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 60 }}>
        <Box
          onClick={() => setIsOpen(true)}
          sx={{
            width: 52, height: 52, borderRadius: `${radius.full}px`, background: "var(--primary-gradient)", boxShadow: "var(--shadow-lg)",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative",
            "&:hover": { transform: "scale(1.1)" }, transition: "transform 0.2s"
          }}
        >
          <Bot size={iconSize.xl} style={{ color: "#fff" }} />
          <Box sx={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, borderRadius: `${radius.full}px`, bgcolor: "var(--success)", border: "2px solid var(--bg)" }} />
        </Box>
      </Box>
    );
  }

  const chatContent = (
    <>
      <Box ref={containerRef} sx={{ flex: 1, overflowY: "auto", p: 2, minHeight: 0 }}>
        <Stack spacing={2}>
          {messages.map((msg) => (
            <Stack key={msg.id} direction="row" spacing={1.5} justifyContent={msg.role === "user" ? "flex-end" : "flex-start"}>
              {msg.role === "assistant" && (
                <Avatar sx={{ width: 24, height: 24, bgcolor: "var(--primary-10)" }}>
                  <Bot size={iconSize.xs} style={{ color: "var(--primary)" }} />
                </Avatar>
              )}
              <Box sx={{ maxWidth: "80%", borderRadius: `${radius.md}px`, p: 1.5, bgcolor: msg.role === "user" ? "var(--primary-10)" : "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.5, fontSize: 13 }}>{msg.content}</Typography>
              </Box>
              {msg.role === "user" && (
                <Avatar sx={{ width: 24, height: 24, bgcolor: "var(--primary-10)" }}>
                  <Sparkles size={iconSize.xs} style={{ color: "var(--primary)" }} />
                </Avatar>
              )}
            </Stack>
          ))}
          {loading && (
            <Stack direction="row" spacing={1.5}>
              <Avatar sx={{ width: 24, height: 24, bgcolor: "var(--primary-10)" }}>
                <Bot size={iconSize.xs} style={{ color: "var(--primary)" }} />
              </Avatar>
              <Box sx={{ p: 1.5, bgcolor: "var(--bg-secondary)", borderRadius: `${radius.md}px` }}>
                <CircularProgress size={14} />
              </Box>
            </Stack>
          )}
        </Stack>
      </Box>

      <Box sx={{ p: 2, borderTop: "1px solid var(--border)" }}>
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            size="small"
            multiline
            maxRows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Задайте вопрос..."
            disabled={loading}
            sx={{ "& .MuiInputBase-root": { fontSize: 13 } }}
          />
          <Button variant="contained" onClick={handleSend} disabled={!input.trim() || loading} sx={{ minWidth: 36, px: 1.5 }}>
            <Send size={iconSize.sm} />
          </Button>
        </Stack>
      </Box>
    </>
  );

  if (embedded) {
    return (
      <Box sx={{ height: 400, display: "flex", flexDirection: "column" }}>
        {chatContent}
      </Box>
    );
  }

  return (
    <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 60, width: 360, maxWidth: "calc(100vw - 48px)" }}>
      <Card sx={{ ...cardSx, height: isMinimized ? "auto" : 500, maxHeight: "calc(100vh - 120px)", display: "flex", flexDirection: "column", backdropFilter: "var(--glass-blur)" }}>
        <CardHeader
          avatar={
            <Box sx={{ position: "relative" }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "var(--primary-10)" }}>
                <Bot size={iconSize.md} style={{ color: "var(--primary)" }} />
              </Avatar>
              <Box sx={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: `${radius.full}px`, bgcolor: "var(--primary)" }} />
            </Box>
          }
          title={<Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 14 }}>AI Помощник</Typography>}
          subheader={<Typography variant="caption" sx={{ color: "var(--text-muted)", fontSize: 10 }}>Всегда готов помочь</Typography>}
          action={
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={() => setIsMinimized(!isMinimized)}><Minimize2 size={iconSize.sm} /></IconButton>
              <IconButton size="small" onClick={() => setIsOpen(false)}><X size={iconSize.sm} /></IconButton>
            </Stack>
          }
          sx={{ py: 1.5, px: 2 }}
        />
        {!isMinimized && chatContent}
      </Card>
    </Box>
  );
}
