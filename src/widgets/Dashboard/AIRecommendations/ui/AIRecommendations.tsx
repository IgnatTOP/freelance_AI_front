"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Button, Skeleton, Stack, Typography, Box, Chip, List, ListItem, IconButton, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Bot, Sparkles, TrendingUp, Target, Zap, ArrowRight, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { aiService } from "@/src/shared/lib/ai";
import { getOrder, getOrders, getMyOrders } from "@/src/shared/api/orders";
import { cleanExplanationText } from "@/src/shared/lib/ai/ai-utils";
import { toastService } from "@/src/shared/lib/toast";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  match_score: number;
  reason: string;
  type: "order" | "freelancer" | "improvement";
  href: string;
}

interface Order {
  id: string;
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  status: string;
  ai_summary?: string;
}

interface Freelancer {
  user_id: string;
  match_score: number;
  explanation: string;
}

interface AIRecommendationsProps {
  userRole: "client" | "freelancer" | null;
  embedded?: boolean; // Если true, не показываем Card обёртку
}

export function AIRecommendations({ userRole, embedded = false }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [explanation, setExplanation] = useState<string>("");
  const [ordersMatchScores, setOrdersMatchScores] = useState<Map<string, { matchScore: number; explanation: string }>>(new Map());

  const fetchRecommendations = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);

    try {
      if (userRole === "freelancer") {
        // Получаем AI рекомендации заказов через стриминг
        let recommendedOrderIds: string[] = [];
        let cleanExplanation = "";

        await aiService.getRecommendedOrdersStream(
          10,
          (chunk) => {
            // Не показываем сырой текст во время стриминга
            // Только показываем индикатор загрузки
          },
          (orderIds, explanation, recommendedOrders) => {
            recommendedOrderIds = orderIds;
            // Очищаем объяснение от UUID, JSON и технических деталей
            if (explanation) {
              cleanExplanation = cleanExplanationText(explanation);
              
              // Увеличиваем лимит для объяснения, чтобы текст не обрезался слишком быстро
              if (cleanExplanation.length > 500) {
                cleanExplanation = cleanExplanation.substring(0, 500) + "...";
              }
            }
            
            // Сохраняем match_score и explanation для каждого заказа
            const ordersMap = new Map<string, { matchScore: number; explanation: string }>();
            if (recommendedOrders && recommendedOrders.length > 0) {
              recommendedOrders.forEach(ro => {
                ordersMap.set(ro.order_id, {
                  matchScore: ro.match_score,
                  explanation: ro.explanation || "",
                });
              });
            }
            setOrdersMatchScores(ordersMap);
          }
        );

        // Если нет рекомендованных заказов, показываем только улучшение профиля
        if (recommendedOrderIds.length === 0) {
          setRecommendations([
            {
              id: "improve-profile",
              title: "Улучшите профиль",
              description: "Добавьте больше проектов в портфолио",
              match_score: 0.0,
              reason: "Фрилансеры с полным портфолио получают на 40% больше откликов",
              type: "improvement",
              href: "/profile/portfolio",
            },
          ]);
          setExplanation("");
          return;
        }

        // Получаем детали рекомендованных заказов
        const ordersPromises = recommendedOrderIds.map((orderId) =>
          getOrder(orderId).catch(() => null)
        );
        const orders = (await Promise.all(ordersPromises)).filter((order) => order !== null) as Order[];

        if (orders.length === 0) {
          // Если заказы не загрузились, показываем улучшение профиля
          setRecommendations([
            {
              id: "improve-profile",
              title: "Улучшите профиль",
              description: "Добавьте больше проектов в портфолио",
              match_score: 0.0,
              reason: "Фрилансеры с полным портфолио получают на 40% больше откликов",
              type: "improvement",
              href: "/profile/portfolio",
            },
          ]);
          setExplanation("");
          return;
        }

        const recommendations: Recommendation[] = orders.map((order, index) => {
          // Обрезаем длинные названия
          const title = order.title.length > 60 ? order.title.substring(0, 60) + "..." : order.title;
          // Обрезаем описание
          const description = (order.ai_summary || order.description || "Описание заказа").substring(0, 120);
          
          // Получаем match_score и explanation из ordersMatchScores
          const orderMatch = ordersMatchScores.get(order.id);
          // Бэкенд возвращает match_score от 0 до 10, фронтенд ожидает от 0 до 1
          const matchScore = orderMatch ? orderMatch.matchScore / 10 : Math.min(Math.max(0.85 - index * 0.05, 0.7), 1.0);
          const reason = orderMatch?.explanation || "";
          
          return {
            id: order.id,
            title,
            description: description.length < (order.ai_summary || order.description || "").length ? description + "..." : description,
            match_score: matchScore,
            reason,
            type: "order" as const,
            href: `/orders/${order.id}`,
          };
        });

        // Добавляем рекомендацию по улучшению профиля только если заказов меньше 3
        if (recommendations.length < 3) {
          recommendations.push({
            id: "improve-profile",
            title: "Улучшите профиль",
            description: "Добавьте больше проектов в портфолио",
            match_score: 0.0,
            reason: "Фрилансеры с полным портфолио получают на 40% больше откликов",
            type: "improvement",
            href: "/profile/portfolio",
          });
        }

        setRecommendations(recommendations);
        // Очищаем объяснение перед установкой (уже очищено, но убеждаемся)
        setExplanation(cleanExplanation || "");
      } else if (userRole === "client") {
        // Для клиента нужно получить СВОИ заказы и найти подходящих фрилансеров
        const myOrdersResponse = await getMyOrders();
        const myOrders = (myOrdersResponse.as_client || []).filter(
          (order) => order.status === "published" || order.status === "in_progress"
        ).slice(0, 5); // Берем до 5 заказов для большего разнообразия

        if (myOrders.length === 0) {
          setRecommendations([]);
          return;
        }

        // Для каждого заказа получаем подходящих фрилансеров (по 3-5 на заказ)
        const freelancersPromises = myOrders.map((order) =>
          aiService.getSuitableFreelancers(order.id, 5).catch((err) => {
            console.error(`Failed to get suitable freelancers for order ${order.id}:`, err);
            return null;
          })
        );
        const freelancersResponses = await Promise.all(freelancersPromises);

        // Собираем всех фрилансеров из всех заказов
        const allFreelancers: Array<{
          freelancer: { user_id: string; match_score: number; explanation: string };
          order: { id: string; title: string };
        }> = [];

        myOrders.forEach((order, index) => {
          const freelancers = freelancersResponses[index];
          if (freelancers && freelancers.freelancers && freelancers.freelancers.length > 0) {
            freelancers.freelancers.forEach((freelancer) => {
              allFreelancers.push({
                freelancer,
                order: { id: order.id, title: order.title },
              });
            });
          }
        });

        // Сортируем по match_score и берем топ-5 уникальных фрилансеров
        const uniqueFreelancers = new Map<string, typeof allFreelancers[0]>();
        allFreelancers
          .sort((a, b) => (b.freelancer.match_score || 0) - (a.freelancer.match_score || 0))
          .forEach((item) => {
            if (!uniqueFreelancers.has(item.freelancer.user_id)) {
              uniqueFreelancers.set(item.freelancer.user_id, item);
            }
          });

        // Формируем рекомендации из топ-5 фрилансеров
        const recommendations: Recommendation[] = Array.from(uniqueFreelancers.values())
          .slice(0, 5)
          .map(({ freelancer, order }) => {
            const orderTitle = order.title.length > 40 ? order.title.substring(0, 40) + "..." : order.title;
            const title = `Фрилансер для "${orderTitle}"`;
            const description = (freelancer.explanation || "").substring(0, 120);

            return {
              id: freelancer.user_id,
              title: title.length > 60 ? title.substring(0, 60) + "..." : title,
              description: description.length < (freelancer.explanation || "").length ? description + "..." : description,
              match_score: Math.min(Math.max(freelancer.match_score || 0.8, 0), 1.0),
              reason: "",
              type: "freelancer" as const,
              href: `/users/${freelancer.user_id}?order_id=${order.id}`,
            };
          });

        setRecommendations(recommendations);
      }
    } catch (error: any) {
      console.error("Error fetching AI recommendations:", error);
      // Показываем уведомление только если это не первая загрузка
      if (!showLoading) {
        toastService.error("Не удалось загрузить рекомендации", "Попробуйте обновить.");
      }
      // Устанавливаем пустой массив, чтобы показать Empty состояние
      setRecommendations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userRole) {
      fetchRecommendations();
    }
  }, [userRole]);

  const getMatchColor = (score: number) => {
    if (score >= 0.9) return "text-green-400";
    if (score >= 0.75) return "text-yellow-400";
    return "text-blue-400";
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return Target;
      case "freelancer":
        return Bot;
      case "improvement":
        return TrendingUp;
      default:
        return Sparkles;
    }
  };

  const theme = useTheme();

  const content = (
    <>
      {!embedded && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <div className="relative">
              <Bot size={20} />
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <Typography variant="subtitle1" fontWeight={600}>AI Рекомендации</Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => fetchRecommendations(false)}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </IconButton>
        </Box>
      )}
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {userRole === "freelancer"
            ? "Подобрали заказы специально для вас"
            : "Лучшие исполнители для ваших проектов"}
        </Typography>

        {explanation && explanation.trim() && (
          <Card
            sx={{
              bgcolor: 'var(--primary-06)',
              borderColor: 'var(--primary-18)',
              mb: 2,
              overflow: 'visible',
              wordBreak: 'break-word',
            }}
          >
            <CardContent sx={{ p: 1.5 }}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight="bold" sx={{ color: 'var(--primary)' }}>
                  Почему эти заказы?
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                    lineHeight: 1.6,
                    display: 'block',
                  }}
                >
                  {explanation}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}

        {recommendations.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary">Пока нет рекомендаций</Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {recommendations.map((rec, index) => {
              const Icon = getIcon(rec.type);
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link href={rec.href} style={{ textDecoration: 'none' }}>
                    <Box
                      sx={{
                        cursor: 'pointer',
                        p: 2,
                        borderRadius: 1.5,
                        bgcolor: 'var(--primary-05)',
                        border: '1px solid var(--primary-12)',
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                        '&:hover': {
                          borderColor: 'primary.main',
                          opacity: 0.9,
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Box sx={{
                          bgcolor: 'var(--primary-06)',
                          p: 1,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          height: 'fit-content',
                        }}>
                          <Icon size={18} style={{ color: 'var(--primary)' }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'nowrap',
                            mb: 1,
                          }}>
                            {rec.match_score > 0 && (
                              <Chip
                                size="small"
                                icon={<Zap size={12} />}
                                label={`${Math.min(Math.round(rec.match_score * 100), 100)}%`}
                                sx={{
                                  bgcolor: rec.match_score >= 0.9
                                    ? 'rgba(82, 196, 26, 0.15)'
                                    : rec.match_score >= 0.75
                                    ? 'rgba(250, 173, 20, 0.15)'
                                    : 'rgba(24, 144, 255, 0.15)',
                                  borderColor: rec.match_score >= 0.9
                                    ? 'rgba(82, 196, 26, 0.3)'
                                    : rec.match_score >= 0.75
                                    ? 'rgba(250, 173, 20, 0.3)'
                                    : 'rgba(24, 144, 255, 0.3)',
                                  color: rec.match_score >= 0.9
                                    ? '#52c41a'
                                    : rec.match_score >= 0.75
                                    ? '#faad14'
                                    : '#1890ff',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  border: '1px solid',
                                }}
                              />
                            )}
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              sx={{
                                flex: 1,
                                minWidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={rec.title}
                            >
                              {rec.title}
                            </Typography>
                          </Box>
                          <Stack spacing={0.5}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                wordBreak: 'break-word',
                              }}
                            >
                              {rec.description}
                            </Typography>
                            {rec.reason && rec.reason.length > 0 && (
                              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
                                <Sparkles size={12} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    wordBreak: 'break-word',
                                    whiteSpace: 'normal',
                                    flex: 1,
                                    minWidth: 0,
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {rec.reason}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </Box>
                      </Box>
                    </Box>
                  </Link>
                </motion.div>
              );
            })}
          </Stack>
        )}

        <Link href={userRole === "freelancer" ? "/orders?ai-recommended=true" : "/freelancers?ai-recommended=true"} style={{ textDecoration: 'none' }}>
          <Button variant="outlined" fullWidth startIcon={<Bot size={16} />} endIcon={<ArrowRight size={16} />}>
            Все рекомендации
          </Button>
        </Link>
      </Stack>
    </>
  );

  if (loading) {
    return embedded ? (
      <Box>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="rectangular" height={80} sx={{ mt: 1 }} />
        <Skeleton variant="rectangular" height={80} sx={{ mt: 1 }} />
        <Skeleton variant="rectangular" height={80} sx={{ mt: 1 }} />
      </Box>
    ) : (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
            <Bot size={20} className="animate-pulse" />
            <Typography variant="h6">AI Рекомендации</Typography>
          </Box>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="rectangular" height={80} sx={{ mt: 1 }} />
          <Skeleton variant="rectangular" height={80} sx={{ mt: 1 }} />
          <Skeleton variant="rectangular" height={80} sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    );
  }

  if (embedded) {
    return content;
  }

  return (
    <Card sx={{ position: 'sticky', top: 96 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <div className="relative">
              <Bot size={20} />
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <Typography variant="h6">AI Рекомендации</Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => fetchRecommendations(false)}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </IconButton>
        </Box>
        {content}
      </CardContent>
    </Card>
  );
}
