"use client";

import { useEffect, useState } from "react";
import { Card, Button, Empty, Skeleton, Progress, Alert, Space, Typography, List } from "antd";
import { getMyOrders, getOrders } from "@/src/shared/api/orders";
import { getStats } from "@/src/shared/api/stats";
import { aiService } from "@/src/shared/lib/ai";
import {
  TrendingUp,
  Target,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const { Text, Paragraph } = Typography;

interface Insight {
  id: string;
  type: "success" | "warning" | "info" | "tip";
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  metric?: {
    label: string;
    value: number;
    max: number;
  };
}

interface AIInsightsProps {
  userRole: "client" | "freelancer" | null;
  embedded?: boolean; // Если true, не показываем Card обёртку
}

export function AIInsights({ userRole, embedded = false }: AIInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        // Получаем статистику для генерации инсайтов
        const stats = await getStats();

        // Получаем заказы для анализа
        let orders;
        if (userRole === "client") {
          const ordersResponse = await getMyOrders();
          orders = ordersResponse.as_client || [];
        } else {
          const ordersResponse = await getOrders({
            limit: 10,
            status: "published",
          });
          orders = ordersResponse.data || [];
        }

        const insights: Insight[] = [];

        if (userRole === "freelancer") {
          // Инсайты для фрилансера
          const proposalsTotal = stats.proposals?.total || 0;
          const proposalsAccepted = stats.proposals?.accepted || 0;
          
          if (proposalsTotal > 0) {
            insights.push({
              id: "1",
              type: "success",
              title: "Отличная активность!",
              description: `Вы откликнулись на ${proposalsTotal} заказов. Продолжайте в том же духе!`,
              metric: {
                label: "Откликов отправлено",
                value: proposalsTotal,
                max: Math.max(proposalsTotal, 10),
              },
            });
          }

          if (proposalsAccepted > 0) {
            const successRate = (proposalsAccepted / proposalsTotal) * 100;
            insights.push({
              id: "2",
              type: successRate > 50 ? "success" : "info",
              title: "Успешность откликов",
              description: `Принято ${proposalsAccepted} из ${proposalsTotal} откликов (${successRate.toFixed(0)}%)`,
              metric: {
                label: "Принято откликов",
                value: proposalsAccepted,
                max: proposalsTotal,
              },
            });
          }

          insights.push({
            id: "3",
            type: "tip",
            title: "Улучшите профиль",
            description: "Добавьте больше проектов в портфолио. Это увеличит ваши шансы на получение заказов на 40%.",
            action: {
              label: "Обновить профиль",
              href: "/profile",
            },
          });

          if (orders.length > 0) {
            insights.push({
              id: "4",
              type: "info",
              title: "Новые заказы",
              description: `Доступно ${orders.length} новых заказов, подходящих вашим навыкам.`,
              action: {
                label: "Посмотреть заказы",
                href: "/orders",
              },
            });
          }
        } else {
          // Инсайты для клиента
          const inProgress = stats.orders?.in_progress || 0;
          const total = stats.orders?.total || 0;
          
          if (inProgress > 0) {
            insights.push({
              id: "1",
              type: "success",
              title: "Проекты в работе",
              description: `У вас ${inProgress} активных проекта. Все идет по плану!`,
              metric: {
                label: "Активных проектов",
                value: inProgress,
                max: Math.max(inProgress, 5),
              },
            });
          }

          // Находим заказы без откликов
          const ordersWithoutProposals = orders.filter(
            (order: any) => order.status === "published" && (!order.proposals_count || order.proposals_count === 0)
          );

          if (ordersWithoutProposals.length > 0) {
            const oldestOrder = ordersWithoutProposals[0];
            const daysAgo = Math.floor(
              (Date.now() - new Date(oldestOrder.created_at).getTime()) / (1000 * 60 * 60 * 24)
            );
            
            if (daysAgo >= 3) {
              insights.push({
                id: "2",
                type: "warning",
                title: "Требуется внимание",
                description: `У заказа "${oldestOrder.title}" нет откликов уже ${daysAgo} дней. Попробуйте улучшить описание.`,
                action: {
                  label: "Редактировать заказ",
                  href: `/orders/${oldestOrder.id}`,
                },
              });
            }
          }

          insights.push({
            id: "3",
            type: "tip",
            title: "AI может помочь",
            description: "Используйте AI для улучшения описания заказов и поиска подходящих фрилансеров.",
            action: {
              label: "Попробовать AI",
              href: "/orders/create?ai=true",
            },
          });
        }

        setInsights(insights);
      } catch {
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };

    if (userRole) {
      loadInsights();
    }
  }, [userRole]);

  const getIcon = (type: Insight["type"]) => {
    switch (type) {
      case "success":
        return CheckCircle;
      case "warning":
        return AlertCircle;
      case "info":
        return Target;
      case "tip":
        return Lightbulb;
      default:
        return TrendingUp;
    }
  };

  const getColor = (type: Insight["type"]) => {
    switch (type) {
      case "success":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "warning":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "info":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "tip":
        return "text-purple-400 bg-purple-400/10 border-purple-400/20";
      default:
        return "text-primary bg-primary/10 border-primary/20";
    }
  };

  const getAlertType = (type: Insight["type"]) => {
    switch (type) {
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "info":
        return "info";
      case "tip":
        return "info";
      default:
        return "info";
    }
  };

  const content = (
    <>
      {insights.length === 0 ? (
        <Empty
          description="Пока нет инсайтов"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          dataSource={insights}
          renderItem={(insight, index) => {
            const Icon = getIcon(insight.type);
            const alertType = getAlertType(insight.type);

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Alert
                  message={
                    <Space>
                      <Icon size={18} />
                      <Text strong style={{ fontSize: '14px' }}>
                        {insight.title}
                      </Text>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small" style={{ width: '100%', marginTop: 8 }}>
                      <Paragraph
                        ellipsis={{ rows: 2, expandable: false }}
                        style={{ fontSize: '12px', margin: 0 }}
                      >
                        {insight.description}
                      </Paragraph>

                      {insight.metric && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {insight.metric.label}
                            </Text>
                            <Text style={{ fontSize: '12px', fontWeight: 600 }}>
                              {insight.metric.value} / {insight.metric.max}
                            </Text>
                          </div>
                          <Progress
                            percent={(insight.metric.value / insight.metric.max) * 100}
                            strokeColor={{
                              "0%": "var(--primary)",
                              "100%": "var(--primary-light)",
                            }}
                            trailColor="var(--primary-06)"
                            showInfo={false}
                            size="small"
                          />
                        </div>
                      )}

                      {insight.action && (
                        <Link href={insight.action.href}>
                          <Button
                            type="link"
                            size="small"
                            icon={<ArrowRight size={14} />}
                            style={{ padding: 0, height: 'auto' }}
                          >
                            {insight.action.label}
                          </Button>
                        </Link>
                      )}
                    </Space>
                  }
                  type={alertType}
                  icon={<Icon size={18} />}
                  style={{
                    marginBottom: 16,
                    borderRadius: '12px',
                  }}
                />
              </motion.div>
            );
          }}
        />
      )}
    </>
  );

  if (loading) {
    return embedded ? (
      <Skeleton active paragraph={{ rows: 3 }} />
    ) : (
      <Card
        title={
          <Space>
            <Lightbulb size={20} />
            AI Инсайты
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
            <Lightbulb size={20} />
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [1, 0.6, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <span>AI Инсайты</span>
        </Space>
      }
    >
      {content}
    </Card>
  );
}

