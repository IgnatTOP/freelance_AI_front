"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Container,
  Typography,
  Stack,
  Avatar,
  Chip,
  Button,
  Skeleton,
  Grid,
  Tabs,
  Tab,
  useTheme,
} from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import { User, Briefcase, Star, MapPin, Mail, Calendar, FileText, ExternalLink, Image as ImageIcon, DollarSign } from "lucide-react";
import { useAuth } from "@/src/shared/lib/hooks";
import { authService } from "@/src/shared/lib/auth/auth.service";
import Link from "next/link";
import { getUserPortfolio } from "@/src/shared/api/portfolio";
import type { PortfolioItemWithMedia } from "@/src/entities/portfolio/model/types";
import { getMediaUrl } from "@/src/shared/lib/api/axios";
import api from "@/src/shared/lib/api/axios";

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
  const theme = useTheme();
  const userId = params.id as string;
  // Хуки должны вызываться в начале компонента, до любых условных возвратов
  const { user } = useAuth({ requireAuth: false });
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItemWithMedia[]>([]);
  const [tabValue, setTabValue] = useState(0);

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
      <Box sx={{ minHeight: "100vh", background: "transparent" }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Stack>
        </Container>
      </Box>
    );
  }

  if (!userProfile) {
    return (
      <Box sx={{ minHeight: "100vh", background: "transparent" }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Пользователь не найден
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  const isCurrentUser = user?.id ? String(user.id) === userId : false;

  return (
    <Box sx={{ minHeight: "100vh", background: "transparent" }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Stack spacing={3}>
          {/* Profile Header Card */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Grid container spacing={{ xs: 2, md: 3 }}>
                {/* Avatar Column */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <Stack alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        bgcolor: `${theme.palette.primary.main}15`,
                        color: theme.palette.primary.main,
                        fontSize: 48,
                        fontWeight: 600,
                      }}
                    >
                      {(userProfile.profile?.display_name || userProfile.username)?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 600 }}>
                        {userProfile.profile?.display_name || userProfile.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        @{userProfile.username}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={userProfile.role === "client" ? "Заказчик" : "Фрилансер"}
                          color={userProfile.role === "client" ? "info" : "success"}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Stack>
                </Grid>

                {/* Profile Details Column */}
                <Grid size={{ xs: 12, md: 9 }}>
                  <Stack spacing={3}>
                    {/* Bio Section */}
                    {userProfile.profile?.bio && (
                      <Box>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                          О себе
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                        >
                          {userProfile.profile.bio}
                        </Typography>
                      </Box>
                    )}

                    {/* Stats Grid */}
                    <Grid container spacing={2}>
                      {userProfile.profile?.experience_level && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Briefcase size={18} style={{ color: theme.palette.text.secondary }} />
                            <Typography variant="body2">
                              <strong>Уровень:</strong> {getExperienceLevelLabel(userProfile.profile.experience_level)}
                            </Typography>
                          </Stack>
                        </Grid>
                      )}
                      {userProfile.profile?.hourly_rate !== undefined && userProfile.profile.hourly_rate !== null && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <DollarSign size={18} style={{ color: theme.palette.text.secondary }} />
                            <Typography variant="body2">
                              <strong>Ставка в час:</strong>{" "}
                              {typeof userProfile.profile.hourly_rate === "number"
                                ? `${userProfile.profile.hourly_rate.toLocaleString("ru-RU")} ₽`
                                : `${userProfile.profile.hourly_rate} ₽`}
                            </Typography>
                          </Stack>
                        </Grid>
                      )}
                      {userProfile.profile?.location && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <MapPin size={18} style={{ color: theme.palette.text.secondary }} />
                            <Typography variant="body2">
                              <strong>Местоположение:</strong> {userProfile.profile.location}
                            </Typography>
                          </Stack>
                        </Grid>
                      )}
                      {userProfile.profile?.rating && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Star size={18} fill="#ffc107" color="#ffc107" />
                            <Typography variant="body2">
                              <strong>Рейтинг:</strong> {userProfile.profile.rating.toFixed(1)} / 5.0
                            </Typography>
                          </Stack>
                        </Grid>
                      )}
                      {userProfile.profile?.completed_orders !== undefined && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <FileText size={18} style={{ color: theme.palette.text.secondary }} />
                            <Typography variant="body2">
                              <strong>Завершено проектов:</strong> {userProfile.profile.completed_orders}
                            </Typography>
                          </Stack>
                        </Grid>
                      )}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Calendar size={18} style={{ color: theme.palette.text.secondary }} />
                          <Typography variant="body2">
                            <strong>На платформе с:</strong>{" "}
                            {userProfile.created_at
                              ? new Date(userProfile.created_at).toLocaleDateString("ru-RU", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "Не указано"}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>

                    {/* Skills Section */}
                    {userProfile.profile?.skills && userProfile.profile.skills.length > 0 && (
                      <Box>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                          Навыки
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {userProfile.profile.skills.map((skill, idx) => (
                            <Chip key={idx} label={skill} color="primary" variant="outlined" size="small" />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Portfolio Section for Freelancers */}
          {userProfile.role === "freelancer" && (
            <Card sx={{ borderRadius: 2 }}>
              <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
              >
                <Tab label="Портфолио" />
              </Tabs>
              <Box sx={{ p: 2 }}>
                {portfolio.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography variant="body2" color="text.secondary">
                      Портфолио пусто
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
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
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                          <Card
                            sx={{
                              height: "100%",
                              borderRadius: 2,
                              transition: "transform 0.2s, box-shadow 0.2s",
                              "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: theme.shadows[4],
                              },
                            }}
                          >
                            {coverUrl ? (
                              <CardMedia
                                component="img"
                                height="200"
                                image={coverUrl}
                                alt={item.title}
                                sx={{ objectFit: "cover" }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  height: 200,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: theme.palette.mode === "dark" ? "grey.800" : "grey.100",
                                }}
                              >
                                <ImageIcon size={48} color={theme.palette.text.disabled} />
                              </Box>
                            )}
                            <CardContent>
                              <Stack spacing={1}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {item.title}
                                  </Typography>
                                  {item.external_link && (
                                    <a
                                      href={item.external_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ display: "flex", alignItems: "center" }}
                                    >
                                      <ExternalLink size={14} style={{ color: theme.palette.primary.main }} />
                                    </a>
                                  )}
                                </Stack>
                                {item.description && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      mb: 1,
                                    }}
                                  >
                                    {item.description}
                                  </Typography>
                                )}
                                {item.ai_tags && item.ai_tags.length > 0 && (
                                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                    {item.ai_tags.map((tag, idx) => (
                                      <Chip key={idx} label={tag} color="primary" variant="outlined" size="small" />
                                    ))}
                                  </Stack>
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </Box>
            </Card>
          )}

          {/* Edit Profile Button */}
          {isCurrentUser && (
            <Box sx={{ textAlign: "center" }}>
              <Link href="/profile" style={{ textDecoration: "none" }}>
                <Button variant="contained" size="large">
                  Редактировать профиль
                </Button>
              </Link>
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

