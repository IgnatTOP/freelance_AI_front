"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, Typography, Skeleton, Stack, Alert, Button, Box } from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import { motion } from "framer-motion";
import { Edit3, Info, Lightbulb, CheckCircle, FolderKanban, Plus } from "lucide-react";
import Link from "next/link";
import { EditProfileForm } from "./EditProfileForm";
import { getProfile, updateProfile } from "@/src/shared/api/profile";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { useAuth } from "@/src/shared/lib/hooks/useAuth";
import type { Profile, UpdateProfileRequest } from "@/src/entities/user/model/types";

export function EditProfileFeature() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [formData, setFormData] = useState<any>({
    display_name: '',
    bio: '',
    hourly_rate: 0,
    experience_level: '',
    location: '',
  });
  
  // Create form object with stable function references
  const form = useMemo(() => ({
    getFieldValue: (field: string) => {
      return formData[field as keyof typeof formData];
    },
    setFieldValue: (field: string, value: any) => {
      setFormData((prev: typeof formData) => ({ ...prev, [field]: value }));
    },
    setFieldsValue: (values: any) => {
      setFormData((prev: typeof formData) => ({ ...prev, ...values }));
    },
  }), [formData]);
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
      const newFormData = {
        display_name: profileData.display_name,
        bio: profileData.bio || "",
        hourly_rate: profileData.hourly_rate,
        experience_level: profileData.experience_level,
        location: profileData.location || "",
      };
      setFormData(newFormData);

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
        const newFormData = {
          display_name: profileData.display_name,
          bio: profileData.bio || "",
          hourly_rate: profileData.hourly_rate,
          experience_level: profileData.experience_level,
          location: profileData.location || "",
        };
        setFormData(newFormData);
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
      <Box sx={{ minHeight: "100vh", py: 5, px: 3, maxWidth: 1200, mx: "auto", width: "100%" }}>
        <Card sx={{ p: 3, borderRadius: 2 }}>
          <Skeleton variant="text" width="40%" height={40} />
          <Skeleton variant="text" width="60%" sx={{ mt: 1 }} />
          <Skeleton variant="rectangular" height={300} sx={{ mt: 3 }} />
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", py: 5, px: 3, maxWidth: 1200, mx: "auto", width: "100%" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Stack spacing={4}>
          {/* Header */}
          <Box>
            <Typography variant="h3" fontWeight={600} sx={{ mb: 1 }}>
              Редактирование профиля
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Обновите информацию о себе, чтобы заказчики или фрилансеры знали о вас больше
            </Typography>
          </Box>

          {/* Content */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' },
              gap: 3,
            }}
          >
            {/* Main Form */}
            <Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 2' } }}>
              <Card sx={{ borderRadius: 2 }}>
                {/* Card Header */}
                <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Edit3 size={28} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" fontWeight={600}>
                        Основная информация
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Заполните детали вашего профиля
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Form */}
                <Box sx={{ p: 3 }}>
                  <EditProfileForm
                    key={formData.display_name || 'new'}
                    form={form}
                    skills={skills}
                    onSkillsChange={setSkills}
                    onSubmit={handleSubmit}
                    loading={saving}
                  />
                </Box>
              </Card>
            </Box>

            {/* Sidebar */}
            <Stack spacing={3}>
              {/* Tips Card */}
              <Card sx={{ p: 3, borderRadius: 2 }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: 'warning.main',
                        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Lightbulb size={20} />
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      Советы
                    </Typography>
                  </Stack>

                  <Stack spacing={1.5} sx={{ pl: 6.5 }}>
                    <Stack direction="row" spacing={1}>
                      <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 3 }} color="success" />
                      <Typography variant="body2" color="text.secondary">
                        Заполните все поля для создания полного профиля
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 3 }} color="success" />
                      <Typography variant="body2" color="text.secondary">
                        Добавьте как можно больше навыков
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 3 }} color="success" />
                      <Typography variant="body2" color="text.secondary">
                        Укажите реалистичную почасовую ставку
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 3 }} color="success" />
                      <Typography variant="body2" color="text.secondary">
                        Обновляйте профиль регулярно
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>

              {/* Portfolio Card - только для фрилансеров */}
              {user && (user.role === "admin" ? "client" : user.role) === "freelancer" && (
                <Card
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    borderColor: 'primary.main',
                    bgcolor: 'primary.main',
                    backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: 'primary.main',
                          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FolderKanban size={20} />
                      </Box>
                      <Typography variant="h6" fontWeight={600}>
                        Портфолио
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Покажите свои лучшие работы заказчикам. Добавьте проекты в портфолио, чтобы увеличить шансы получить заказ.
                    </Typography>
                    <Link href="/portfolio" style={{ textDecoration: 'none' }}>
                      <Button
                        variant="contained"
                        startIcon={<Plus size={16} />}
                        fullWidth
                        sx={{ height: 40 }}
                      >
                        Управлять портфолио
                      </Button>
                    </Link>
                  </Stack>
                </Card>
              )}

              {/* Info Card */}
              <Alert
                severity="info"
                icon={<Info size={16} />}
                sx={{ borderRadius: 1 }}
              >
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  Информация о профиле
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ваш профиль виден всем пользователям платформы. Чем полнее
                  профиль, тем выше шанс получить заказ или найти исполнителя.
                </Typography>
              </Alert>
            </Stack>
          </Box>
        </Stack>
      </motion.div>
    </Box>
  );
}
