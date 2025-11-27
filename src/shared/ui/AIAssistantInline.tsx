"use client";

import { useState } from "react";
import { Button, Space, Typography, Spin, theme } from "antd";
import { toastService } from "@/src/shared/lib/toast";
import { Sparkles, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const { Text } = Typography;
const { useToken } = theme;

interface AIAssistantInlineProps {
  onImprove: (onChunk: (chunk: string) => void) => Promise<void>;
  onApply: (text: string) => void;
  disabled?: boolean;
  size?: "small" | "middle" | "large";
}

export function AIAssistantInline({
  onImprove,
  onApply,
  disabled = false,
  size = "middle",
}: AIAssistantInlineProps) {
  const { token } = useToken();
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

  return (
    <div>
      <Button
        type="text"
        size={size}
        icon={loading ? <Spin size="small" /> : <Sparkles size={14} />}
        onClick={handleImprove}
        disabled={disabled || loading}
        loading={loading}
        style={{
          color: "var(--primary)",
          padding: size === "small" ? "4px 8px" : size === "large" ? "4px 16px" : "4px 12px",
          height: "auto",
          fontSize: size === "small" ? "12px" : size === "large" ? "14px" : "13px",
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
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Space size={8}>
                  <Sparkles size={16} style={{ color: "var(--primary)" }} />
                  <Text strong style={{ fontSize: 13, color: "var(--primary)" }}>
                    AI улучшил текст
                  </Text>
                </Space>
                <Button
                  type="text"
                  size="small"
                  icon={<X size={12} />}
                  onClick={handleCancel}
                  style={{ padding: 0, width: 20, height: 20 }}
                />
              </div>
              
              <div
                style={{
                  background: token.colorBgContainer,
                  borderRadius: 6,
                  padding: 12,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  maxHeight: 200,
                  overflowY: "auto",
                  boxShadow: token.boxShadowSecondary,
                }}
              >
                <Text
                  style={{
                    whiteSpace: "pre-wrap",
                    fontSize: 13,
                    lineHeight: "20px",
                    color: token.colorText,
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
                </Text>
              </div>

              <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  onClick={handleCancel}
                  style={{ fontSize: 12 }}
                >
                  Отмена
                </Button>
                <Button
                  type="primary"
                  size="small"
                  icon={<Check size={12} />}
                  onClick={handleApply}
                  style={{
                    background: "var(--primary)",
                    borderColor: "var(--primary)",
                    fontSize: 12,
                  }}
                >
                  Применить
                </Button>
              </Space>
            </Space>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

