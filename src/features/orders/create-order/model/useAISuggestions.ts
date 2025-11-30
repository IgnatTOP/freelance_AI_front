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
          toastService.error("Не удалось сгенерировать описание. Продолжаем с остальными полями...");
          // Продолжаем работу даже если описание не сгенерировалось
        }
      }

      // Генерируем предложения по остальным полям через AI
      let aiResponse = "";
      try {
        await aiService.generateOrderSuggestionsStream(
          {
            title,
            description: fullDescription,
          },
          (chunk) => {
            aiResponse += chunk;
          }
        );
      } catch (error) {
        console.error("Error in generateOrderSuggestionsStream:", error);
        throw new Error("Не удалось получить ответ от AI. Проверьте подключение к интернету.");
      }

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

