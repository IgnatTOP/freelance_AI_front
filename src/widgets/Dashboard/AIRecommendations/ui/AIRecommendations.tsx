"use client";

import { useEffect, useState } from "react";
import { Card, Button, Empty, Skeleton, notification, List, Tag, Space, Typography, Row, Col } from "antd";
import { Bot, Sparkles, TrendingUp, Target, Zap, ArrowRight, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { aiService } from "@/src/shared/lib/ai";
import { getOrder, getOrders, getMyOrders } from "@/src/shared/api/orders";
import { cleanExplanationText } from "@/src/shared/lib/ai/ai-utils";

const { Text, Paragraph } = Typography;

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
        notification.error({
          message: "Ошибка",
          description: "Не удалось загрузить рекомендации. Попробуйте обновить.",
        });
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

  const content = (
    <>
      {!embedded && (
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
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
            <span style={{ fontWeight: 600 }}>AI Рекомендации</span>
          </Space>
          <Button
            type="text"
            size="small"
            icon={<RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />}
            onClick={() => fetchRecommendations(false)}
            disabled={refreshing}
          />
        </Space>
      )}
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {userRole === "freelancer"
            ? "Подобрали заказы специально для вас"
            : "Лучшие исполнители для ваших проектов"}
        </Text>

        {explanation && explanation.trim() && (
          <Card
            size="small"
            style={{
              background: 'var(--primary-06)',
              borderColor: 'var(--primary-18)',
              marginBottom: 16,
              overflow: 'visible',
              wordBreak: 'break-word',
            }}
            styles={{
              body: { padding: '12px' }
            }}
          >
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text strong style={{ fontSize: '12px', color: 'var(--primary)' }}>
                Почему эти заказы?
              </Text>
              <Text 
                style={{ 
                  fontSize: '12px',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                  lineHeight: '1.6',
                  display: 'block',
                  maxHeight: 'none',
                  overflow: 'visible',
                }}
              >
                {explanation}
              </Text>
            </Space>
          </Card>
        )}

        {recommendations.length === 0 ? (
          <Empty
            description="Пока нет рекомендаций"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={recommendations}
            renderItem={(rec, index) => {
              const Icon = getIcon(rec.type);
              return (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link href={rec.href}>
                    <List.Item
                      style={{
                        cursor: 'pointer',
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '8px',
                        background: 'var(--primary-05)',
                        borderColor: 'var(--primary-12)',
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                      }}
                      className="hover:border-primary/50"
                    >
                      <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                        <div style={{
                          background: 'var(--primary-06)',
                          padding: '8px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          height: 'fit-content',
                        }}>
                          <Icon size={18} style={{ color: 'var(--primary)' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            flexWrap: 'nowrap',
                            width: '100%',
                            marginBottom: '8px',
                          }}>
                            {rec.match_score > 0 && (
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: rec.match_score >= 0.9 
                                    ? 'rgba(82, 196, 26, 0.15)' 
                                    : rec.match_score >= 0.75 
                                    ? 'rgba(250, 173, 20, 0.15)' 
                                    : 'rgba(24, 144, 255, 0.15)',
                                  border: `1px solid ${rec.match_score >= 0.9 
                                    ? 'rgba(82, 196, 26, 0.3)' 
                                    : rec.match_score >= 0.75 
                                    ? 'rgba(250, 173, 20, 0.3)' 
                                    : 'rgba(24, 144, 255, 0.3)'}`,
                                  color: rec.match_score >= 0.9 
                                    ? '#52c41a' 
                                    : rec.match_score >= 0.75 
                                    ? '#faad14' 
                                    : '#1890ff',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  flexShrink: 0,
                                  lineHeight: '20px',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <Zap size={12} style={{ display: 'inline-block' }} />
                                <span>{Math.min(Math.round(rec.match_score * 100), 100)}%</span>
                              </div>
                            )}
                            <Text 
                              strong 
                              style={{ 
                                fontSize: '13px',
                                flex: 1,
                                minWidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                lineHeight: '20px',
                              }}
                              title={rec.title}
                            >
                              {rec.title}
                            </Text>
                          </div>
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Paragraph
                              ellipsis={{ rows: 2, expandable: false }}
                              style={{ 
                                fontSize: '12px', 
                                margin: 0,
                                wordBreak: 'break-word',
                                overflow: 'hidden',
                              }}
                              type="secondary"
                            >
                              {rec.description}
                            </Paragraph>
                            {rec.reason && rec.reason.length > 0 && (
                              <div style={{ width: '100%', display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
                                <Sparkles size={12} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                                <Text 
                                  type="secondary" 
                                  style={{ 
                                    fontSize: '12px',
                                    wordBreak: 'break-word',
                                    whiteSpace: 'normal',
                                    flex: 1,
                                    minWidth: 0,
                                    lineHeight: '1.4',
                                  }}
                                >
                                  {rec.reason}
                                </Text>
                              </div>
                            )}
                          </Space>
                        </div>
                      </div>
                    </List.Item>
                  </Link>
                </motion.div>
              );
            }}
          />
        )}

        <Link href={userRole === "freelancer" ? "/orders?ai-recommended=true" : "/freelancers?ai-recommended=true"}>
          <Button type="default" block icon={<Bot size={16} />}>
            Все рекомендации
            <ArrowRight size={16} />
          </Button>
        </Link>
      </Space>
    </>
  );

  if (loading) {
    return embedded ? (
      <Skeleton active paragraph={{ rows: 3 }} />
    ) : (
      <Card
        title={
          <Space>
            <Bot size={20} className="animate-pulse" />
            AI Рекомендации
          </Space>
        }
      >
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    );
  }

  if (embedded) {
    return content;
  }

  return (
    <Card
      title={
        <Space>
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
          <span>AI Рекомендации</span>
        </Space>
      }
      extra={
        <Button
          type="text"
          icon={<RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />}
          onClick={() => fetchRecommendations(false)}
          disabled={refreshing}
        />
      }
      style={{ position: 'sticky', top: 96 }}
    >
      {content}
    </Card>
  );
}
