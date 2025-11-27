"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Typography, Skeleton, theme, Space, Alert, Button } from "antd";
import { toastService } from "@/src/shared/lib/toast";
import { motion } from "framer-motion";
import { Form } from "antd";
import { Edit3, Info, Lightbulb, CheckCircle, FolderKanban, Plus } from "lucide-react";
import Link from "next/link";
import { EditProfileForm } from "./EditProfileForm";
import { getProfile, updateProfile } from "@/src/shared/api/profile";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { useAuth } from "@/src/shared/lib/hooks/useAuth";
import type { Profile, UpdateProfileRequest } from "@/src/entities/user/model/types";

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

export function EditProfileFeature() {
  const { token } = useToken();
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!authLoading) {
      const userData = authService.getCurrentUser();
      if (userData) setUser(userData);
      loadProfile();
    }
  }, [authLoading]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profileData = await getProfile();

      setProfile(profileData);
      setSkills(profileData.skills || []);
      form.setFieldsValue({
        display_name: profileData.display_name,
        bio: profileData.bio || "",
        hourly_rate: profileData.hourly_rate,
        experience_level: profileData.experience_level,
        location: profileData.location || "",
      });

      // Обновляем локальный профиль в localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("profile", JSON.stringify(profileData));
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      // Fallback на локальные данные
      const profileData = authService.getCurrentProfile();
      if (profileData) {
        setProfile(profileData);
        setSkills(profileData.skills || []);
        form.setFieldsValue({
          display_name: profileData.display_name,
          bio: profileData.bio || "",
          hourly_rate: profileData.hourly_rate,
          experience_level: profileData.experience_level,
          location: profileData.location || "",
        });
      } else {
        toastService.error("Ошибка загрузки профиля");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      const updateData: UpdateProfileRequest = {
        display_name: values.display_name,
        bio: values.bio,
        hourly_rate: values.hourly_rate,
        experience_level: values.experience_level,
        skills: skills,
        location: values.location,
      };

      const updatedProfile = await updateProfile(updateData);

      // Обновляем локальный профиль в localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("profile", JSON.stringify(updatedProfile));
      }
      setProfile(updatedProfile);
      // Toast показывается автоматически через axios interceptor
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Ошибка обновления профиля");
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "40px 24px",
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Card
          style={{
            borderRadius: token.borderRadiusLG,
            borderColor: token.colorBorder,
          }}
        >
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 24px",
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Space direction="vertical" size={32} style={{ width: "100%" }}>
          {/* Header */}
          <div>
            <Title
              level={1}
              style={{
                margin: 0,
                fontSize: 32,
                lineHeight: "40px",
                fontWeight: 600,
              }}
            >
              Редактирование профиля
            </Title>
            <Text
              type="secondary"
              style={{
                fontSize: 14,
                lineHeight: "22px",
                display: "block",
                marginTop: 8,
              }}
            >
              Обновите информацию о себе, чтобы заказчики или фрилансеры знали о вас больше
            </Text>
          </div>

          {/* Content */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(1, 1fr)",
              gap: 24,
            }}
            className="lg:grid-cols-3"
          >
            {/* Main Form */}
            <div style={{ gridColumn: "span 1" }} className="lg:col-span-2">
              <Card
                style={{
                  borderRadius: token.borderRadiusLG,
                  borderColor: token.colorBorder,
                }}
                styles={{
                  body: { padding: 0 },
                }}
              >
                {/* Card Header */}
                <div
                  style={{
                    padding: "24px 24px 16px 24px",
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  <Space align="center" size={16}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: token.borderRadiusLG,
                        background: `${token.colorPrimary}10`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Edit3
                        size={28}
                        strokeWidth={2}
                        style={{ color: token.colorPrimary }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Title
                        level={2}
                        style={{
                          margin: 0,
                          fontSize: 24,
                          lineHeight: "32px",
                          fontWeight: 600,
                        }}
                      >
                        Основная информация
                      </Title>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 14,
                          lineHeight: "22px",
                          display: "block",
                          marginTop: 4,
                        }}
                      >
                        Заполните детали вашего профиля
                      </Text>
                    </div>
                  </Space>
                </div>

                {/* Form */}
                <div style={{ padding: 24 }}>
                  <EditProfileForm
                    form={form}
                    skills={skills}
                    onSkillsChange={setSkills}
                    onSubmit={handleSubmit}
                    loading={saving}
                  />
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
                gridColumn: "span 1",
              }}
            >
              {/* Tips Card */}
              <Card
                style={{
                  borderRadius: token.borderRadiusLG,
                  borderColor: token.colorBorder,
                }}
                styles={{
                  body: { padding: 24 },
                }}
              >
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  <Space align="center" size={12}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: token.borderRadius,
                        background: `${token.colorWarning}1A`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Lightbulb
                        size={20}
                        style={{ color: token.colorWarning }}
                      />
                    </div>
                    <Title
                      level={4}
                      style={{
                        margin: 0,
                        fontSize: 16,
                        lineHeight: "24px",
                        fontWeight: 600,
                      }}
                    >
                      Советы
                    </Title>
                  </Space>

                  <div style={{ paddingLeft: 52 }}>
                    <Space direction="vertical" size={12}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <CheckCircle
                          size={16}
                          style={{
                            color: token.colorSuccess,
                            flexShrink: 0,
                            marginTop: 3,
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 14,
                            lineHeight: "22px",
                            color: token.colorTextSecondary,
                          }}
                        >
                          Заполните все поля для создания полного профиля
                        </Text>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <CheckCircle
                          size={16}
                          style={{
                            color: token.colorSuccess,
                            flexShrink: 0,
                            marginTop: 3,
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 14,
                            lineHeight: "22px",
                            color: token.colorTextSecondary,
                          }}
                        >
                          Добавьте как можно больше навыков
                        </Text>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <CheckCircle
                          size={16}
                          style={{
                            color: token.colorSuccess,
                            flexShrink: 0,
                            marginTop: 3,
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 14,
                            lineHeight: "22px",
                            color: token.colorTextSecondary,
                          }}
                        >
                          Укажите реалистичную почасовую ставку
                        </Text>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <CheckCircle
                          size={16}
                          style={{
                            color: token.colorSuccess,
                            flexShrink: 0,
                            marginTop: 3,
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 14,
                            lineHeight: "22px",
                            color: token.colorTextSecondary,
                          }}
                        >
                          Обновляйте профиль регулярно
                        </Text>
                      </div>
                    </Space>
                  </div>
                </Space>
              </Card>

              {/* Portfolio Card - только для фрилансеров */}
              {user && (user.role === "admin" ? "client" : user.role) === "freelancer" && (
                <Card
                  style={{
                    borderRadius: token.borderRadiusLG,
                    borderColor: token.colorPrimary,
                    background: `linear-gradient(135deg, ${token.colorPrimary}08 0%, ${token.colorPrimary}03 100%)`,
                  }}
                  styles={{
                    body: { padding: 24 },
                  }}
                >
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <Space align="center" size={12}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: token.borderRadius,
                          background: `${token.colorPrimary}1A`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FolderKanban
                          size={20}
                          style={{ color: token.colorPrimary }}
                        />
                      </div>
                      <Title
                        level={4}
                        style={{
                          margin: 0,
                          fontSize: 16,
                          lineHeight: "24px",
                          fontWeight: 600,
                        }}
                      >
                        Портфолио
                      </Title>
                    </Space>
                    <Text
                      style={{
                        fontSize: 14,
                        lineHeight: "22px",
                        color: token.colorTextSecondary,
                      }}
                    >
                      Покажите свои лучшие работы заказчикам. Добавьте проекты в портфолио, чтобы увеличить шансы получить заказ.
                    </Text>
                    <Link href="/portfolio">
                      <Button
                        type="primary"
                        icon={<Plus size={16} />}
                        block
                        style={{
                          height: 40,
                          borderRadius: token.borderRadius,
                        }}
                      >
                        Управлять портфолио
                      </Button>
                    </Link>
                  </Space>
                </Card>
              )}

              {/* Info Card */}
              <Alert
                message={
                  <Text strong style={{ fontSize: 14, lineHeight: "22px" }}>
                    Информация о профиле
                  </Text>
                }
                description={
                  <Paragraph
                    style={{
                      margin: "8px 0 0 0",
                      fontSize: 14,
                      lineHeight: "22px",
                      color: token.colorTextSecondary,
                    }}
                  >
                    Ваш профиль виден всем пользователям платформы. Чем полнее
                    профиль, тем выше шанс получить заказ или найти исполнителя.
                  </Paragraph>
                }
                type="info"
                showIcon
                icon={<Info size={16} />}
                style={{
                  borderRadius: token.borderRadius,
                }}
              />
            </div>
          </div>
        </Space>
      </motion.div>
    </div>
  );
}
