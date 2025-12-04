"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, Typography, Skeleton, Stack, Alert, Button, Box, Grid } from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import { Edit3, Info, Lightbulb, FolderKanban, Plus, FileText, Tag, Banknote, RefreshCw } from "lucide-react";
import Link from "next/link";
import { EditProfileForm } from "./EditProfileForm";
import { getProfile, updateProfile } from "@/src/shared/api/profile";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { useAuth } from "@/src/shared/lib/hooks/useAuth";
import { PageContainer } from "@/src/shared/ui";
import { radius, iconSize } from "@/src/shared/lib/constants/design";
import type { Profile, UpdateProfileRequest } from "@/src/entities/user/model/types";

const cardSx = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: `${radius.lg}px`,
};

export function EditProfileFeature() {
  const { loading: authLoading } = useAuth();
  const [formData, setFormData] = useState<any>({
    display_name: '',
    bio: '',
    hourly_rate: 0,
    experience_level: '',
    location: '',
    phone: '',
    telegram: '',
    website: '',
    company_name: '',
    inn: '',
  });
  
  const form = useMemo(() => ({
    getFieldValue: (field: string) => formData[field as keyof typeof formData],
    setFieldValue: (field: string, value: any) => setFormData((prev: typeof formData) => ({ ...prev, [field]: value })),
    setFieldsValue: (values: any) => setFormData((prev: typeof formData) => ({ ...prev, ...values })),
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
      const response = await getProfile();
      const profileData = response.profile;
      setProfile(profileData);
      setSkills(profileData.skills || []);
      setFormData({
        display_name: profileData.display_name || "",
        bio: profileData.bio || "",
        hourly_rate: profileData.hourly_rate || 0,
        experience_level: profileData.experience_level || "",
        location: profileData.location || "",
        phone: profileData.phone || "",
        telegram: profileData.telegram || "",
        website: profileData.website || "",
        company_name: profileData.company_name || "",
        inn: profileData.inn || "",
      });
      authService.setCurrentProfile(profileData);
      if (response.user) {
        authService.setCurrentUser(response.user);
      }
    } catch (error: any) {
      const profileData = authService.getCurrentProfile();
      if (profileData) {
        setProfile(profileData);
        setSkills(profileData.skills || []);
        setFormData({
          display_name: profileData.display_name || "",
          bio: profileData.bio || "",
          hourly_rate: profileData.hourly_rate || 0,
          experience_level: profileData.experience_level || "",
          location: profileData.location || "",
          phone: profileData.phone || "",
          telegram: profileData.telegram || "",
          website: profileData.website || "",
          company_name: profileData.company_name || "",
          inn: profileData.inn || "",
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
        phone: values.phone,
        telegram: values.telegram,
        website: values.website,
        company_name: values.company_name,
        inn: values.inn,
      };
      const updatedProfile = await updateProfile(updateData);
      authService.setCurrentProfile(updatedProfile);
      setProfile(updatedProfile);
      toastService.success("Профиль обновлён");
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Ошибка обновления профиля");
    } finally {
      setSaving(false);
    }
  };

  const userRole = user?.role === "admin" ? "client" : user?.role;

  if (loading || authLoading) {
    return (
      <PageContainer title="Профиль" subtitle="Настройте свой профиль">
        <Card sx={{ ...cardSx, p: 2 }}>
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="rectangular" height={300} sx={{ mt: 2, borderRadius: `${radius.md}px` }} />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Редактирование профиля" subtitle="Обновите информацию о себе">
      <Grid container spacing={3}>
        {/* Main Form */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={cardSx}>
            <Box sx={{ p: 2, borderBottom: "1px solid var(--border)" }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ width: 44, height: 44, borderRadius: `${radius.md}px`, bgcolor: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Edit3 size={iconSize.xl} style={{ color: "#fff" }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 16 }}>Основная информация</Typography>
                  <Typography variant="body2" sx={{ color: "var(--text-muted)", fontSize: 13 }}>Заполните детали профиля</Typography>
                </Box>
              </Stack>
            </Box>
            <Box sx={{ p: 2 }}>
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
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2}>
            {/* Tips */}
            <Card sx={{ ...cardSx, p: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: `${radius.md}px`, bgcolor: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Lightbulb size={iconSize.md} style={{ color: "#fff" }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 14 }}>Советы</Typography>
              </Stack>
              <Stack spacing={1.5}>
                {[
                  { icon: FileText, text: "Заполните все поля профиля" },
                  { icon: Tag, text: "Добавьте больше навыков" },
                  { icon: Banknote, text: "Укажите реалистичную ставку" },
                  { icon: RefreshCw, text: "Обновляйте профиль регулярно" },
                ].map((tip, i) => (
                  <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                    <tip.icon size={iconSize.sm} style={{ color: "var(--primary)" }} />
                    <Typography variant="body2" sx={{ color: "var(--text-muted)", fontSize: 13 }}>{tip.text}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Card>

            {/* Portfolio - only for freelancers */}
            {userRole === "freelancer" && (
              <Card sx={{ ...cardSx, p: 2, bgcolor: "var(--primary)", border: "none" }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 36, height: 36, borderRadius: `${radius.md}px`, bgcolor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FolderKanban size={iconSize.md} style={{ color: "#fff" }} />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>Портфолио</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
                    Покажите лучшие работы заказчикам
                  </Typography>
                  <Link href="/portfolio" style={{ textDecoration: "none" }}>
                    <Button variant="contained" startIcon={<Plus size={iconSize.sm} />} fullWidth sx={{ bgcolor: "rgba(255,255,255,0.2)", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}>
                      Управлять портфолио
                    </Button>
                  </Link>
                </Stack>
              </Card>
            )}

            {/* Info */}
            <Alert severity="info" icon={<Info size={iconSize.md} />} sx={{ borderRadius: `${radius.md}px` }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13, mb: 0.5 }}>Информация</Typography>
              <Typography variant="body2" sx={{ color: "var(--text-muted)", fontSize: 12 }}>
                Профиль виден всем пользователям. Полный профиль увеличивает шансы на успех.
              </Typography>
            </Alert>
          </Stack>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
