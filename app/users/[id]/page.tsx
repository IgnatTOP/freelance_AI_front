"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Layout, Card, Row, Col, Typography, Space, Avatar, Tag, Button, Skeleton, Empty, Tabs } from "antd";
import { toastService } from "@/src/shared/lib/toast";
import { User, Briefcase, Star, MapPin, Mail, Calendar, FileText, ExternalLink, Image as ImageIcon, DollarSign } from "lucide-react";
import { useAuth } from "@/src/shared/lib/hooks";
import { authService } from "@/src/shared/lib/auth/auth.service";
import Link from "next/link";
import { getUserPortfolio } from "@/src/shared/api/portfolio";
import type { PortfolioItemWithMedia } from "@/src/entities/portfolio/model/types";
import { getMediaUrl } from "@/src/shared/lib/api/axios";
import api from "@/src/shared/lib/api/axios";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
  profile?: {
    display_name?: string;
    bio?: string;
    experience_level?: string;
    skills?: string[];
    location?: string;
    hourly_rate?: number;
    rating?: number;
    completed_orders?: number;
  };
  portfolio?: any[];
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  // Хуки должны вызываться в начале компонента, до любых условных возвратов
  const { user } = useAuth({ requireAuth: false });
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItemWithMedia[]>([]);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  // Обновляем профиль при изменении роли (слушаем изменения в localStorage)
  useEffect(() => {
    const handleStorageChange = () => {
      const user = authService.getCurrentUser();
      if (user && String(user.id) === userId) {
        loadUserProfile();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Также слушаем события на этой же вкладке
    window.addEventListener('userRoleChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userRoleChanged', handleStorageChange);
    };
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${userId}`);
      setUserProfile({
        id: response.data.user.id,
        username: response.data.user.username,
        email: response.data.user.email,
        role: response.data.user.role,
        created_at: response.data.user.created_at,
        profile: response.data.profile,
      });

      // Загружаем портфолио только для фрилансеров
      if (response.data.user.role === "freelancer") {
        try {
          const portfolioItems = await getUserPortfolio(userId);
          setPortfolio(Array.isArray(portfolioItems) ? portfolioItems : []);
        } catch (err) {
          console.error("Failed to load portfolio:", err);
          setPortfolio([]);
        }
      } else {
        setPortfolio([]);
      }
    } catch (error: any) {
      console.error("Failed to load user profile:", error);
      toastService.error("Не удалось загрузить профиль пользователя");
    } finally {
      setLoading(false);
    }
  };

  const getExperienceLevelLabel = (level?: string) => {
    switch (level) {
      case "junior":
        return "Начинающий";
      case "middle":
        return "Средний";
      case "senior":
        return "Опытный";
      default:
        return "Не указан";
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh", background: "transparent" }}>
        <Content style={{ padding: "24px" }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Content>
      </Layout>
    );
  }

  if (!userProfile) {
    return (
      <Layout style={{ minHeight: "100vh", background: "transparent" }}>
        <Content style={{ padding: "24px" }}>
          <Empty description="Пользователь не найден" />
        </Content>
      </Layout>
    );
  }

  const isCurrentUser = user?.id ? String(user.id) === userId : false;

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Content style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Card>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={6} style={{ textAlign: "center" }}>
                <Avatar
                  size={120}
                  style={{
                    background: "var(--primary-06)",
                    color: "var(--primary)",
                    fontSize: 48,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  {(userProfile.profile?.display_name || userProfile.username)?.charAt(0).toUpperCase()}
                </Avatar>
                <Title level={3} style={{ marginBottom: 8 }}>
                  {userProfile.profile?.display_name || userProfile.username}
                </Title>
                <Text type="secondary">@{userProfile.username}</Text>
                <div style={{ marginTop: 16 }}>
                  <Tag color={userProfile.role === "client" ? "blue" : "green"}>
                    {userProfile.role === "client" ? "Заказчик" : "Фрилансер"}
                  </Tag>
                </div>
              </Col>
              <Col xs={24} md={18}>
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  {userProfile.profile?.bio && (
                    <div>
                      <Title level={5}>О себе</Title>
                      <Paragraph style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {userProfile.profile.bio}
                      </Paragraph>
                    </div>
                  )}

                  <Row gutter={[16, 16]}>
                    {userProfile.profile?.experience_level && (
                      <Col xs={24} sm={12}>
                        <Space>
                          <Briefcase size={18} />
                          <Text>
                            <strong>Уровень:</strong> {getExperienceLevelLabel(userProfile.profile.experience_level)}
                          </Text>
                        </Space>
                      </Col>
                    )}
                    {userProfile.profile?.hourly_rate !== undefined && userProfile.profile.hourly_rate !== null && (
                      <Col xs={24} sm={12}>
                        <Space>
                          <DollarSign size={18} />
                          <Text>
                            <strong>Ставка в час:</strong> {typeof userProfile.profile.hourly_rate === 'number' 
                              ? `${userProfile.profile.hourly_rate.toLocaleString("ru-RU")} ₽`
                              : `${userProfile.profile.hourly_rate} ₽`}
                          </Text>
                        </Space>
                      </Col>
                    )}
                    {userProfile.profile?.location && (
                      <Col xs={24} sm={12}>
                        <Space>
                          <MapPin size={18} />
                          <Text>
                            <strong>Местоположение:</strong> {userProfile.profile.location}
                          </Text>
                        </Space>
                      </Col>
                    )}
                    {userProfile.profile?.rating && (
                      <Col xs={24} sm={12}>
                        <Space>
                          <Star size={18} fill="#ffc107" color="#ffc107" />
                          <Text>
                            <strong>Рейтинг:</strong> {userProfile.profile.rating.toFixed(1)} / 5.0
                          </Text>
                        </Space>
                      </Col>
                    )}
                    {userProfile.profile?.completed_orders !== undefined && (
                      <Col xs={24} sm={12}>
                        <Space>
                          <FileText size={18} />
                          <Text>
                            <strong>Завершено проектов:</strong> {userProfile.profile.completed_orders}
                          </Text>
                        </Space>
                      </Col>
                    )}
                    <Col xs={24} sm={12}>
                      <Space>
                        <Calendar size={18} />
                        <Text>
                          <strong>На платформе с:</strong>{" "}
                          {userProfile.created_at
                            ? new Date(userProfile.created_at).toLocaleDateString("ru-RU", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Не указано"}
                        </Text>
                      </Space>
                    </Col>
                  </Row>

                  {userProfile.profile?.skills && userProfile.profile.skills.length > 0 && (
                    <div>
                      <Title level={5}>Навыки</Title>
                      <Space wrap>
                        {userProfile.profile.skills.map((skill, idx) => (
                          <Tag key={idx} color="blue">
                            {skill}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>

          {userProfile.role === "freelancer" && (
            <Card>
              <Tabs
                items={[
                  {
                    key: "portfolio",
                    label: "Портфолио",
                    children: (
                      <div>
                        {portfolio.length === 0 ? (
                          <Empty description="Портфолио пусто" />
                        ) : (
                          <Row gutter={[16, 16]}>
                            {portfolio.map((item) => {
                              const getCoverImageUrl = () => {
                                if (item.cover_media_id && item.media) {
                                  const coverMedia = item.media.find((m) => m.id === item.cover_media_id);
                                  if (coverMedia) {
                                    return getMediaUrl(coverMedia.file_path);
                                  }
                                }
                                if (item.media && item.media.length > 0) {
                                  return getMediaUrl(item.media[0].file_path);
                                }
                                return null;
                              };
                              const coverUrl = getCoverImageUrl();
                              return (
                                <Col xs={24} sm={12} md={8} key={item.id}>
                                  <Card
                                    hoverable
                                    cover={
                                      coverUrl ? (
                                        <div style={{ height: 200, overflow: "hidden" }}>
                                          <img
                                            alt={item.title}
                                            src={coverUrl}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                          />
                                        </div>
                                      ) : (
                                        <div
                                          style={{
                                            height: 200,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: "#f0f0f0",
                                          }}
                                        >
                                          <ImageIcon size={48} color="#999" />
                                        </div>
                                      )
                                    }
                                  >
                                    <Card.Meta
                                      title={
                                        <div>
                                          <Text strong>{item.title}</Text>
                                          {item.external_link && (
                                            <a
                                              href={item.external_link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{ marginLeft: 8 }}
                                            >
                                              <ExternalLink size={14} />
                                            </a>
                                          )}
                                        </div>
                                      }
                                      description={
                                        <div>
                                          {item.description && (
                                            <Paragraph
                                              ellipsis={{ rows: 2, expandable: false }}
                                              type="secondary"
                                              style={{ marginBottom: 8 }}
                                            >
                                              {item.description}
                                            </Paragraph>
                                          )}
                                          {item.ai_tags && item.ai_tags.length > 0 && (
                                            <Space wrap size={[4, 4]}>
                                              {item.ai_tags.map((tag, idx) => (
                                                <Tag key={idx} color="blue" style={{ margin: 0 }}>
                                                  {tag}
                                                </Tag>
                                              ))}
                                            </Space>
                                          )}
                                        </div>
                                      }
                                    />
                                  </Card>
                                </Col>
                              );
                            })}
                          </Row>
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          )}

          {isCurrentUser && (
            <div style={{ textAlign: "center" }}>
              <Link href="/profile">
                <Button type="primary">Редактировать профиль</Button>
              </Link>
            </div>
          )}
        </Space>
      </Content>
    </Layout>
  );
}

