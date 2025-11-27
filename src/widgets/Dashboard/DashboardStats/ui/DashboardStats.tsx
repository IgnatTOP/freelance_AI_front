"use client";

import { useEffect, useState } from "react";
import { Card, Statistic, Progress, Skeleton, Row, Col, Space, theme } from "antd";
import { formatCurrency } from "@/src/shared/lib/utils";
import { getStats } from "@/src/shared/api/stats";
import {
  Briefcase,
  FileText,
  CheckCircle,
  TrendingUp,
  Star,
  Wallet,
  Clock,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";

const { useToken } = theme;

interface Stats {
  orders: {
    total: number;
    open: number;
    in_progress: number;
    completed: number;
    total_proposals?: number;
  };
  proposals?: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  balance: number;
  average_rating: number;
}

interface DashboardStatsProps {
  userRole: "client" | "freelancer" | null;
}

export function DashboardStats({ userRole }: DashboardStatsProps) {
  const { token: antToken } = useToken();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await getStats();
        setStats(statsData);
      } catch (error: any) {
        console.error("Error loading stats:", error);
        setStats({
          orders: {
            total: 0,
            open: 0,
            in_progress: 0,
            completed: 0,
            total_proposals: 0,
          },
          proposals: userRole === "freelancer" ? {
            total: 0,
            pending: 0,
            accepted: 0,
            rejected: 0,
          } : undefined,
          balance: 0,
          average_rating: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    if (userRole) {
      loadStats();
    }
  }, [userRole]);

  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    );
  }

  if (!stats) return null;

  const statsConfig =
    userRole === "client"
      ? [
          {
            title: "Всего заказов",
            value: stats.orders.total,
            icon: Briefcase,
            color: antToken.colorPrimary,
          },
          {
            title: "Активные",
            value: stats.orders.open,
            icon: Clock,
            color: antToken.colorInfo,
          },
          {
            title: "В работе",
            value: stats.orders.in_progress,
            icon: TrendingUp,
            color: antToken.colorWarning,
          },
          {
            title: "Завершено",
            value: stats.orders.completed,
            icon: CheckCircle,
            color: antToken.colorSuccess,
          },
        ]
      : [
          {
            title: "Откликов отправлено",
            value: stats.proposals?.total || 0,
            icon: FileText,
            color: antToken.colorPrimary,
          },
          {
            title: "На рассмотрении",
            value: stats.proposals?.pending || 0,
            icon: Clock,
            color: antToken.colorWarning,
          },
          {
            title: "Принято",
            value: stats.proposals?.accepted || 0,
            icon: CheckCircle,
            color: antToken.colorSuccess,
          },
          {
            title: "Проектов завершено",
            value: stats.orders.completed,
            icon: Award,
            color: antToken.colorPrimary,
          },
        ];

  const successRate =
    userRole === "client"
      ? stats.orders.total > 0
        ? ((stats.orders.completed / stats.orders.total) * 100).toFixed(0)
        : "0"
      : stats.proposals && stats.proposals.total > 0
      ? (((stats.proposals.accepted || 0) / stats.proposals.total) * 100).toFixed(0)
      : "0";

  return (
    <Card
      title={
        <Space>
          <TrendingUp size={18} />
          <span>Статистика</span>
        </Space>
      }
      styles={{
        body: { padding: antToken.paddingLG }
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Main Stats Grid */}
        <Row gutter={[antToken.margin, antToken.margin]}>
          {statsConfig.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Col xs={12} sm={12} md={6} key={stat.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    hoverable
                    styles={{
                      body: { padding: antToken.padding }
                    }}
                    style={{
                      background: `${antToken.colorPrimaryBg}`,
                      borderColor: antToken.colorBorder,
                      borderRadius: antToken.borderRadiusLG,
                    }}
                  >
                    <Statistic
                      title={
                        <span style={{
                          fontSize: antToken.fontSizeSM,
                          color: antToken.colorTextSecondary
                        }}>
                          {stat.title}
                        </span>
                      }
                      value={stat.value}
                      prefix={
                        <Icon
                          size={16}
                          style={{ color: stat.color }}
                        />
                      }
                      valueStyle={{
                        fontSize: antToken.fontSizeHeading3,
                        fontWeight: 'bold',
                        color: antToken.colorText
                      }}
                    />
                  </Card>
                </motion.div>
              </Col>
            );
          })}
        </Row>

        {/* Additional Stats */}
        <Row gutter={[antToken.margin, antToken.margin]}>
          {/* Rating */}
          <Col xs={24} sm={8}>
            <Card
              styles={{
                body: { padding: antToken.padding }
              }}
              style={{
                background: `${antToken.colorPrimaryBg}`,
                borderColor: antToken.colorBorder,
                borderRadius: antToken.borderRadiusLG,
              }}
            >
              <Statistic
                title={
                  <span style={{
                    fontSize: antToken.fontSizeSM,
                    color: antToken.colorTextSecondary
                  }}>
                    Рейтинг
                  </span>
                }
                value={stats.average_rating.toFixed(1)}
                prefix={
                  <Space size={4}>
                    <Star size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                  </Space>
                }
                valueStyle={{
                  fontSize: antToken.fontSizeHeading4,
                  fontWeight: 'bold',
                  color: antToken.colorText
                }}
              />
            </Card>
          </Col>

          {/* Success Rate */}
          <Col xs={24} sm={8}>
            <Card
              styles={{
                body: { padding: antToken.padding }
              }}
              style={{
                background: `${antToken.colorPrimaryBg}`,
                borderColor: antToken.colorBorder,
                borderRadius: antToken.borderRadiusLG,
              }}
            >
              <Statistic
                title={
                  <span style={{
                    fontSize: antToken.fontSizeSM,
                    color: antToken.colorTextSecondary
                  }}>
                    {userRole === "client" ? "Завершено" : "Принято"}
                  </span>
                }
                value={successRate}
                suffix="%"
                valueStyle={{
                  fontSize: antToken.fontSizeHeading4,
                  fontWeight: 'bold',
                  color: antToken.colorSuccess
                }}
              />
              <Progress
                percent={Number(successRate)}
                strokeColor={{
                  "0%": antToken.colorPrimary,
                  "100%": antToken.colorSuccess,
                }}
                trailColor={antToken.colorBgContainer}
                showInfo={false}
                size="small"
                style={{ marginTop: antToken.marginXS }}
              />
            </Card>
          </Col>

          {/* Balance */}
          <Col xs={24} sm={8}>
            <Card
              styles={{
                body: { padding: antToken.padding }
              }}
              style={{
                background: `${antToken.colorPrimaryBg}`,
                borderColor: antToken.colorBorder,
                borderRadius: antToken.borderRadiusLG,
              }}
            >
              <Statistic
                title={
                  <span style={{
                    fontSize: antToken.fontSizeSM,
                    color: antToken.colorTextSecondary
                  }}>
                    Баланс
                  </span>
                }
                value={formatCurrency(stats.balance)}
                prefix={<Wallet size={14} />}
                valueStyle={{
                  fontSize: antToken.fontSizeHeading4,
                  fontWeight: 'bold',
                  color: antToken.colorText
                }}
              />
            </Card>
          </Col>
        </Row>
      </Space>
    </Card>
  );
}
