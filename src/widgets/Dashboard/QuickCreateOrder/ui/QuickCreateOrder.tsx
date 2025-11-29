"use client";

import { useState } from "react";
import { Card, CardContent, Button, TextField, Dialog, DialogTitle, DialogContent, Typography, CircularProgress, Stack, Box, Alert, Divider, useTheme } from "@mui/material";
import { Sparkles, Wand2, X, Check, Bot, ArrowRight, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { aiService } from "@/src/shared/lib/ai";
import { useRouter } from "next/navigation";

interface QuickCreateOrderProps {
  userRole: "client" | "freelancer" | null;
}

export function QuickCreateOrder({ userRole }: QuickCreateOrderProps) {
  const router = useRouter();
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);

  const handleGenerate = async () => {
    if (!title.trim()) return;

    setStreaming(true);
    setAiDescription("");

    let fullDescription = "";

    try {
      await aiService.generateOrderDescriptionStream(
        {
          title: title.trim(),
          description: description.trim() || "Создайте подробное описание проекта",
          skills: [],
        },
        (chunk) => {
          fullDescription += chunk;
          setAiDescription((prev) => prev + chunk);
        }
      );
      
      // После завершения генерации автоматически перенаправляем на полную форму
      const finalDescription = fullDescription.trim() || description.trim();
      const params = new URLSearchParams({
        ai: "true",
        title: title.trim(),
      });
      if (finalDescription) {
        params.append("description", finalDescription);
      }
      
      // Небольшая задержка для показа финального результата пользователю
      setTimeout(() => {
        router.push(`/orders/create?${params.toString()}`);
        handleReset();
      }, 500);
    } catch (error) {
      console.error("Error generating description:", error);
      setStreaming(false);
      // Ошибка обрабатывается, пользователь может повторить попытку
    }
  };

  const handleUseAI = () => {
    // Эта функция больше не нужна, так как переход происходит автоматически
    handleCreateWithAI();
  };

  if (userRole !== "client") return null;

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setAiDescription("");
    setIsOpen(false);
  };

  const handleCreateWithAI = () => {
    if (!title.trim()) return;
    // Если есть сгенерированное описание, используем его
    const finalDescription = aiDescription.trim() || description.trim();
    const params = new URLSearchParams({
      ai: "true",
      title: title.trim(),
    });
    if (finalDescription) {
      params.append("description", finalDescription);
    }
    router.push(`/orders/create?${params.toString()}`);
    handleReset();
  };

  return (
    <>
      {/* Компактная карточка-триггер */}
      <Card
        onClick={() => setIsOpen(true)}
        sx={{
          minWidth: 160,
          bgcolor: 'var(--primary-08)',
          borderColor: 'var(--primary-25)',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 2,
          }
        }}
      >
        <CardContent>
          <Stack spacing={1.5} alignItems="center" textAlign="center">
            <div className="relative">
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: 1.25,
                background: 'linear-gradient(135deg, var(--primary-12) 0%, rgba(139, 92, 246, 0.12) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sparkles size={18} style={{ color: 'var(--primary)' }} />
              </Box>
              <motion.div
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full"
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
            </div>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                Быстрое создание
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Название → AI описание
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Модальное окно */}
      <Dialog
        open={isOpen}
        onClose={handleReset}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            <span>Быстрое создание заказа</span>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Название */}
            <TextField
              label="Название заказа"
              placeholder="Например: Разработка веб-приложения"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && title.trim() && !streaming) {
                  handleGenerate();
                }
              }}
              helperText="Укажите краткое название вашего проекта"
              required
              fullWidth
              InputProps={{
                startAdornment: <FileText size={16} style={{ marginRight: 8 }} />,
              }}
            />

            {/* Кнопка генерации */}
            <Button
              variant="contained"
              startIcon={streaming ? <CircularProgress size={16} /> : <Wand2 size={16} />}
              onClick={handleGenerate}
              disabled={!title.trim() || streaming}
              fullWidth
              size="large"
            >
              {streaming ? 'Генерирую описание...' : 'Сгенерировать описание с AI'}
            </Button>

            {/* Сгенерированное описание */}
            <AnimatePresence>
              {(aiDescription || streaming) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert
                    severity="success"
                    icon={<Bot size={16} style={{ color: 'var(--primary)' }} />}
                    sx={{
                      bgcolor: 'var(--primary-08)',
                      borderColor: 'var(--primary-25)',
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {streaming ? 'Генерирую описание...' : 'Описание готово'}
                    </Typography>
                    <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                      {streaming && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <CircularProgress size={16} />
                          <Typography variant="body2" color="text.secondary">
                            AI создает подробное описание заказа...
                          </Typography>
                        </Box>
                      )}
                      {aiDescription && (
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.6,
                            color: 'rgba(255, 255, 255, 0.85)',
                          }}
                        >
                          {aiDescription}
                          {streaming && (
                            <motion.span
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              ▋
                            </motion.span>
                          )}
                        </Typography>
                      )}
                      {!streaming && aiDescription && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Check size={16} style={{ color: 'var(--primary)' }} />
                          <Typography variant="caption" color="text.secondary">
                            Перенаправление на форму создания заказа...
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Опциональное поле для ручного описания */}
            {!aiDescription && !streaming && (
              <TextField
                label="Или опишите вручную (опционально)"
                placeholder="Опишите основные требования к проекту..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                helperText="Можете добавить дополнительные детали, которые AI учтет при генерации"
                multiline
                rows={3}
                fullWidth
                inputProps={{ maxLength: 500 }}
              />
            )}

            {!streaming && !aiDescription && (
              <Divider sx={{ my: 2 }} />
            )}

            {/* Действия */}
            {!aiDescription && !streaming && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={handleReset}>
                  Отмена
                </Button>
                <Button
                  variant="contained"
                  endIcon={<ArrowRight size={16} />}
                  onClick={handleCreateWithAI}
                  disabled={!title.trim()}
                  size="large"
                >
                  Перейти к созданию заказа
                </Button>
              </Box>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

