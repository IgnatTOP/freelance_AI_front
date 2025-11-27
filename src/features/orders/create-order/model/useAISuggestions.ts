/**
 * Хук для работы с AI предложениями при создании заказа
 */

import { useState } from "react";
import { toastService } from "@/src/shared/lib/toast";
import { aiService } from "@/src/shared/lib/ai";
import { parseAIResponse } from "@/src/shared/lib/ai/ai-utils";
import type { AISuggestions } from "../ui/CreateOrderAISuggestions";
import dayjs from "dayjs";

export function useAISuggestions() {
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);

  const generateAISuggestions = async (
    title: string,
    description: string,
    onDescriptionUpdate?: (chunk: string) => void
  ): Promise<AISuggestions | null> => {
    setAiGenerating(true);
    setAiSuggestions(null);

    try {
      // Генерируем описание через стриминг если его нет
      let fullDescription = description;
      if (!description || description.trim() === "") {
        await aiService.generateOrderDescriptionStream(
          {
            title,
            description: "Создайте подробное описание проекта",
            skills: [],
          },
          (chunk) => {
            fullDescription += chunk;
            onDescriptionUpdate?.(fullDescription);
          }
        );
      }

      // Генерируем предложения по остальным полям через AI
      const prompt = `Ты - AI помощник для создания заказов на фриланс-платформе. 

На основе заказа:
Название: "${title}"
Описание: "${fullDescription}"

Проанализируй заказ и предложи оптимальные значения для:
1. Навыки (skills) - список технологий/инструментов, которые нужны для выполнения заказа (массив строк, минимум 2-3 навыка)
2. Бюджет (budget_min и budget_max) - минимальная и максимальная стоимость в рублях (числа)
3. Срок (deadline_days) - количество дней на выполнение от сегодня (число)
4. Файлы (needs_attachments) - нужны ли прикрепленные файлы (boolean)
5. Описание файлов (attachment_description) - зачем нужны файлы (строка, если needs_attachments = true)

КРИТИЧЕСКИ ВАЖНО: 
- Ответь ТОЛЬКО валидным JSON объектом
- НЕ добавляй никакого текста до или после JSON
- НЕ используй markdown код блоки
- JSON должен начинаться с { и заканчиваться }
- Все поля обязательны, используй пустые значения если не уверен

Пример правильного ответа:
{
  "skills": ["Vue.js", "TypeScript", "Node.js"],
  "budget_min": 50000,
  "budget_max": 100000,
  "deadline_days": 30,
  "needs_attachments": true,
  "attachment_description": "Рекомендуется прикрепить примеры дизайна или техническое задание"
}`;

      let aiResponse = "";
      await aiService.chatAssistantStream(
        {
          message: prompt,
          context_data: {
            user_role: "client",
          },
        },
        (chunk) => {
          aiResponse += chunk;
        }
      );

      // Парсим JSON из ответа
      console.log("AI Response for suggestions:", aiResponse);
      const parsed = parseAIResponse(aiResponse);
      console.log("Parsed AI suggestions:", parsed);
      
      if (parsed) {
        const deadline = parsed.deadline_days
          ? dayjs().add(parsed.deadline_days, "day").toISOString()
          : undefined;

        const suggestions: AISuggestions = {
          skills: Array.isArray(parsed.skills) ? parsed.skills : [],
          budget_min: typeof parsed.budget_min === "number" ? parsed.budget_min : undefined,
          budget_max: typeof parsed.budget_max === "number" ? parsed.budget_max : undefined,
          deadline,
          needsAttachments: Boolean(parsed.needs_attachments),
          attachmentDescription: parsed.attachment_description || "",
        };
        
        console.log("Final suggestions:", suggestions);
        setAiSuggestions(suggestions);
        return suggestions;
      }

      console.warn("Failed to parse AI suggestions, response was:", aiResponse);
      toastService.warning("AI не смог сгенерировать предложения. Попробуйте еще раз.");
      return null;
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      toastService.error("Не удалось сгенерировать предложения от AI");
      return null;
    } finally {
      setAiGenerating(false);
    }
  };

  return {
    aiGenerating,
    aiSuggestions,
    generateAISuggestions,
    setAiSuggestions,
  };
}

