/**
 * Хук для работы с AI предложениями при создании заказа
 */

import { useState } from "react";
import { toastService } from "@/src/shared/lib/toast";
import { aiService } from "@/src/shared/lib/ai";
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
        try {
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
        } catch (error) {
          console.error("Error generating description:", error);
          // Продолжаем работу даже если описание не сгенерировалось
        }
      }

      // Параллельно запрашиваем навыки и бюджет
      const [skillsResult, budgetResult] = await Promise.allSettled([
        aiService.generateOrderSkills({ title, description: fullDescription }),
        aiService.generateOrderBudget({ title, description: fullDescription }),
      ]);

      // Извлекаем навыки
      let skills: string[] = [];
      if (skillsResult.status === "fulfilled" && skillsResult.value?.skills) {
        // API возвращает { skill, level }, извлекаем только названия
        skills = skillsResult.value.skills.map((s: any) => 
          typeof s === "string" ? s : s.skill
        );
      }

      // Извлекаем бюджет
      let budget_min: number | undefined;
      let budget_max: number | undefined;
      if (budgetResult.status === "fulfilled" && budgetResult.value) {
        budget_min = budgetResult.value.budget_min;
        budget_max = budgetResult.value.budget_max;
      }

      // Формируем предложения
      const suggestions: AISuggestions = {
        skills,
        budget_min,
        budget_max,
        deadline: undefined, // API не предоставляет рекомендацию по срокам в этом контексте
        needsAttachments: false,
        attachmentDescription: "",
      };

      console.log("Generated AI suggestions:", suggestions);
      
      if (skills.length > 0 || budget_min || budget_max) {
        setAiSuggestions(suggestions);
        return suggestions;
      }

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
