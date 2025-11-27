"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layout, Typography, Row, Col, Skeleton, theme, Card, Space, Button, Avatar, Badge } from "antd";
import { toastService } from "@/src/shared/lib/toast";
import { getStats } from "@/src/shared/api/stats";
import { useAuth } from "@/src/shared/lib/hooks";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target,
  Rocket,
  MessageSquare,
  FileText,
  Users,
  Settings,
  BarChart3,
  Calendar,
  FolderKanban,
} from "lucide-react";
import { ActivityWidget } from "@/src/widgets/Dashboard/ActivityWidget";
import { ProjectsCards } from "@/src/widgets/Dashboard/ProjectsCards";
import { AIHub } from "@/src/widgets/Dashboard/AIHub";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

export default function DashboardPage() {
  const router = useRouter();
  const { token } = useToken();
  const { user, profile, userRole, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    earnings: number;
    trend: {
      projects: number;
      earnings: number;
    };
  } | null>(null);
  const [quickStats, setQuickStats] = useState<{
    rating: number;
    completionRate: number;
    responseTimeHours: number;
    totalReviews: number;
  } | null>(null);

  useEffect(() => {
    if (authLoading) return;

    const loadStats = async () => {
      if (!user || !profile) return;

      setLoading(true);
      try {
        const statsData = await getStats();
        
        if (userRole === "client") {
          setStats({
            totalProjects: statsData.orders.total,
            activeProjects: statsData.orders.in_progress,
            completedProjects: statsData.orders.completed,
            earnings: statsData.balance,
            trend: {
              projects: statsData.orders.total > 0 ? Math.round((statsData.orders.in_progress / statsData.orders.total) * 100) : 0,
              earnings: 0, // TODO: добавить расчет тренда
            },
          });
        } else {
          setStats({
            totalProjects: statsData.proposals.total,
            activeProjects: statsData.proposals.pending,
            completedProjects: statsData.proposals.accepted,
            earnings: statsData.balance,
            trend: {
              projects: statsData.proposals.total > 0 ? Math.round((statsData.proposals.accepted / statsData.proposals.total) * 100) : 0,
              earnings: 0, // TODO: добавить расчет тренда
            },
          });
        }
        
        // Устанавливаем быструю статистику
        setQuickStats({
          rating: statsData.average_rating || 0,
          completionRate: statsData.completion_rate || 0,
          responseTimeHours: statsData.response_time_hours || 0,
          totalReviews: statsData.total_reviews || 0,
        });
      } catch (error: any) {
        console.error("Failed to load stats:", error);
        toastService.error("Не удалось загрузить статистику");
        // Устанавливаем значения по умолчанию
        setStats({
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          earnings: 0,
          trend: { projects: 0, earnings: 0 },
        });
        setQuickStats({
          rating: 0,
          completionRate: 0,
          responseTimeHours: 0,
          totalReviews: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user, profile, userRole, authLoading]);

  // Определение времени суток
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Доброе утро";
    if (hour < 18) return "Добрый день";
    return "Добрый вечер";
  };

  if (authLoading || loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
        <Content style={{ padding: token.paddingLG }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Skeleton active paragraph={{ rows: 1 }} />
            <Skeleton active paragraph={{ rows: 4 }} />
          </Space>
        </Content>
      </Layout>
    );
  }

  // Используем реальные данные из API или значения по умолчанию
  const displayStats = stats || {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    earnings: 0,
    trend: {
      projects: 0,
      earnings: 0,
    },
  };

  const quickActions = userRole === "client"
    ? [
        {
          icon: Rocket,
          title: "Создать проект",
          description: "Опубликуйте новый заказ",
          color: token.colorPrimary,
          href: "/orders/create",
          badge: null,
        },
        {
          icon: Sparkles,
          title: "AI генератор",
          description: "Создать ТЗ с помощью AI",
          color: token.colorPrimary,
          href: "/orders/create?ai=true",
          badge: "NEW",
        },
        {
          icon: Users,
          title: "Фрилансеры",
          description: "Найти исполнителей",
          color: token.colorInfo,
          href: "/freelancers",
          badge: null,
        },
        {
          icon: MessageSquare,
          title: "Сообщения",
          description: "Чаты и уведомления",
          color: token.colorSuccess,
          href: "/messages",
          badge: 3,
        },
        {
          icon: FileText,
          title: "Мои заказы",
          description: "Управление проектами",
          color: token.colorWarning,
          href: "/orders",
          badge: null,
        },
        {
          icon: BarChart3,
          title: "Аналитика",
          description: "Статистика и отчеты",
          color: token.colorError,
          href: "/analytics",
          badge: null,
        },
      ]
    : [
        {
          icon: Target,
          title: "Найти заказы",
          description: "Просмотр активных проектов",
          color: token.colorPrimary,
          href: "/orders",
          badge: null,
        },
        {
          icon: Sparkles,
          title: "AI рекомендации",
          description: "Подходящие заказы для вас",
          color: token.colorPrimary,
          href: "/orders?ai=true",
          badge: "NEW",
        },
        {
          icon: FileText,
          title: "Мои отклики",
          description: "Управление предложениями",
          color: token.colorInfo,
          href: "/proposals",
          badge: null,
        },
        {
          icon: MessageSquare,
          title: "Сообщения",
          description: "Чаты с заказчиками",
          color: token.colorSuccess,
          href: "/messages",
          badge: 5,
        },
        {
          icon: Calendar,
          title: "Мои проекты",
          description: "Активные заказы",
          color: token.colorWarning,
          href: "/my-projects",
          badge: null,
        },
        {
          icon: Settings,
          title: "Профиль",
          description: "Настройки и портфолио",
          color: token.colorError,
          href: "/profile",
          badge: null,
        },
        {
          icon: FolderKanban,
          title: "Портфолио",
          description: "Мои работы и проекты",
          color: token.colorPrimary,
          href: "/portfolio",
          badge: null,
        },
      ];

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Content
        style={{
          padding: `${token.paddingLG}px ${token.paddingXL}px`,
          maxWidth: '1800px',
          margin: '0 auto',
          width: '100%'
        }}
      >
        <Space direction="vertical" size={token.marginXL} style={{ width: '100%' }}>
          {/* HERO SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              style={{
                background: `linear-gradient(135deg, ${token.colorPrimary}15 0%, ${token.colorPrimaryBg} 100%)`,
                borderColor: token.colorBorder,
                borderRadius: token.borderRadiusLG,
              }}
              styles={{
                body: { padding: token.paddingXL }
              }}
            >
              <Row gutter={[token.marginXL, token.marginLG]} align="middle">
                <Col xs={24} md={16}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary" style={{ fontSize: token.fontSize }}>
                      {getGreeting()}, {profile?.display_name || user?.username}!
                    </Text>
                    <Title level={1} style={{ margin: 0, fontSize: token.fontSizeHeading1 }}>
                      {userRole === "client" ? "Управляйте проектами эффективно" : "Найдите идеальный проект"}
                    </Title>
                    <Paragraph type="secondary" style={{ fontSize: token.fontSizeLG, margin: 0 }}>
                      {userRole === "client"
                        ? "У вас 8 активных проектов. 3 ожидают вашего внимания."
                        : "12 новых заказов подходят вашему профилю"
                      }
                    </Paragraph>
                  </Space>
                </Col>
                <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                  <Link href={userRole === "client" ? "/orders/create" : "/orders?ai=true"}>
                    <Button
                      type="primary"
                      size="large"
                      icon={userRole === "client" ? <Rocket size={20} /> : <Sparkles size={20} />}
                      style={{
                        height: 56,
                        fontSize: token.fontSizeLG,
                        borderRadius: token.borderRadiusLG,
                        paddingLeft: token.paddingXL,
                        paddingRight: token.paddingXL,
                      }}
                    >
                      {userRole === "client" ? "Создать проект" : "AI рекомендации"}
                    </Button>
                  </Link>
                </Col>
              </Row>
            </Card>
          </motion.div>

          {/* QUICK METRICS */}
          <Row gutter={[token.margin, token.margin]}>
            {[
              {
                icon: FileText,
                title: userRole === "client" ? "Всего проектов" : "Откликов",
                value: displayStats.totalProjects,
                trend: displayStats.trend.projects,
                color: token.colorPrimary,
              },
              {
                icon: Clock,
                title: "Активных",
                value: displayStats.activeProjects,
                trend: displayStats.activeProjects > 0 ? 5 : 0,
                color: token.colorInfo,
              },
              {
                icon: CheckCircle2,
                title: "Завершено",
                value: displayStats.completedProjects,
                trend: displayStats.completedProjects > 0 ? 10 : 0,
                color: token.colorSuccess,
              },
              {
                icon: Wallet,
                title: userRole === "client" ? "Потрачено" : "Заработано",
                value: displayStats.earnings > 0 
                  ? `${(displayStats.earnings / 1000).toFixed(0)}K ₽`
                  : "0 ₽",
                trend: displayStats.trend.earnings,
                color: token.colorWarning,
              },
            ].map((metric, index) => {
              const Icon = metric.icon;
              const TrendIcon = metric.trend >= 0 ? ArrowUpRight : ArrowDownRight;
              return (
                <Col xs={12} sm={12} md={6} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card
                      hoverable
                      style={{
                        borderColor: token.colorBorder,
                        borderRadius: token.borderRadiusLG,
                        height: '100%',
                      }}
                      styles={{
                        body: { padding: token.paddingLG }
                      }}
                    >
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: token.borderRadiusLG,
                              background: `${metric.color}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Icon size={24} style={{ color: metric.color }} />
                          </div>
                          <Space size={4}>
                            <TrendIcon
                              size={16}
                              style={{ color: metric.trend >= 0 ? token.colorSuccess : token.colorError }}
                            />
                            <Text
                              style={{
                                fontSize: token.fontSizeSM,
                                color: metric.trend >= 0 ? token.colorSuccess : token.colorError,
                              }}
                            >
                              {Math.abs(metric.trend)}%
                            </Text>
                          </Space>
                        </Space>
                        <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                          {metric.title}
                        </Text>
                        <Title level={3} style={{ margin: 0 }}>
                          {metric.value}
                        </Title>
                      </Space>
                    </Card>
                  </motion.div>
                </Col>
              );
            })}
          </Row>

          {/* MAIN LAYOUT */}
          <Row gutter={[token.marginXL, token.marginXL]}>
            {/* MAIN CONTENT */}
            <Col xs={24} lg={14} xl={15}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* ACTION CENTER */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card
                    title={
                      <Space>
                        <Zap size={20} style={{ color: token.colorPrimary }} />
                        <span>Быстрые действия</span>
                      </Space>
                    }
                    style={{
                      borderColor: token.colorBorder,
                      borderRadius: token.borderRadiusLG,
                    }}
                  >
                    <Row gutter={[token.margin, token.margin]}>
                      {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                          <Col xs={12} sm={8} md={8} key={index}>
                            <Link href={action.href}>
                              <motion.div
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Card
                                  hoverable
                                  style={{
                                    borderColor: token.colorBorder,
                                    borderRadius: token.borderRadiusLG,
                                    height: '100%',
                                    cursor: 'pointer',
                                  }}
                                  styles={{
                                    body: { padding: token.padding }
                                  }}
                                >
                                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <Badge count={action.badge} offset={[-5, 5]}>
                                      <div
                                        style={{
                                          width: 40,
                                          height: 40,
                                          borderRadius: token.borderRadius,
                                          background: `${action.color}15`,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        <Icon size={20} style={{ color: action.color }} />
                                      </div>
                                    </Badge>
                                    <Text strong style={{ fontSize: token.fontSize }}>
                                      {action.title}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                                      {action.description}
                                    </Text>
                                  </Space>
                                </Card>
                              </motion.div>
                            </Link>
                          </Col>
                        );
                      })}
                    </Row>
                  </Card>
                </motion.div>

                {/* RECENT ACTIVITY */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <ActivityWidget userRole={userRole} variant="grouped" />
                </motion.div>

                {/* PROJECTS */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <ProjectsCards userRole={userRole} />
                </motion.div>
              </Space>
            </Col>

            {/* SIDEBAR */}
            <Col xs={24} lg={10} xl={9}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* AI HUB */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <AIHub userRole={userRole} />
                </motion.div>

                {/* STATS MINI */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card
                    title={
                      <Space>
                        <BarChart3 size={20} style={{ color: token.colorPrimary }} />
                        <span>Быстрая статистика</span>
                      </Space>
                    }
                    style={{
                      borderColor: token.colorBorder,
                      borderRadius: token.borderRadiusLG,
                    }}
                  >
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Row gutter={[token.margin, token.margin]}>
                        <Col span={12}>
                          <Card
                            style={{
                              background: `${token.colorPrimary}08`,
                              borderColor: token.colorBorder,
                            }}
                            styles={{
                              body: { padding: token.padding }
                            }}
                          >
                            <Space direction="vertical" size={4}>
                              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                                Рейтинг
                              </Text>
                              <Text strong style={{ fontSize: token.fontSizeHeading4 }}>
                                {quickStats?.rating ? `${quickStats.rating.toFixed(1)} ⭐` : "0.0 ⭐"}
                              </Text>
                            </Space>
                          </Card>
                        </Col>
                        <Col span={12}>
                          <Card
                            style={{
                              background: `${token.colorSuccess}08`,
                              borderColor: token.colorBorder,
                            }}
                            styles={{
                              body: { padding: token.padding }
                            }}
                          >
                            <Space direction="vertical" size={4}>
                              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                                Выполнено
                              </Text>
                              <Text strong style={{ fontSize: token.fontSizeHeading4 }}>
                                {quickStats?.completionRate ? `${Math.round(quickStats.completionRate)}%` : "0%"}
                              </Text>
                            </Space>
                          </Card>
                        </Col>
                        <Col span={12}>
                          <Card
                            style={{
                              background: `${token.colorInfo}08`,
                              borderColor: token.colorBorder,
                            }}
                            styles={{
                              body: { padding: token.padding }
                            }}
                          >
                            <Space direction="vertical" size={4}>
                              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                                Ответ
                              </Text>
                              <Text strong style={{ fontSize: token.fontSizeHeading4 }}>
                                {quickStats?.responseTimeHours 
                                  ? quickStats.responseTimeHours < 1 
                                    ? `${Math.round(quickStats.responseTimeHours * 60)} мин`
                                    : `${Math.round(quickStats.responseTimeHours)} ч`
                                  : "—"}
                              </Text>
                            </Space>
                          </Card>
                        </Col>
                        <Col span={12}>
                          <Card
                            style={{
                              background: `${token.colorWarning}08`,
                              borderColor: token.colorBorder,
                            }}
                            styles={{
                              body: { padding: token.padding }
                            }}
                          >
                            <Space direction="vertical" size={4}>
                              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                                Отзывы
                              </Text>
                              <Text strong style={{ fontSize: token.fontSizeHeading4 }}>
                                {quickStats?.totalReviews || 0}
                              </Text>
                            </Space>
                          </Card>
                        </Col>
                      </Row>
                    </Space>
                  </Card>
                </motion.div>
              </Space>
            </Col>
          </Row>
        </Space>
      </Content>
    </Layout>
  );
}
