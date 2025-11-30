import api from "../api/axios";
import { sseService } from "./sse.service";
import { parseAIResponse, cleanExplanationText } from "./ai-utils";

export interface AIOrderDescriptionRequest {
  title: string;
  description: string;
  skills?: string[];
}

export interface AIOrderDescriptionResponse {
  description: string;
}

export interface AIProposalRequest {
  user_skills?: string[];
  user_experience?: string;
  user_bio?: string;
  portfolio?: Array<{
    title: string;
    description: string;
    ai_tags?: string[];
  }>;
}

export interface AIProposalResponse {
  proposal: string;
}

export interface AIProposalFeedbackResponse {
  feedback: string;
}

export interface AIOrderImproveRequest {
  title: string;
  description: string;
}

export interface AIOrderImproveResponse {
  description: string;
}

export interface RecommendedOrder {
  order_id: string;
  match_score: number;
  explanation: string;
}

export interface AIRecommendedOrdersResponse {
  recommended_order_ids: string[];
  recommended_orders?: RecommendedOrder[];
  explanation: string;
}

export interface AIPriceTimelineResponse {
  recommended_amount?: number;
  min_amount?: number;
  max_amount?: number;
  recommended_days?: number;
  min_days?: number;
  max_days?: number;
  explanation: string;
}

export interface AIOrderQualityResponse {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface AISuitableFreelancersResponse {
  freelancers: Array<{
    user_id: string;
    match_score: number;
    explanation: string;
  }>;
}

export interface AIAssistantRequest {
  message: string;
  context_data?: Record<string, any>;
}

export interface AIAssistantResponse {
  response: string;
}

export interface AIProfileImproveRequest {
  current_bio?: string;
  skills?: string[];
  experience_level?: string;
}

export interface AIProfileImproveResponse {
  improved_bio: string;
}

export interface AIPortfolioImproveRequest {
  title: string;
  description: string;
  ai_tags?: string[];
}

export interface AIPortfolioImproveResponse {
  improved_description: string;
}

export interface AIRegenerateSummaryResponse {
  id: string;
  client_id: string;
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  status: string;
  deadline_at?: string;
  ai_summary?: string;
  best_recommendation_proposal_id?: string;
  best_recommendation_justification?: string;
  ai_analysis_updated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AIConversationSummaryResponse {
  summary: string;
  next_steps: string[];
  agreements: string[];
  open_questions: string[];
}

class AIService {
  // Генерация описания заказа
  async generateOrderDescription(
    data: AIOrderDescriptionRequest
  ): Promise<AIOrderDescriptionResponse> {
    const response = await api.post<AIOrderDescriptionResponse>(
      "/ai/orders/description",
      data
    );
    return response.data;
  }

  // Генерация предложения к заказу
  async generateProposal(
    orderId: string,
    data?: AIProposalRequest
  ): Promise<AIProposalResponse> {
    const response = await api.post<AIProposalResponse>(
      `/ai/orders/${orderId}/proposal`,
      data || {}
    );
    return response.data;
  }

  // Получить рекомендации по улучшению предложения
  async getProposalFeedback(
    orderId: string
  ): Promise<AIProposalFeedbackResponse> {
    const response = await api.get<AIProposalFeedbackResponse>(
      `/ai/orders/${orderId}/proposals/feedback`
    );
    return response.data;
  }

  // Получить рекомендации по улучшению предложения (стриминг)
  async getProposalFeedbackStream(
    orderId: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    return sseService.stream(
      `/ai/orders/${orderId}/proposals/feedback/stream`,
      {
        onMessage: onChunk,
        onError: (error) => {
          console.error("Proposal feedback stream error:", error);
        },
      }
    );
  }

  // Улучшить описание заказа
  async improveOrderDescription(
    data: AIOrderImproveRequest
  ): Promise<AIOrderImproveResponse> {
    const response = await api.post<AIOrderImproveResponse>(
      "/ai/orders/improve",
      data
    );
    return response.data;
  }

  // Улучшить описание заказа (стриминг)
  async improveOrderDescriptionStream(
    data: AIOrderImproveRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    return sseService.streamPost("/ai/orders/improve/stream", data, {
      onMessage: onChunk,
      onError: (error) => {
        console.error("Order improve stream error:", error);
      },
    });
  }

  // Получить рекомендованные заказы (для фрилансера)
  async getRecommendedOrders(
    limit: number = 50
  ): Promise<AIRecommendedOrdersResponse> {
    const response = await api.get<AIRecommendedOrdersResponse>(
      "/ai/orders/recommended",
      {
        params: { limit },
        timeout: 120000, // 2 минуты для AI запросов
      }
    );
    return response.data;
  }

  // Получить рекомендацию цены и сроков
  async getPriceTimeline(
    orderId: string
  ): Promise<AIPriceTimelineResponse> {
    const response = await api.get<AIPriceTimelineResponse>(
      `/ai/orders/${orderId}/price-timeline`
    );
    return response.data;
  }

  // Получить рекомендацию цены и сроков (стриминг)
  async getPriceTimelineStream(
    orderId: string,
    onChunk: (chunk: string) => void,
    onComplete: (recommendation: AIPriceTimelineResponse) => void
  ): Promise<void> {
    let fullText = "";
    let recommendation: AIPriceTimelineResponse | null = null;

    return sseService.stream(
      `/ai/orders/${orderId}/price-timeline/stream`,
      {
        onMessage: (chunk) => {
          fullText += chunk;
        },
        onData: (data: any) => {
          if (data.recommended_amount !== undefined) {
            recommendation = data as AIPriceTimelineResponse;
          }
        },
        onComplete: () => {
          if (!recommendation && fullText) {
            try {
              const parsed = parseAIResponse(fullText);
              if (parsed && parsed.recommended_amount !== undefined) {
                recommendation = parsed as AIPriceTimelineResponse;
              }
            } catch (e) {
              console.error("Failed to parse price timeline:", e);
            }
          }
          if (recommendation) {
            onComplete(recommendation);
          } else {
            onComplete({
              explanation: "Рекомендация на основе базовых критериев",
            });
          }
        },
        onError: (error) => {
          console.error("Price timeline stream error:", error);
          onComplete({
            explanation: "Ошибка при получении рекомендации",
          });
        },
      }
    );
  }

  // Оценка качества заказа
  async getOrderQuality(orderId: string): Promise<AIOrderQualityResponse> {
    const response = await api.get<AIOrderQualityResponse>(
      `/ai/orders/${orderId}/quality`
    );
    return response.data;
  }

  // Оценка качества заказа (стриминг)
  async getOrderQualityStream(
    orderId: string,
    onChunk: (chunk: string) => void,
    onComplete: (evaluation: AIOrderQualityResponse) => void
  ): Promise<void> {
    let fullText = "";
    let evaluation: AIOrderQualityResponse | null = null;

    return sseService.stream(
      `/ai/orders/${orderId}/quality/stream`,
      {
        onMessage: (chunk) => {
          fullText += chunk;
        },
        onData: (data: any) => {
          if (data.score !== undefined) {
            evaluation = data as AIOrderQualityResponse;
          }
        },
        onComplete: () => {
          if (!evaluation && fullText) {
            try {
              const parsed = parseAIResponse(fullText);
              if (parsed && parsed.score !== undefined) {
                evaluation = parsed as AIOrderQualityResponse;
              }
            } catch (e) {
              console.error("Failed to parse order quality:", e);
            }
          }
          if (evaluation) {
            onComplete(evaluation);
          } else {
            onComplete({
              score: 5,
              strengths: [],
              weaknesses: ["Не удалось получить оценку"],
              recommendations: [],
            });
          }
        },
        onError: (error) => {
          console.error("Order quality stream error:", error);
          onComplete({
            score: 5,
            strengths: [],
            weaknesses: ["Ошибка при оценке"],
            recommendations: [],
          });
        },
      }
    );
  }

  // Найти подходящих фрилансеров (для заказчика)
  async getSuitableFreelancers(
    orderId: string,
    limit: number = 10
  ): Promise<AISuitableFreelancersResponse> {
    const response = await api.get<AISuitableFreelancersResponse>(
      `/ai/orders/${orderId}/suitable-freelancers`,
      {
        params: { limit },
      }
    );
    return response.data;
  }

  // Найти подходящих фрилансеров (стриминг)
  async getSuitableFreelancersStream(
    orderId: string,
    limit: number,
    onChunk: (chunk: string) => void,
    onComplete: (freelancers: AISuitableFreelancersResponse["freelancers"]) => void
  ): Promise<void> {
    let fullText = "";
    let freelancers: AISuitableFreelancersResponse["freelancers"] = [];

    return sseService.stream(
      `/ai/orders/${orderId}/suitable-freelancers/stream?limit=${limit}`,
      {
        onMessage: (chunk) => {
          fullText += chunk;
        },
        onData: (data: any) => {
          if (data.freelancers && Array.isArray(data.freelancers)) {
            freelancers = data.freelancers;
          }
        },
        onComplete: () => {
          if (freelancers.length === 0 && fullText) {
            try {
              const parsed = parseAIResponse(fullText);
              if (parsed && parsed.recommended_freelancers) {
                freelancers = parsed.recommended_freelancers.map((f: any) => ({
                  user_id: f.user_id,
                  match_score: f.match_score,
                  explanation: f.explanation,
                }));
              }
            } catch (e) {
              console.error("Failed to parse suitable freelancers:", e);
            }
          }
          onComplete(freelancers);
        },
        onError: (error) => {
          console.error("Suitable freelancers stream error:", error);
          onComplete([]);
        },
      }
    );
  }

  // AI чат-помощник
  async chatAssistant(
    data: AIAssistantRequest
  ): Promise<AIAssistantResponse> {
    const response = await api.post<AIAssistantResponse>(
      "/ai/assistant",
      data
    );
    return response.data;
  }

  // AI чат-помощник (стриминг)
  async chatAssistantStream(
    data: AIAssistantRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    return sseService.streamPost("/ai/assistant/stream", data, {
      onMessage: onChunk,
      onError: (error) => {
        console.error("AI Assistant stream error:", error);
      },
    });
  }

  // Генерация описания заказа (стриминг)
  async generateOrderDescriptionStream(
    data: AIOrderDescriptionRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    return sseService.streamPost("/ai/orders/description/stream", data, {
      onMessage: onChunk,
      onError: (error) => {
        console.error("Order description stream error:", error);
      },
    });
  }

  // Генерация предложения (стриминг)
  async generateProposalStream(
    orderId: string,
    data: AIProposalRequest | undefined,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    return sseService.streamPost(
      `/ai/orders/${orderId}/proposal/stream`,
      data || {},
      {
        onMessage: onChunk,
        onError: (error) => {
          console.error("Proposal stream error:", error);
        },
      }
    );
  }

  // Получить рекомендованные заказы (стриминг)
  async getRecommendedOrdersStream(
    limit: number,
    onChunk: (chunk: string) => void,
    onComplete: (orderIds: string[], explanation: string, recommendedOrders?: RecommendedOrder[]) => void
  ): Promise<void> {
    let fullText = "";
    let orderIds: string[] = [];
    let recommendedOrders: RecommendedOrder[] = [];
    let explanation = "";
    let hasError = false;
    let errorMessage = "";

    try {
      await sseService.stream(
        `/ai/orders/recommended/stream?limit=${limit}`,
        {
          onMessage: (chunk) => {
            fullText += chunk;
            // Не передаем сырой chunk в onChunk, чтобы не показывать JSON пользователю
          },
          onData: (data: any) => {
            // Обрабатываем структурированные данные (event: data)
            if (data.recommended_order_ids && Array.isArray(data.recommended_order_ids)) {
              orderIds = data.recommended_order_ids;
            }
            if (data.recommended_orders && Array.isArray(data.recommended_orders)) {
              recommendedOrders = data.recommended_orders;
              // Если есть recommended_orders, используем их для orderIds
              if (orderIds.length === 0) {
                orderIds = recommendedOrders.map(ro => ro.order_id);
              }
            }
            if (data.explanation && typeof data.explanation === 'string') {
              explanation = data.explanation;
            }
          },
          onComplete: () => {
            // Если данные не пришли через onData, пытаемся распарсить из текста
            if (orderIds.length === 0 && fullText) {
              try {
                const parsed = parseAIResponse(fullText);
                if (parsed) {
                  if (parsed.recommended_order_ids && Array.isArray(parsed.recommended_order_ids)) {
                    orderIds = parsed.recommended_order_ids;
                  }
                  if (parsed.explanation && typeof parsed.explanation === 'string') {
                    explanation = parsed.explanation;
                  }
                }
                
                // Если не нашли JSON, пытаемся извлечь объяснение из текста (убирая JSON)
                if (!explanation && fullText) {
                  // Сначала пытаемся найти объяснение в JSON формате
                  const jsonMatch = fullText.match(/"explanation"\s*:\s*"([^"]+)"/i);
                  if (jsonMatch && jsonMatch[1]) {
                    explanation = jsonMatch[1];
                  } else {
                    // Убираем JSON из текста
                    explanation = fullText
                      .replace(/\{[\s\S]*"recommended_order_ids"[\s\S]*\}/g, '')
                      .replace(/\{[\s\S]*\}/g, '')
                      .replace(/\[[\s\S]*?\]/g, '')
                      .trim();
                  }
                }
              } catch (e) {
                console.error("Failed to parse recommended orders:", e);
                // Если парсинг не удался, пытаемся извлечь объяснение без JSON
                if (fullText) {
                  explanation = fullText
                    .replace(/\{[\s\S]*\}/g, '')
                    .trim();
                }
              }
            }
            
            // Очищаем объяснение от технических деталей
            if (explanation) {
              explanation = cleanExplanationText(explanation);
            }
            
            // Если была ошибка, передаем информацию об ошибке
            if (hasError) {
              onComplete([], errorMessage || "Ошибка при получении рекомендаций", []);
            } else {
              onComplete(orderIds, explanation || "", recommendedOrders.length > 0 ? recommendedOrders : undefined);
            }
          },
          onError: (error) => {
            hasError = true;
            errorMessage = error?.message || error?.toString() || "Неизвестная ошибка";
            console.error("Recommended orders stream error:", error);
            // Вызываем onComplete с ошибкой
            onComplete([], errorMessage, []);
          },
        }
      );
    } catch (error: any) {
      // Если произошла ошибка на уровне Promise
      hasError = true;
      errorMessage = error?.message || error?.toString() || "Не удалось подключиться к AI сервису";
      console.error("Recommended orders stream promise error:", error);
      onComplete([], errorMessage, []);
    }
  }

  // Улучшить профиль
  async improveProfile(
    data: AIProfileImproveRequest
  ): Promise<AIProfileImproveResponse> {
    const response = await api.post<AIProfileImproveResponse>(
      "/ai/profile/improve",
      data
    );
    return response.data;
  }

  // Улучшить портфолио
  async improvePortfolio(
    data: AIPortfolioImproveRequest
  ): Promise<AIPortfolioImproveResponse> {
    const response = await api.post<AIPortfolioImproveResponse>(
      "/ai/portfolio/improve",
      data
    );
    return response.data;
  }

  // Улучшить профиль (стриминг)
  async improveProfileStream(
    data: AIProfileImproveRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    return sseService.streamPost("/ai/profile/improve/stream", {
      current_bio: data.current_bio || "",
      skills: data.skills || [],
      experience_level: data.experience_level || "",
    }, {
      onMessage: onChunk,
      onError: (error) => {
        console.error("Profile improve stream error:", error);
      },
    });
  }

  // Улучшить портфолио (стриминг)
  async improvePortfolioStream(
    data: AIPortfolioImproveRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    return sseService.streamPost("/ai/portfolio/improve/stream", {
      title: data.title,
      description: data.description,
      ai_tags: data.ai_tags || [],
    }, {
      onMessage: onChunk,
      onError: (error) => {
        console.error("Portfolio improve stream error:", error);
        throw error;
      },
    });
  }

  // Регенерировать AI summary заказа
  async regenerateOrderSummary(
    orderId: string
  ): Promise<AIRegenerateSummaryResponse> {
    const response = await api.post<AIRegenerateSummaryResponse>(
      `/ai/orders/${orderId}/regenerate-summary`
    );
    return response.data;
  }

  // Регенерировать AI summary заказа (стриминг)
  async regenerateOrderSummaryStream(
    orderId: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    return sseService.streamPost(
      `/ai/orders/${orderId}/regenerate-summary/stream`,
      {},
      {
        onMessage: onChunk,
        onError: (error) => {
          console.error("Regenerate summary stream error:", error);
        },
      }
    );
  }

  // Получить резюме переписки
  async summarizeConversation(
    conversationId: string
  ): Promise<AIConversationSummaryResponse> {
    const response = await api.get<AIConversationSummaryResponse>(
      `/ai/conversations/${conversationId}/summary`
    );
    return response.data;
  }

  // Получить резюме переписки (стриминг)
  async summarizeConversationStream(
    conversationId: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    return sseService.stream(
      `/ai/conversations/${conversationId}/summary/stream`,
      {
        onMessage: onChunk,
        onError: (error) => {
          console.error("Conversation summary stream error:", error);
        },
      }
    );
  }

  // Генерация предложений для создания заказа (навыки, бюджет, сроки и т.д.)
  async generateOrderSuggestions(data: {
    title: string;
    description: string;
  }): Promise<{
    skills?: string[];
    budget_min?: number;
    budget_max?: number;
    deadline_days?: number;
    needs_attachments?: boolean;
    attachment_description?: string;
  }> {
    const response = await api.post(
      "/ai/orders/suggestions",
      data
    );
    return response.data;
  }

  // Генерация предложений для создания заказа (стриминг)
  async generateOrderSuggestionsStream(
    data: {
      title: string;
      description: string;
    },
    onChunk: (chunk: string) => void
  ): Promise<void> {
    return sseService.streamPost("/ai/orders/suggestions/stream", data, {
      onMessage: onChunk,
      onError: (error) => {
        console.error("Order suggestions stream error:", error);
      },
    });
  }

  // Генерация списка навыков для заказа
  async generateOrderSkills(data: {
    title: string;
    description: string;
  }): Promise<{ skills: string[] }> {
    const response = await api.post<{ skills: string[] }>(
      "/ai/orders/skills",
      data
    );
    return response.data;
  }

  // Генерация списка навыков для заказа (стриминг)
  async generateOrderSkillsStream(
    data: {
      title: string;
      description: string;
    },
    onChunk: (chunk: string) => void
  ): Promise<void> {
    return sseService.streamPost("/ai/orders/skills/stream", data, {
      onMessage: onChunk,
      onError: (error) => {
        console.error("Order skills stream error:", error);
      },
    });
  }

  // Генерация бюджета для заказа
  async generateOrderBudget(data: {
    title: string;
    description: string;
  }): Promise<{
    budget_min?: number;
    budget_max?: number;
  }> {
    const response = await api.post(
      "/ai/orders/budget",
      data
    );
    return response.data;
  }

  // Генерация бюджета для заказа (стриминг)
  async generateOrderBudgetStream(
    data: {
      title: string;
      description: string;
    },
    onChunk: (chunk: string) => void
  ): Promise<void> {
    return sseService.streamPost("/ai/orders/budget/stream", data, {
      onMessage: onChunk,
      onError: (error) => {
        console.error("Order budget stream error:", error);
      },
    });
  }

  // Генерация приветственного сообщения
  async generateWelcomeMessage(data: {
    user_role: string;
  }): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      "/ai/welcome-message",
      data
    );
    return response.data;
  }

  // Генерация приветственного сообщения (стриминг)
  async generateWelcomeMessageStream(
    data: {
      user_role: string;
    },
    onChunk: (chunk: string) => void
  ): Promise<void> {
    return sseService.streamPost("/ai/welcome-message/stream", data, {
      onMessage: onChunk,
      onError: (error) => {
        console.error("Welcome message stream error:", error);
      },
    });
  }
}

export const aiService = new AIService();
export default aiService;

