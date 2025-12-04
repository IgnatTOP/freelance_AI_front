"use client";

import { useState } from "react";
import {
  TextField,
  Typography,
  Card,
  Button,
  Stack,
  Alert,
  Box,
} from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import { Sparkles, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import { aiService } from "@/src/shared/lib/ai";
import { COMMON_SKILLS } from "@/src/shared/lib/utils";

interface QuickCreateModeProps {
  onGenerated: (data: GeneratedOrderData) => void;
  onSwitchMode: () => void;
}

export interface GeneratedOrderData {
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
  skills: string[];
}

export function QuickCreateMode({ onGenerated, onSwitchMode }: QuickCreateModeProps) {
  const [idea, setIdea] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!idea.trim()) {
      toastService.warning("Опишите вашу идею проекта");
      return;
    }

    if (idea.trim().length < 20) {
      toastService.warning("Опишите идею подробнее (минимум 20 символов)");
      return;
    }

    setGenerating(true);

    try {
      // Генерируем полное описание через AI
      let fullDescription = "";
      await aiService.generateOrderDescriptionStream(
        {
          title: idea.trim(),
          description: "",
          skills: [],
        },
        (chunk) => {
          fullDescription += chunk;
        }
      );

      // Извлекаем навыки из описания
      const skills = extractSkillsFromDescription(fullDescription + idea);

      // Генерируем название (берем первые 100 символов идеи или генерируем короткое)
      const title = idea.trim().length > 80
        ? idea.trim().substring(0, 80).trim() + "..."
        : idea.trim();

      // Оцениваем бюджет на основе сложности
      const { budget_min, budget_max } = estimateBudget(fullDescription, skills);

      // Устанавливаем срок (по умолчанию 2 недели)
      const deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

      const generatedData: GeneratedOrderData = {
        title,
        description: fullDescription,
        budget_min,
        budget_max,
        deadline,
        skills,
      };

      toastService.success("Заказ сгенерирован! Проверьте данные и создайте заказ");
      onGenerated(generatedData);
    } catch (error) {
      console.error("Error generating order:", error);
      toastService.error("Ошибка генерации. Попробуйте ещё раз");
    } finally {
      setGenerating(false);
    }
  };

  const extractSkillsFromDescription = (text: string): string[] => {
    const commonSkills = COMMON_SKILLS;

    const foundSkills = commonSkills.filter(skill =>
      text.toLowerCase().includes(skill.toLowerCase())
    );

    // Возвращаем максимум 8 навыков
    return [...new Set(foundSkills)].slice(0, 8);
  };

  const estimateBudget = (description: string, skills: string[]): { budget_min: number; budget_max: number } => {
    // Базовая оценка
    let baseMin = 20000;
    let baseMax = 50000;

    // Увеличиваем бюджет в зависимости от сложности
    const complexity = skills.length;
    const descLength = description.length;

    if (complexity >= 5 || descLength > 500) {
      baseMin = 50000;
      baseMax = 150000;
    } else if (complexity >= 3 || descLength > 300) {
      baseMin = 30000;
      baseMax = 80000;
    }

    return { budget_min: baseMin, budget_max: baseMax };
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      <Card sx={{ p: 4, borderRadius: 2 }}>
        <Stack spacing={3}>
          {/* Заголовок */}
          <Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles size={28} strokeWidth={2} style={{ color: "#fff" }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={600}>
                  Быстрое создание с AI
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Опишите идею — AI создаст полный заказ
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="text"
              size="small"
              onClick={onSwitchMode}
              sx={{ p: 0.5, minWidth: 'auto', fontSize: 14, color: 'text.secondary' }}
            >
              Переключиться на обычное создание
            </Button>
          </Box>

          {/* Инфо блок */}
          <Alert
            severity="info"
            icon={<Sparkles size={16} />}
            sx={{ borderRadius: 1 }}
          >
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Как это работает?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Опишите вашу идею в свободной форме. AI автоматически создаст название,
              подробное описание, оценит бюджет, определит срок и подберёт необходимые навыки.
              Вы сможете отредактировать всё перед публикацией.
            </Typography>
          </Alert>

          {/* Поле ввода */}
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Опишите вашу идею проекта
              <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                *
              </Typography>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Например: Нужен лендинг для кофейни с онлайн-меню и системой заказа. Должен быть современный дизайн, адаптивная вёрстка, интеграция с картами и формой обратной связи..."
              inputProps={{ maxLength: 1000 }}
              disabled={generating}
              helperText={`${idea.length}/1000 • Минимум 20 символов. Чем подробнее опишете, тем точнее будет результат.`}
            />
          </Box>

          {/* Кнопка генерации */}
          <Button
            variant="contained"
            size="large"
            startIcon={generating ? null : <Wand2 size={20} strokeWidth={2} />}
            onClick={handleGenerate}
            disabled={!idea.trim() || idea.trim().length < 20 || generating}
            fullWidth
            sx={{ height: 48, fontSize: 16, fontWeight: 500, mt: 1 }}
          >
            {generating ? "Генерирую заказ..." : "Создать заказ с помощью AI"}
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}
