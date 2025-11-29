"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  Card,
  CardContent,
  Grid,
  TextField,
  Avatar,
  Typography,
  Stack,
  Button,
  Skeleton,
  InputAdornment,
  Chip
} from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import { Search, User, Star, Briefcase, MapPin } from "lucide-react";
import { authService } from "@/src/shared/lib/auth/auth.service";
import Link from "next/link";
import api from "@/src/shared/lib/api/axios";

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
      // Получаем список заказов и извлекаем фрилансеров из предложений
      // В реальном приложении здесь должен быть отдельный endpoint для списка фрилансеров
      const { getOrders } = await import("@/src/shared/api/orders");
      const response = await getOrders({ limit: 100 });
      const orders = response.data || [];
      
      // Собираем уникальных фрилансеров из предложений
      const freelancerIds = new Set<string>();
      const freelancersMap = new Map<string, Freelancer>();

      // Получаем proposals для каждого заказа отдельно
      const { getOrderProposals } = await import("@/src/shared/api/proposals");
      
      for (const order of orders) {
        try {
          // Получаем proposals для заказа
          const proposalsResponse = await getOrderProposals(order.id);
          const proposals = proposalsResponse.proposals || [];
          
          for (const proposal of proposals) {
            if (proposal.freelancer_id && !freelancerIds.has(proposal.freelancer_id)) {
              freelancerIds.add(proposal.freelancer_id);
              try {
                const userResponse = await api.get(`/users/${proposal.freelancer_id}`);
                const user = userResponse.data.user;
                if (user && user.role === "freelancer") {
                  freelancersMap.set(user.id, {
                    id: user.id,
                    username: user.username,
                    display_name: user.display_name,
                    email: user.email,
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
      toastService.error("Не удалось загрузить список фрилансеров");
    } finally {
      setLoading(false);
    }
  };

  const filteredFreelancers = freelancers.filter((f) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      f.username?.toLowerCase().includes(searchLower) ||
      f.display_name?.toLowerCase().includes(searchLower) ||
      f.profile?.bio?.toLowerCase().includes(searchLower) ||
      f.profile?.skills?.some((s) => s.toLowerCase().includes(searchLower))
    );
  });

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 2, md: 3 },
          px: { xs: 2, md: 3 }
        }}
      >
        <Stack spacing={{ xs: 2, md: 3 }}>
          <Box>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontSize: { xs: "1.5rem", md: "2.125rem" } }}>
              Фрилансеры
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Найдите подходящего исполнителя для вашего проекта
            </Typography>
          </Box>

          <TextField
            fullWidth
            placeholder="Поиск по имени, навыкам или описанию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: { xs: "100%", md: "600px" } }}
          />

          {loading ? (
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <Card>
                    <CardContent>
                      <Stack spacing={1} alignItems="center">
                        <Skeleton variant="circular" width={64} height={64} />
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="rectangular" height={60} width="100%" />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : filteredFreelancers.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="body1" color="text.secondary">
                Фрилансеры не найдены
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredFreelancers.map((freelancer) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={freelancer.id}>
                  <Link href={`/users/${freelancer.id}`} style={{ textDecoration: "none" }}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 4,
                        },
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Stack spacing={2}>
                          <Box sx={{ textAlign: "center" }}>
                            <Avatar
                              sx={{
                                width: 64,
                                height: 64,
                                bgcolor: "primary.light",
                                color: "primary.main",
                                fontSize: 24,
                                fontWeight: 600,
                                mx: "auto",
                              }}
                            >
                              {(freelancer.display_name || freelancer.username)?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography
                              variant="h6"
                              component="h4"
                              sx={{ mt: 1.5, mb: 0.5, fontSize: { xs: "1rem", md: "1.25rem" } }}
                            >
                              {freelancer.display_name || freelancer.username}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              @{freelancer.username}
                            </Typography>
                          </Box>

                          {freelancer.profile?.bio && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                fontSize: 12,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                              }}
                            >
                              {freelancer.profile.bio}
                            </Typography>
                          )}

                          <Stack spacing={0.5}>
                            {freelancer.profile?.experience_level && (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <Briefcase size={14} />
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                                  {freelancer.profile.experience_level}
                                </Typography>
                              </Stack>
                            )}
                            {freelancer.profile?.location && (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <MapPin size={14} />
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                                  {freelancer.profile.location}
                                </Typography>
                              </Stack>
                            )}
                            {freelancer.profile?.rating && (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <Star size={14} fill="#ffc107" color="#ffc107" />
                                <Typography variant="body2" sx={{ fontSize: 12 }}>
                                  {freelancer.profile.rating.toFixed(1)}
                                </Typography>
                              </Stack>
                            )}
                          </Stack>

                          {freelancer.profile?.skills && freelancer.profile.skills.length > 0 && (
                            <Box>
                              {freelancer.profile.skills.slice(0, 3).map((skill, idx) => (
                                <Chip
                                  key={idx}
                                  label={skill}
                                  size="small"
                                  sx={{
                                    m: 0.25,
                                    height: "auto",
                                    py: 0.25,
                                    fontSize: 11,
                                    bgcolor: "primary.light",
                                    color: "primary.main",
                                  }}
                                />
                              ))}
                              {freelancer.profile.skills.length > 3 && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ ml: 0.5, fontSize: 11 }}
                                >
                                  +{freelancer.profile.skills.length - 3}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="text"
                          sx={{ minHeight: 44 }}
                        >
                          Посмотреть профиль
                        </Button>
                      </Box>
                    </Card>
                  </Link>
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

export default function FreelancersPage() {
  return (
    <Suspense fallback={
      <Box sx={{ minHeight: "100vh" }}>
        <Container
          maxWidth="xl"
          sx={{
            py: { xs: 2, md: 3 },
            px: { xs: 2, md: 3 }
          }}
        >
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <Card>
                  <CardContent>
                    <Stack spacing={1} alignItems="center">
                      <Skeleton variant="circular" width={64} height={64} />
                      <Skeleton variant="text" width="80%" />
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="rectangular" height={60} width="100%" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    }>
      <FreelancersPageContent />
    </Suspense>
  );
}

