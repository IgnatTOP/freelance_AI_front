"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Layout, Card, Row, Col, Input, Avatar, Typography, Space, Button, Skeleton, Empty } from "antd";
import { toastService } from "@/src/shared/lib/toast";
import { Search, User, Star, Briefcase, MapPin } from "lucide-react";
import { authService } from "@/src/shared/lib/auth/auth.service";
import Link from "next/link";
import api from "@/src/shared/lib/api/axios";

const { Content } = Layout;
const { Title, Text } = Typography;

interface Freelancer {
  id: string;
  username: string;
  display_name?: string;
  email: string;
  role: string;
  profile?: {
    display_name?: string;
    bio?: string;
    experience_level?: string;
    skills?: string[];
    location?: string;
    rating?: number;
    completed_orders?: number;
  };
}

function FreelancersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toastService.warning("Необходимо авторизоваться");
      router.push("/auth/login");
      return;
    }

    loadFreelancers();
  }, [router]);

  const loadFreelancers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Получаем список заказов и извлекаем фрилансеров из предложений
      // В реальном приложении здесь должен быть отдельный endpoint для списка фрилансеров
      const { getOrders } = await import("@/src/shared/api/orders");
      const response = await getOrders({ limit: 100 });
      const orders = response?.data || [];

      // Если заказов нет, просто показываем пустой список
      if (!Array.isArray(orders) || orders.length === 0) {
        setFreelancers([]);
        setLoading(false);
        return;
      }

      // Собираем уникальных фрилансеров из предложений
      const freelancerIds = new Set<string>();
      const freelancersMap = new Map<string, Freelancer>();

      // Получаем proposals для каждого заказа отдельно
      const { getOrderProposals } = await import("@/src/shared/api/proposals");

      for (const order of orders) {
        if (!order?.id) continue;

        try {
          // Получаем proposals для заказа
          const proposalsResponse = await getOrderProposals(order.id);
          const proposals = proposalsResponse?.proposals || [];

          if (!Array.isArray(proposals)) continue;

          for (const proposal of proposals) {
            if (proposal?.freelancer_id && !freelancerIds.has(proposal.freelancer_id)) {
              freelancerIds.add(proposal.freelancer_id);
              try {
                const userResponse = await api.get(`/users/${proposal.freelancer_id}`);
                const user = userResponse?.data?.user;
                if (user && user.role === "freelancer") {
                  freelancersMap.set(user.id, {
                    id: user.id,
                    username: user.username || "",
                    display_name: user.display_name,
                    email: user.email || "",
                    role: user.role,
                    profile: userResponse.data.profile,
                  });
                }
              } catch (err) {
                console.error(`Failed to load user ${proposal.freelancer_id}:`, err);
              }
            }
          }
        } catch (err) {
          // Игнорируем ошибки получения proposals для отдельных заказов
          console.error(`Failed to load proposals for order ${order.id}:`, err);
        }
      }

      setFreelancers(Array.from(freelancersMap.values()));
    } catch (error: any) {
      console.error("Failed to load freelancers:", error);
      setError("Не удалось загрузить список фрилансеров");
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFreelancers = (freelancers || []).filter((f) => {
    if (!f) return false;
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      f.username?.toLowerCase().includes(searchLower) ||
      f.display_name?.toLowerCase().includes(searchLower) ||
      f.profile?.bio?.toLowerCase().includes(searchLower) ||
      f.profile?.skills?.some((s) => s?.toLowerCase().includes(searchLower))
    );
  });

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Content style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Title level={2}>Фрилансеры</Title>
            <Text type="secondary">Найдите подходящего исполнителя для вашего проекта</Text>
          </div>

          <Input
            size="large"
            placeholder="Поиск по имени, навыкам или описанию..."
            prefix={<Search size={18} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: "600px" }}
          />

          {loading ? (
            <Row gutter={[16, 16]}>
              {[1, 2, 3, 4].map((i) => (
                <Col xs={24} sm={12} md={8} lg={6} key={i}>
                  <Card>
                    <Skeleton active avatar paragraph={{ rows: 2 }} />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : error ? (
            <Empty
              description={error}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={loadFreelancers}>
                Попробовать снова
              </Button>
            </Empty>
          ) : filteredFreelancers.length === 0 ? (
            <Empty
              description={search ? "По вашему запросу фрилансеры не найдены" : "Фрилансеры пока не зарегистрированы на платформе"}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Row gutter={[16, 16]}>
              {filteredFreelancers.map((freelancer) => (
                <Col xs={24} sm={12} md={8} lg={6} key={freelancer.id}>
                  <Link href={`/users/${freelancer.id}`}>
                    <Card
                      hoverable
                      style={{ height: "100%" }}
                      actions={[
                        <Button type="link" key="view">
                          Посмотреть профиль
                        </Button>,
                      ]}
                    >
                      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                        <div style={{ textAlign: "center" }}>
                          <Avatar
                            size={64}
                            style={{
                              background: "var(--primary-06)",
                              color: "var(--primary)",
                              fontSize: 24,
                              fontWeight: 600,
                            }}
                          >
                            {(freelancer.display_name || freelancer.username)?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Title level={4} style={{ marginTop: 12, marginBottom: 4 }}>
                            {freelancer.display_name || freelancer.username}
                          </Title>
                          <Text type="secondary">@{freelancer.username}</Text>
                        </div>

                        {freelancer.profile?.bio && (
                          <Text
                            type="secondary"
                            ellipsis
                            style={{ 
                              fontSize: 12, 
                              display: "-webkit-box", 
                              WebkitLineClamp: 2, 
                              WebkitBoxOrient: "vertical", 
                              overflow: "hidden",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word"
                            }}
                          >
                            {freelancer.profile.bio}
                          </Text>
                        )}

                        <Space direction="vertical" size="small" style={{ width: "100%" }}>
                          {freelancer.profile?.experience_level && (
                            <Space size="small">
                              <Briefcase size={14} />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {freelancer.profile.experience_level}
                              </Text>
                            </Space>
                          )}
                          {freelancer.profile?.location && (
                            <Space size="small">
                              <MapPin size={14} />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {freelancer.profile.location}
                              </Text>
                            </Space>
                          )}
                          {freelancer.profile?.rating && (
                            <Space size="small">
                              <Star size={14} fill="#ffc107" color="#ffc107" />
                              <Text style={{ fontSize: 12 }}>
                                {freelancer.profile.rating.toFixed(1)}
                              </Text>
                            </Space>
                          )}
                        </Space>

                        {freelancer.profile?.skills && freelancer.profile.skills.length > 0 && (
                          <div>
                            {freelancer.profile.skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                style={{
                                  display: "inline-block",
                                  padding: "2px 8px",
                                  margin: "2px",
                                  background: "var(--primary-06)",
                                  borderRadius: "4px",
                                  fontSize: 11,
                                  color: "var(--primary)",
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                            {freelancer.profile.skills.length > 3 && (
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                +{freelancer.profile.skills.length - 3}
                              </Text>
                            )}
                          </div>
                        )}
                      </Space>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          )}
        </Space>
      </Content>
    </Layout>
  );
}

export default function FreelancersPage() {
  return (
    <Suspense fallback={
      <Layout style={{ minHeight: "100vh", background: "transparent" }}>
        <Content style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
          <Row gutter={[16, 16]}>
            {[1, 2, 3, 4].map((i) => (
              <Col xs={24} sm={12} md={8} lg={6} key={i}>
                <Card>
                  <Skeleton active avatar paragraph={{ rows: 2 }} />
                </Card>
              </Col>
            ))}
          </Row>
        </Content>
      </Layout>
    }>
      <FreelancersPageContent />
    </Suspense>
  );
}

