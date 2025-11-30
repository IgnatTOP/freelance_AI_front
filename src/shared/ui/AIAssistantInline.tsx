"use client";

import { useState } from "react";
import { Button, Stack, Typography, CircularProgress, Box, IconButton, useTheme } from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import { Sparkles, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIAssistantInlineProps {
  onImprove: (onChunk: (chunk: string) => void) => Promise<void>;
  onApply: (text: string) => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
}

export function AIAssistantInline({
  onImprove,
  onApply,
  disabled = false,
  size = "medium",
}: AIAssistantInlineProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [improvedText, setImprovedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const handleImprove = async () => {
    if (loading || isStreaming) return; // Защита от двойного клика
    
    setLoading(true);
    setIsStreaming(true);
    setImprovedText("");
    
    try {
      await onImprove((chunk: string) => {
        setImprovedText((prev) => prev + chunk);
      });
    } catch (error: any) {
      console.error("AI improve error:", error);
      const errorMessage = error?.message || "Ошибка при улучшении текста";
      toastService.error("Ошибка", errorMessage);
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  };

  const handleApply = () => {
    if (improvedText) {
      onApply(improvedText);
      setImprovedText("");
      toastService.success("Текст применен");
    }
  };

  const handleCancel = () => {
    setImprovedText("");
  };

  const buttonPadding = size === "small" ? "4px 8px" : size === "large" ? "4px 16px" : "4px 12px";
  const fontSize = size === "small" ? 12 : size === "large" ? 14 : 13;

  return (
    <div>
      <Button
        variant="text"
        size={size}
        startIcon={loading ? <CircularProgress size={14} /> : <Sparkles size={14} />}
        onClick={handleImprove}
        disabled={disabled || loading}
        sx={{
          color: "var(--primary)",
          padding: buttonPadding,
          height: "auto",
          fontSize: fontSize,
          textTransform: "none",
        }}
      >
        {loading ? "Генерирую..." : "Улучшить с AI"}
      </Button>

      <AnimatePresence>
        {improvedText && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: "linear-gradient(135deg, var(--primary-05) 0%, rgba(var(--primary-rgb), 0.02) 100%)",
              border: "1px solid var(--primary-15)",
              borderRadius: 8,
              padding: 16,
              marginTop: 12,
              boxShadow: "0 4px 12px var(--primary-08)",
            }}
          >
            <Stack spacing={1.5} sx={{ width: "100%" }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Sparkles size={16} style={{ color: "var(--primary)" }} />
                  <Typography variant="body2" fontWeight="bold" sx={{ fontSize: 13, color: "var(--primary)" }}>
                    AI улучшил текст
                  </Typography>
                </Stack>
                <IconButton
                  size="small"
                  onClick={handleCancel}
                  sx={{ padding: 0, width: 20, height: 20 }}
                >
                  <X size={12} />
                </IconButton>
              </Box>

              <Box
                sx={{
                  background: theme.palette.background.paper,
                  borderRadius: "6px",
                  padding: "12px",
                  border: `1px solid ${theme.palette.divider}`,
                  maxHeight: 200,
                  overflowY: "auto",
                  boxShadow: theme.shadows[1],
                }}
              >
                <Typography
                  sx={{
                    whiteSpace: "pre-wrap",
                    fontSize: 13,
                    lineHeight: "20px",
                    color: theme.palette.text.primary,
                    display: "block",
                  }}
                >
                  {improvedText}
                  {isStreaming && (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      style={{ color: "var(--primary)", marginLeft: 2 }}
                    >
                      ▊
                    </motion.span>
                  )}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} sx={{ width: "100%", justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  onClick={handleCancel}
                  sx={{ fontSize: 12, textTransform: "none" }}
                >
                  Отмена
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Check size={12} />}
                  onClick={handleApply}
                  sx={{
                    background: "var(--primary)",
                    fontSize: 12,
                    textTransform: "none",
                    "&:hover": {
                      background: "var(--primary-dark)",
                    },
                  }}
                >
                  Применить
                </Button>
              </Stack>
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

