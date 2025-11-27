"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Typography, Form, Space, Button, Card, Divider } from "antd";
import { toastService } from "@/src/shared/lib/toast";
import { ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { CreateOrderForm } from "./CreateOrderForm";
import { CreateOrderFileUpload } from "./CreateOrderFileUpload";
import { CreateOrderAISuggestions, type AISuggestions } from "./CreateOrderAISuggestions";
import { useAISuggestions } from "../model/useAISuggestions";
import { createOrder } from "@/src/shared/api/orders";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { useRequireAuth } from "@/src/shared/lib/hooks";
import type { CreateOrderRequest } from "@/src/entities/order/model/types";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface CreateOrderFeatureProps {
  initialTitle?: string;
  initialDescription?: string;
  aiMode?: boolean;
}

export function CreateOrderFeature({
  initialTitle,
  initialDescription,
  aiMode = false,
}: CreateOrderFeatureProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  
  const {
    aiGenerating,
    aiSuggestions,
    generateAISuggestions,
    setAiSuggestions,
  } = useAISuggestions();

  useRequireAuth();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user?.role !== "client" && user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    // Заполняем начальные значения
    if (initialTitle) form.setFieldValue("title", initialTitle);
    if (initialDescription) form.setFieldValue("description", initialDescription);

    // Если режим AI, запускаем генерацию предложений
    if (aiMode && initialTitle) {
      setAiModalOpen(true);
      generateAISuggestions(
        initialTitle,
        initialDescription || "",
        (description) => form.setFieldValue("description", description)
      );
    }
  }, [router, initialTitle, initialDescription, aiMode, form]);

  // Открываем модалку когда предложения готовы
  useEffect(() => {
    if (aiSuggestions && !aiGenerating) {
      setAiModalOpen(true);
    }
  }, [aiSuggestions, aiGenerating]);

  const handleApplyAISuggestions = (edited?: Partial<AISuggestions>) => {
    const finalSuggestions = edited || aiSuggestions;
    if (!finalSuggestions) {
      console.warn("No suggestions to apply");
      return;
    }

    console.log("Applying AI suggestions:", finalSuggestions);

    // Применяем навыки
    if (finalSuggestions.skills && finalSuggestions.skills.length > 0) {
      console.log("Applying skills:", finalSuggestions.skills);
      setSkills(finalSuggestions.skills);
      form.setFieldValue("skills", finalSuggestions.skills);
    }
    
    // Применяем бюджет
    if (finalSuggestions.budget_min !== undefined) {
      console.log("Applying budget_min:", finalSuggestions.budget_min);
      form.setFieldValue("budget_min", finalSuggestions.budget_min);
    }
    if (finalSuggestions.budget_max !== undefined) {
      console.log("Applying budget_max:", finalSuggestions.budget_max);
      form.setFieldValue("budget_max", finalSuggestions.budget_max);
    }
    
    // Применяем срок
    if (finalSuggestions.deadline) {
      console.log("Applying deadline:", finalSuggestions.deadline);
      const deadlineDate = dayjs(finalSuggestions.deadline);
      form.setFieldValue("deadline", deadlineDate);
      console.log("Deadline date object:", deadlineDate);
    }

    // Проверяем, что все применилось
    const formValues = form.getFieldsValue();
    console.log("Form values after applying:", formValues);

    toastService.success("Предложения AI применены!");
    setAiModalOpen(false);
  };

  const handleToggleSkill = (skill: string) => {
    const newSkills = skills.includes(skill)
      ? skills.filter((s) => s !== skill)
      : [...skills, skill];
    setSkills(newSkills);
    form.setFieldValue("skills", newSkills);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const requirements = skills.length > 0 
        ? skills.map((skill) => ({
            skill,
            level: "middle" as const,
          }))
        : [];

      const orderData: CreateOrderRequest = {
        title: values.title,
        description: values.description,
        requirements,
        attachment_ids: attachments.length > 0 ? attachments : [],
      };

      if (values.budget_min) {
        orderData.budget_min = values.budget_min;
      }
      if (values.budget_max) {
        orderData.budget_max = values.budget_max;
      }
      if (values.deadline) {
        orderData.deadline_at = values.deadline.toISOString();
      }

      const order = await createOrder(orderData);
      toastService.success("Заказ успешно создан!");
      router.push(`/orders/${order.id}`);
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Ошибка создания заказа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 32 }}>
          <Button
            type="text"
            icon={<ArrowLeft size={16} />}
            onClick={() => router.back()}
            style={{ padding: 0, marginBottom: 8 }}
          >
            Назад
          </Button>
          <Space align="center" size={8}>
            {aiMode && <Sparkles size={18} style={{ color: 'var(--primary)' }} />}
            <Title level={1} style={{ margin: 0, fontSize: '28px', fontWeight: 600 }}>
              Создать новый заказ
            </Title>
          </Space>
          {aiMode && (
            <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginTop: 4 }}>
              AI поможет заполнить форму автоматически
            </Text>
          )}
        </Space>

        {/* Форма */}
        <Card 
          style={{ 
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(17, 26, 21, 0.5)',
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
            requiredMark={false}
          >
            <CreateOrderForm
              form={form}
              skills={skills}
              onSkillsChange={setSkills}
              onSubmit={handleSubmit}
              loading={loading}
              aiMode={aiMode}
              onGenerateAll={async () => {
                const title = form.getFieldValue("title");
                const description = form.getFieldValue("description");
                if (!title || title.trim().length < 3) {
                  toastService.warning("Сначала введите название заказа (минимум 3 символа)");
                  return;
                }
                // Открываем модальное окно сразу для показа загрузки
                setAiModalOpen(true);
                // Генерируем предложения - модальное окно обновится автоматически когда предложения будут готовы
                await generateAISuggestions(
                  title,
                  description || "",
                  (desc) => form.setFieldValue("description", desc)
                );
              }}
              onTitleChange={(title) => {
                if (aiMode && title && !form.getFieldValue("description")) {
                  setAiModalOpen(true);
                  generateAISuggestions(
                    title,
                    "",
                    (description) => form.setFieldValue("description", description)
                  );
                }
              }}
            />


            {/* Секция 4: Дополнительные файлы */}
            <div style={{ marginTop: 32 }}>
              <Title level={4} style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: 600 }}>
                Дополнительные материалы
              </Title>
              <Form.Item 
                help={
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    Прикрепите файлы: изображения, документы, техническое задание, примеры работ
                  </Text>
                }
                style={{ marginBottom: 0 }}
              >
                <CreateOrderFileUpload
                  attachments={attachments}
                  onAttachmentsChange={setAttachments}
                />
              </Form.Item>
            </div>

            <Divider style={{ margin: '40px 0 32px' }} />

            {/* Кнопки действий */}
            <Form.Item style={{ marginBottom: 0 }}>
              <Space size={12} style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button 
                  onClick={() => router.back()}
                  size="large"
                  style={{ minWidth: 120 }}
                >
                  Отмена
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  icon={<CheckCircle2 size={16} />}
                  style={{ minWidth: 200 }}
                >
                  Создать заказ
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* AI Suggestions Modal */}
        <CreateOrderAISuggestions
          suggestions={aiSuggestions}
          generating={aiGenerating}
          selectedSkills={skills}
          onApplyAll={handleApplyAISuggestions}
          open={aiModalOpen}
          onClose={() => {
            setAiModalOpen(false);
            // Не очищаем предложения, чтобы можно было открыть снова
          }}
        />
      </motion.div>
    </div>
  );
}
