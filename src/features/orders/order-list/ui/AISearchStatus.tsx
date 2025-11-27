"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, Typography, Space, Progress, Button } from "antd";
import { Sparkles, CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { theme } from "antd";
import { cleanExplanationText } from "@/src/shared/lib/ai/ai-utils";

const { Text } = Typography;
const { useToken } = theme;

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
  const { token } = useToken();

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
          style={{
            borderRadius: token.borderRadius,
            borderColor:
              status === "success"
                ? token.colorSuccess
                : status === "error"
                ? token.colorError
                : status === "no-results"
                ? token.colorWarning
                : token.colorPrimary,
            background:
              status === "success"
                ? `linear-gradient(135deg, ${token.colorSuccessBg} 0%, ${token.colorSuccessBg}dd 100%)`
                : status === "error"
                ? `linear-gradient(135deg, ${token.colorErrorBg} 0%, ${token.colorErrorBg}dd 100%)`
                : status === "no-results"
                ? `linear-gradient(135deg, ${token.colorWarningBg} 0%, ${token.colorWarningBg}dd 100%)`
                : `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimaryBg}dd 100%)`,
            boxShadow: `0 4px 12px rgba(0, 0, 0, 0.1)`,
          }}
          styles={{
            body: { padding: "20px 24px" },
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <Space size={12} style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background:
                    status === "analyzing"
                      ? `${token.colorPrimary}15`
                      : status === "success"
                      ? `${token.colorSuccess}15`
                      : status === "error"
                      ? `${token.colorError}15`
                      : `${token.colorWarning}15`,
                }}
              >
                {content.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text
                  strong
                  style={{
                    fontSize: 15,
                    lineHeight: "22px",
                    color: token.colorTextHeading,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  {content.title}
                </Text>
                <Text
                  type="secondary"
                  style={{
                    fontSize: 13,
                    lineHeight: "20px",
                    color: token.colorTextSecondary,
                    display: "block",
                  }}
                >
                  {content.description}
                </Text>
                {content.showProgress && (
                  <div style={{ marginTop: 12 }}>
                    <Progress
                      percent={100}
                      showInfo={false}
                      strokeColor={token.colorPrimary}
                      status="active"
                      style={{ margin: 0 }}
                    />
                  </div>
                )}
              </div>
            </Space>

            {(status === "success" || status === "no-results" || status === "error") && (
              <Space>
                {status === "success" && onReset && (
                  <Button
                    type="text"
                    size="small"
                    onClick={onReset}
                    style={{
                      fontSize: 12,
                      height: 28,
                      color: token.colorTextSecondary,
                    }}
                  >
                    Сбросить
                  </Button>
                )}
                {onClose && (
                  <Button
                    type="text"
                    size="small"
                    icon={<X size={14} />}
                    onClick={onClose}
                    style={{
                      fontSize: 12,
                      height: 28,
                      color: token.colorTextSecondary,
                    }}
                  />
                )}
              </Space>
            )}
          </div>

          {status === "success" && cleanedExplanation && cleanedExplanation.trim() && 
           !cleanedExplanation.includes("Показаны все доступные заказы") &&
           !cleanedExplanation.includes("AI временно недоступен") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 0.2 }}
              style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${token.colorBorder}` }}
            >
              <Space size={8} style={{ width: "100%" }}>
                <Info size={14} style={{ color: token.colorTextSecondary, flexShrink: 0 }} />
                <Text
                  style={{
                    fontSize: 13,
                    lineHeight: "20px",
                    color: token.colorTextSecondary,
                  }}
                >
                  {cleanedExplanation}
                </Text>
              </Space>
            </motion.div>
          )}

          {status === "error" && cleanedExplanation && cleanedExplanation.trim() && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 0.2 }}
              style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${token.colorBorder}` }}
            >
              <Space size={8} style={{ width: "100%", flexDirection: "column", alignItems: "flex-start" }}>
                <Space size={8} style={{ width: "100%" }}>
                  <AlertCircle size={14} style={{ color: token.colorError, flexShrink: 0 }} />
                  <Text
                    strong
                    style={{
                      fontSize: 13,
                      lineHeight: "20px",
                      color: token.colorError,
                    }}
                  >
                    Детали ошибки:
                  </Text>
                </Space>
                <Text
                  style={{
                    fontSize: 13,
                    lineHeight: "20px",
                    color: token.colorTextSecondary,
                    paddingLeft: 22,
                  }}
                >
                  {cleanedExplanation}
                </Text>
              </Space>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

