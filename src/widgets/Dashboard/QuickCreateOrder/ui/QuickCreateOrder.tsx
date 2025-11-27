"use client";

import { useState } from "react";
import { Card, Button, Input, Modal, Typography, Spin, Space, Form, Alert, Divider } from "antd";
import { Sparkles, Wand2, X, Check, Bot, ArrowRight, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { aiService } from "@/src/shared/lib/ai";
import { useRouter } from "next/navigation";

const { TextArea } = Input;
const { Text, Title } = Typography;

interface QuickCreateOrderProps {
  userRole: "client" | "freelancer" | null;
}

export function QuickCreateOrder({ userRole }: QuickCreateOrderProps) {
  const router = useRouter();
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
        hoverable
        onClick={() => setIsOpen(true)}
        style={{
          minWidth: 160,
          background: 'var(--primary-08)',
          borderColor: 'var(--primary-25)',
          cursor: 'pointer',
        }}
      >
        <Space direction="vertical" align="center" style={{ width: '100%', textAlign: 'center' }}>
          <div className="relative">
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--primary-12) 0%, rgba(139, 92, 246, 0.12) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            </div>
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
          <div>
            <Text strong style={{ fontSize: '14px', display: 'block' }}>
              Быстрое создание
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Название → AI описание
            </Text>
          </div>
        </Space>
      </Card>

      {/* Модальное окно */}
      <Modal
        open={isOpen}
        onCancel={handleReset}
        footer={null}
        width={600}
        title={
          <Space>
            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            <span>Быстрое создание заказа</span>
          </Space>
        }
        destroyOnClose
      >
        <Form layout="vertical" size="large" requiredMark={false}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Название */}
            <Form.Item
              label="Название заказа"
              required
              help="Укажите краткое название вашего проекта"
            >
              <Input
                placeholder="Например: Разработка веб-приложения"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onPressEnter={() => {
                  if (title.trim() && !streaming) {
                    handleGenerate();
                  }
                }}
                prefix={<FileText size={16} />}
              />
            </Form.Item>

            {/* Кнопка генерации */}
            <Button
              type="primary"
              icon={streaming ? <Spin size="small" /> : <Wand2 size={16} />}
              onClick={handleGenerate}
              disabled={!title.trim() || streaming}
              block
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
                    message={
                      <Space>
                        <Bot size={16} style={{ color: 'var(--primary)' }} />
                        <Text strong style={{ fontSize: '14px' }}>
                          {streaming ? 'Генерирую описание...' : 'Описание готово'}
                        </Text>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 12 }}>
                        {streaming && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Spin size="small" />
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                              AI создает подробное описание заказа...
                            </Text>
                          </div>
                        )}
                        {aiDescription && (
                          <Text 
                            style={{ 
                              fontSize: '14px', 
                              whiteSpace: 'pre-wrap', 
                              display: 'block',
                              lineHeight: '1.6',
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
                          </Text>
                        )}
                        {!streaming && aiDescription && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                            <Check size={16} style={{ color: 'var(--primary)' }} />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              Перенаправление на форму создания заказа...
                            </Text>
                          </div>
                        )}
                      </Space>
                    }
                    type="success"
                    showIcon={false}
                    style={{ 
                      background: 'var(--primary-08)',
                      borderColor: 'var(--primary-25)',
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Опциональное поле для ручного описания - показываем только если нет AI описания и не идет генерация */}
            {!aiDescription && !streaming && (
              <Form.Item
                label="Или опишите вручную (опционально)"
                help="Можете добавить дополнительные детали, которые AI учтет при генерации"
              >
                <TextArea
                  placeholder="Опишите основные требования к проекту..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            )}

            {!streaming && !aiDescription && (
              <Divider style={{ margin: '16px 0' }} />
            )}

            {/* Действия - показываем только если нет сгенерированного описания и не идет генерация */}
            {!aiDescription && !streaming && (
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handleReset}>
                  Отмена
                </Button>
                <Button
                  type="primary"
                  icon={<ArrowRight size={16} />}
                  onClick={handleCreateWithAI}
                  disabled={!title.trim()}
                  size="large"
                >
                  Перейти к созданию заказа
                </Button>
              </Space>
            )}
          </Space>
        </Form>
      </Modal>
    </>
  );
}

