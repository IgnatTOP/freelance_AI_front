"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, Typography, Box, LinearProgress, Button } from "@mui/material";
import { Sparkles, CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { useTheme } from "@mui/material/styles";
import { cleanExplanationText } from "@/src/shared/lib/ai/ai-utils";

interface AISearchStatusProps {
  status: "idle" | "analyzing" | "success" | "error" | "no-results";
  orderCount?: number;
  explanation?: string;
  onClose?: () => void;
  onReset?: () => void;
}

export function AISearchStatus({
  status,
  orderCount,
  explanation,
  onClose,
  onReset,
}: AISearchStatusProps) {
  const theme = useTheme();

  // Очищаем explanation от UUID и технических деталей перед отображением
  const cleanedExplanation = explanation ? cleanExplanationText(explanation) : undefined;

  if (status === "idle") return null;

  const getContent = () => {
    switch (status) {
      case "analyzing":
        return {
          icon: <Sparkles className="w-5 h-5 text-primary animate-pulse" />,
          title: "AI анализирует ваш профиль",
          description: "Ищем подходящие заказы на основе ваших навыков и опыта...",
          color: "primary",
          showProgress: true,
        };
      case "success":
        // Определяем, показываем ли мы все заказы или только рекомендованные
        const isAllOrders = cleanedExplanation?.includes("Показаны все доступные заказы") || 
                           cleanedExplanation?.includes("AI временно недоступен");
        // Не показываем explanation, если это техническое сообщение
        const shouldShowExplanation = cleanedExplanation && !isAllOrders;
        
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
          title: isAllOrders 
            ? `Показано ${orderCount} доступных заказов`
            : `Найдено ${orderCount} подходящих заказов`,
          description: shouldShowExplanation ? undefined : (isAllOrders ? undefined : "AI подобрал заказы специально для вас"),
          color: "green",
          showProgress: false,
        };
      case "no-results":
        return {
          icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
          title: "Заказы не найдены",
          description:
            "В данный момент нет доступных заказов. Попробуйте позже или создайте свой заказ.",
          color: "yellow",
          showProgress: false,
        };
      case "error":
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          title: "Ошибка поиска",
          description: cleanedExplanation && cleanedExplanation.trim() 
            ? cleanedExplanation 
            : "Не удалось выполнить поиск. Попробуйте позже или используйте обычные фильтры.",
          color: "red",
          showProgress: false,
        };
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: 20 }}
      >
        <Card
          sx={{
            borderRadius: 1,
            borderColor:
              status === "success"
                ? theme.palette.success.main
                : status === "error"
                ? theme.palette.error.main
                : status === "no-results"
                ? theme.palette.warning.main
                : theme.palette.primary.main,
            background:
              status === "success"
                ? `linear-gradient(135deg, ${theme.palette.success.light}33 0%, ${theme.palette.success.light}22 100%)`
                : status === "error"
                ? `linear-gradient(135deg, ${theme.palette.error.light}33 0%, ${theme.palette.error.light}22 100%)`
                : status === "no-results"
                ? `linear-gradient(135deg, ${theme.palette.warning.light}33 0%, ${theme.palette.warning.light}22 100%)`
                : `linear-gradient(135deg, ${theme.palette.primary.light}33 0%, ${theme.palette.primary.light}22 100%)`,
            boxShadow: 1,
          }}
        >
          <CardContent sx={{ padding: "20px 24px" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", gap: 1.5, flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background:
                    status === "analyzing"
                      ? `${theme.palette.primary.main}15`
                      : status === "success"
                      ? `${theme.palette.success.main}15`
                      : status === "error"
                      ? `${theme.palette.error.main}15`
                      : `${theme.palette.warning.main}15`,
                }}
              >
                {content.icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: 15,
                    lineHeight: "22px",
                    fontWeight: 600,
                    display: "block",
                    marginBottom: 0.5,
                  }}
                >
                  {content.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: 13,
                    lineHeight: "20px",
                    display: "block",
                  }}
                >
                  {content.description}
                </Typography>
                {content.showProgress && (
                  <Box sx={{ marginTop: 1.5 }}>
                    <LinearProgress
                      variant="indeterminate"
                      color="primary"
                      sx={{ height: 4, borderRadius: 2 }}
                    />
                  </Box>
                )}
              </Box>
            </Box>

            {(status === "success" || status === "no-results" || status === "error") && (
              <Box sx={{ display: "flex", gap: 1 }}>
                {status === "success" && onReset && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={onReset}
                    sx={{
                      fontSize: 12,
                      minHeight: 28,
                      textTransform: "none",
                    }}
                  >
                    Сбросить
                  </Button>
                )}
                {onClose && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={onClose}
                    sx={{
                      fontSize: 12,
                      minHeight: 28,
                      minWidth: 28,
                      padding: 0,
                    }}
                  >
                    <X size={14} />
                  </Button>
                )}
              </Box>
            )}
          </Box>

          {status === "success" && cleanedExplanation && cleanedExplanation.trim() &&
           !cleanedExplanation.includes("Показаны все доступные заказы") &&
           !cleanedExplanation.includes("AI временно недоступен") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 0.2 }}
              style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${theme.palette.divider}` }}
            >
              <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                <Info size={14} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: "20px",
                    color: theme.palette.text.secondary,
                  }}
                >
                  {cleanedExplanation}
                </Typography>
              </Box>
            </motion.div>
          )}

          {status === "error" && cleanedExplanation && cleanedExplanation.trim() && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 0.2 }}
              style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${theme.palette.divider}` }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%", alignItems: "flex-start" }}>
                <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                  <AlertCircle size={14} style={{ color: theme.palette.error.main, flexShrink: 0 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: 13,
                      lineHeight: "20px",
                      color: theme.palette.error.main,
                      fontWeight: 600,
                    }}
                  >
                    Детали ошибки:
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: "20px",
                    color: theme.palette.text.secondary,
                    paddingLeft: 2.75,
                  }}
                >
                  {cleanedExplanation}
                </Typography>
              </Box>
            </motion.div>
          )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

