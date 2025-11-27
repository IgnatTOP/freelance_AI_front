"use client";

import { useState, useEffect } from "react";
import { Layout, Card, Row, Col, Typography, Space, Skeleton, Statistic } from "antd";
import { toastService } from "@/src/shared/lib/toast";
import { TrendingUp, TrendingDown, DollarSign, FileText, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/src/shared/lib/hooks";
import { getStats } from "@/src/shared/api/stats";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function AnalyticsPage() {
  const { userRole, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (authLoading) return;

    const loadStats = async () => {
      try {
        setLoading(true);
        const statsData = await getStats();
        setStats(statsData);
      } catch (error: any) {
        console.error("Failed to load stats:", error);
        toastService.error("Не удалось загрузить статистику");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <Layout style={{ minHeight: "100vh", background: "transparent" }}>
        <Content style={{ padding: "24px" }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Content style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Title level={2}>Аналитика</Title>
            <Text type="secondary">Статистика и отчеты по вашей активности</Text>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title={userRole === "client" ? "Всего проектов" : "Всего откликов"}
                  value={userRole === "client" ? stats?.orders?.total || 0 : stats?.proposals?.total || 0}
                  prefix={<FileText size={20} />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Активных"
                  value={userRole === "client" ? stats?.orders?.in_progress || 0 : stats?.proposals?.pending || 0}
                  prefix={<Clock size={20} />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Завершено"
                  value={userRole === "client" ? stats?.orders?.completed || 0 : stats?.proposals?.accepted || 0}
                  prefix={<CheckCircle2 size={20} />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title={userRole === "client" ? "Потрачено" : "Заработано"}
                  value={stats?.balance || 0}
                  prefix={<DollarSign size={20} />}
                  suffix="₽"
                  valueStyle={{ color: "#fa8c16" }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Детальная статистика">
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Text type="secondary">
                Детальная аналитика будет доступна в следующих версиях приложения.
              </Text>
            </Space>
          </Card>
        </Space>
      </Content>
    </Layout>
  );
}

