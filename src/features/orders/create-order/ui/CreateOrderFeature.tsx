"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Typography, Button, Box, Paper, IconButton, Divider } from "@mui/material";
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

interface CreateOrderFormData {
  title: string;
  description: string;
  skills: string[];
  budget_min?: number;
  budget_max?: number;
  deadline?: dayjs.Dayjs | null;
  category_id?: string;
}

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
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateOrderFormData>({
    title: initialTitle || '',
    description: initialDescription || '',
    skills: [],
    budget_min: undefined,
    budget_max: undefined,
    deadline: null,
    category_id: undefined,
  });

  const {
    aiGenerating,
    aiSuggestions,
    generateAISuggestions,
  } = useAISuggestions();

  useRequireAuth();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user?.role !== "client" && user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    // Если режим AI, запускаем генерацию предложений
    if (aiMode && initialTitle) {
      setAiModalOpen(true);
      generateAISuggestions(
        initialTitle,
        initialDescription || "",
        (description) => setFormData(prev => ({ ...prev, description }))
      );
    }
  }, [router, initialTitle, initialDescription, aiMode]);

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

    // Применяем данные
    setFormData(prev => ({
      ...prev,
      budget_min: finalSuggestions.budget_min,
      budget_max: finalSuggestions.budget_max,
      deadline: finalSuggestions.deadline ? dayjs(finalSuggestions.deadline) : null,
    }));

    // Применяем навыки
    if (finalSuggestions.skills && finalSuggestions.skills.length > 0) {
      setSkills(finalSuggestions.skills);
    }

    toastService.success("Предложения AI применены!");
    setAiModalOpen(false);
  };

  const handleFormDataChange = (data: Partial<CreateOrderFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = async (values: CreateOrderFormData) => {
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
      if (values.category_id) {
        orderData.category_id = values.category_id;
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
    <Box sx={{ maxWidth: 900, margin: '0 auto', p: { xs: 2, sm: 3 } }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <Box mb={4}>
          <IconButton
            onClick={() => router.back()}
            sx={{ mb: 1, ml: -1 }}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            {aiMode && <Sparkles size={18} color="var(--primary)" />}
            <Typography variant="h4" fontWeight={600}>
              Создать новый заказ
            </Typography>
          </Box>
          {aiMode && (
            <Typography variant="body2" color="text.secondary">
              AI поможет заполнить форму автоматически
            </Typography>
          )}
        </Box>

        {/* Форма */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            p: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <CreateOrderForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
            skills={skills}
            onSkillsChange={setSkills}
            onSubmit={handleSubmit}
            loading={loading}
            aiMode={aiMode}
            onGenerateAll={async () => {
              if (!formData.title || formData.title.trim().length < 3) {
                toastService.warning("Сначала введите название заказа (минимум 3 символа)");
                return;
              }
              setAiModalOpen(true);
              await generateAISuggestions(
                formData.title,
                formData.description || "",
                (desc) => setFormData(prev => ({ ...prev, description: desc }))
              );
            }}
            onTitleChange={(title) => {
              if (aiMode && title && !formData.description) {
                setAiModalOpen(true);
                generateAISuggestions(
                  title,
                  "",
                  (description) => setFormData(prev => ({ ...prev, description }))
                );
              }
            }}
          />

          {/* Секция: Дополнительные файлы */}
          <Box mt={4}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Дополнительные материалы
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Прикрепите файлы: изображения, документы, техническое задание, примеры работ
            </Typography>
            <CreateOrderFileUpload
              attachments={attachments}
              onAttachmentsChange={setAttachments}
            />
          </Box>
        </Paper>

        {/* AI Suggestions Modal */}
        <CreateOrderAISuggestions
          suggestions={aiSuggestions}
          generating={aiGenerating}
          selectedSkills={skills}
          onApplyAll={handleApplyAISuggestions}
          open={aiModalOpen}
          onClose={() => {
            setAiModalOpen(false);
          }}
        />
      </motion.div>
    </Box>
  );
}
