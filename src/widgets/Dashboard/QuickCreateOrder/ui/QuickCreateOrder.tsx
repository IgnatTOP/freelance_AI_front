"use client";

import { useState } from "react";
import { Card, CardContent, Button, TextField, Dialog, DialogTitle, DialogContent, Typography, CircularProgress, Stack, Box, Alert, Divider } from "@mui/material";
import { Sparkles, Wand2, Bot, ArrowRight, FileText, Check } from "lucide-react";
import { aiService } from "@/src/shared/lib/ai";
import { useRouter } from "next/navigation";

interface QuickCreateOrderProps {
  userRole: "client" | "freelancer" | null;
}

export function QuickCreateOrder({ userRole }: QuickCreateOrderProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [streaming, setStreaming] = useState(false);

  if (userRole !== "client") return null;

  const handleGenerate = async () => {
    if (!title.trim()) return;

    setStreaming(true);
    setAiDescription("");
    let fullDescription = "";

    try {
      await aiService.generateOrderDescriptionStream(
        { title: title.trim(), description: description.trim() || "Создайте подробное описание", skills: [] },
        (chunk) => {
          fullDescription += chunk;
          setAiDescription((prev) => prev + chunk);
        }
      );

      setTimeout(() => {
        const params = new URLSearchParams({ ai: "true", title: title.trim() });
        if (fullDescription.trim()) params.append("description", fullDescription.trim());
        router.push(`/orders/create?${params.toString()}`);
        handleReset();
      }, 500);
    } catch {
      setStreaming(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setAiDescription("");
    setIsOpen(false);
    setStreaming(false);
  };

  const handleCreateManual = () => {
    const params = new URLSearchParams({ ai: "true", title: title.trim() });
    if (description.trim()) params.append("description", description.trim());
    router.push(`/orders/create?${params.toString()}`);
    handleReset();
  };

  return (
    <>
      <Card onClick={() => setIsOpen(true)} sx={{ minWidth: 140, cursor: "pointer", bgcolor: "var(--primary-10)", border: "1px solid var(--primary-30)", "&:hover": { boxShadow: "var(--shadow-md)" } }}>
        <CardContent sx={{ p: 1.5 }}>
          <Stack spacing={1} alignItems="center" textAlign="center">
            <Box sx={{ position: "relative" }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 1, background: "linear-gradient(135deg, var(--primary-15) 0%, rgba(139,92,246,0.15) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={16} style={{ color: "var(--primary)" }} />
              </Box>
              <Box sx={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", bgcolor: "var(--primary)" }} />
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={600}>Быстрое создание</Typography>
              <Typography variant="caption" sx={{ color: "var(--foreground-muted)", fontSize: 10, display: "block" }}>Название → AI</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onClose={handleReset} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Sparkles size={18} style={{ color: "var(--primary)" }} />
            <span>Быстрое создание заказа</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Название заказа"
              placeholder="Например: Разработка веб-приложения"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && title.trim() && !streaming && handleGenerate()}
              helperText="Краткое название проекта"
              required
              fullWidth
              InputProps={{ startAdornment: <FileText size={16} style={{ marginRight: 8, color: "var(--foreground-muted)" }} /> }}
            />

            <Button variant="contained" startIcon={streaming ? <CircularProgress size={16} /> : <Wand2 size={16} />} onClick={handleGenerate} disabled={!title.trim() || streaming} fullWidth size="large">
              {streaming ? "Генерирую описание..." : "Сгенерировать с AI"}
            </Button>

            {(aiDescription || streaming) && (
              <Alert severity="success" icon={<Bot size={16} style={{ color: "var(--primary)" }} />} sx={{ bgcolor: "var(--primary-05)", borderColor: "var(--primary-15)" }}>
                <Typography variant="body2" fontWeight={600}>{streaming ? "Генерирую..." : "Описание готово"}</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {streaming && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={14} />
                      <Typography variant="caption" sx={{ color: "var(--foreground-muted)" }}>AI создает описание...</Typography>
                    </Stack>
                  )}
                  {aiDescription && (
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                      {aiDescription}
                      {streaming && <span style={{ animation: "blink 1s infinite" }}>▋</span>}
                    </Typography>
                  )}
                  {!streaming && aiDescription && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Check size={14} style={{ color: "var(--primary)" }} />
                      <Typography variant="caption" sx={{ color: "var(--foreground-muted)" }}>Перенаправление...</Typography>
                    </Stack>
                  )}
                </Stack>
              </Alert>
            )}

            {!aiDescription && !streaming && (
              <>
                <TextField
                  label="Или опишите вручную (опционально)"
                  placeholder="Основные требования..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  helperText="Дополнительные детали для AI"
                  multiline
                  rows={3}
                  fullWidth
                  inputProps={{ maxLength: 500 }}
                />
                <Divider />
                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                  <Button onClick={handleReset}>Отмена</Button>
                  <Button variant="contained" endIcon={<ArrowRight size={16} />} onClick={handleCreateManual} disabled={!title.trim()}>
                    Перейти к созданию
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
