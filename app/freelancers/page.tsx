"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Grid, TextField, Avatar, Typography, Stack, Button, Chip, InputAdornment, Box, Select, MenuItem, FormControl, InputLabel, Slider } from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import { Search, User, Star, Briefcase, MapPin, Filter } from "lucide-react";
import { authService } from "@/src/shared/lib/auth/auth.service";
import Link from "next/link";
import { searchFreelancers, type FreelancerSearchResult, type FreelancerSearchParams } from "@/src/shared/api/freelancers";
import { PageContainer, StyledCard, EmptyState, LoadingState, MetaItem } from "@/src/shared/ui";
import { getMediaUrl } from "@/src/shared/lib/api/axios";

function FreelancerCard({ freelancer }: { freelancer: FreelancerSearchResult }) {
  const photoUrl = freelancer.photo_id ? getMediaUrl(freelancer.photo_id) : null;
  
  return (
    <Link href={`/users/${freelancer.id}`} style={{ textDecoration: "none" }}>
      <StyledCard interactive sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Stack spacing={2} sx={{ flexGrow: 1 }}>
          <Box sx={{ textAlign: "center" }}>
            <Avatar
              src={photoUrl || undefined}
              sx={{
                width: 64,
                height: 64,
                bgcolor: "var(--primary-10)",
                color: "var(--primary)",
                fontSize: 24,
                fontWeight: 600,
                mx: "auto",
              }}
            >
              {(freelancer.display_name || freelancer.username)?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6" sx={{ mt: 1.5, mb: 0.5, fontSize: { xs: "1rem", md: "1.25rem" } }}>
              {freelancer.display_name || freelancer.username}
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
              @{freelancer.username}
            </Typography>
          </Box>

          {freelancer.bio && (
            <Typography
              variant="body2"
              sx={{
                color: "var(--text-muted)",
                fontSize: 12,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {freelancer.bio}
            </Typography>
          )}

          <Stack spacing={0.5}>
            {freelancer.experience_level && (
              <MetaItem icon={Briefcase}>{freelancer.experience_level}</MetaItem>
            )}
            {freelancer.location && (
              <MetaItem icon={MapPin}>{freelancer.location}</MetaItem>
            )}
            {freelancer.avg_rating > 0 && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Star size={14} fill="#ffc107" color="#ffc107" />
                <Typography variant="body2" sx={{ fontSize: 12 }}>
                  {freelancer.avg_rating.toFixed(1)} ({freelancer.review_count})
                </Typography>
              </Stack>
            )}
            {freelancer.hourly_rate && (
              <Typography variant="body2" sx={{ fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>
                {freelancer.hourly_rate.toLocaleString()} ₽/час
              </Typography>
            )}
          </Stack>

          {freelancer.skills && freelancer.skills.length > 0 && (
            <Box>
              {freelancer.skills.slice(0, 3).map((skill, idx) => (
                <Chip
                  key={idx}
                  label={skill}
                  size="small"
                  sx={{
                    m: 0.25,
                    height: "auto",
                    py: 0.25,
                    fontSize: 11,
                    bgcolor: "var(--primary-10)",
                    color: "var(--primary)",
                  }}
                />
              ))}
              {freelancer.skills.length > 3 && (
                <Typography variant="caption" sx={{ color: "var(--text-muted)", ml: 0.5, fontSize: 11 }}>
                  +{freelancer.skills.length - 3}
                </Typography>
              )}
            </Box>
          )}
        </Stack>

        <Button fullWidth variant="text" sx={{ mt: 2 }}>
          Посмотреть профиль
        </Button>
      </StyledCard>
    </Link>
  );
}

function FreelancersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [freelancers, setFreelancers] = useState<FreelancerSearchResult[]>([]);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [skills, setSkills] = useState(searchParams.get("skills") || "");
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get("experience_level") || "");
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toastService.warning("Необходимо авторизоваться");
      router.push("/auth/login");
      return;
    }
    loadFreelancers();
  }, [router]);

  const loadFreelancers = async (params?: FreelancerSearchParams) => {
    try {
      setLoading(true);
      const searchParams: FreelancerSearchParams = {
        q: search || undefined,
        skills: skills || undefined,
        experience_level: experienceLevel || undefined,
        min_rating: minRating > 0 ? minRating : undefined,
        limit: 50,
        ...params,
      };
      const result = await searchFreelancers(searchParams);
      setFreelancers(Array.isArray(result) ? result : []);
    } catch (error: any) {
      console.error("Failed to load freelancers:", error);
      setFreelancers([]);
      toastService.error("Не удалось загрузить список фрилансеров");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadFreelancers();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <PageContainer title="Фрилансеры" subtitle="Найдите подходящего исполнителя для вашего проекта">
      <StyledCard sx={{ mb: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Поиск по имени или описанию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment>,
              }}
              size="small"
            />
            <TextField
              fullWidth
              placeholder="Навыки (через запятую)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              onKeyPress={handleKeyPress}
              size="small"
              sx={{ maxWidth: { sm: 250 } }}
            />
            <Button variant="outlined" onClick={() => setShowFilters(!showFilters)} startIcon={<Filter size={16} />}>
              Фильтры
            </Button>
            <Button variant="contained" onClick={handleSearch}>
              Найти
            </Button>
          </Stack>

          {showFilters && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 1 }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Уровень</InputLabel>
                <Select
                  value={experienceLevel}
                  label="Уровень"
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  <MenuItem value="">Все</MenuItem>
                  <MenuItem value="junior">Junior</MenuItem>
                  <MenuItem value="middle">Middle</MenuItem>
                  <MenuItem value="senior">Senior</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="body2" sx={{ mb: 1, fontSize: 12 }}>
                  Минимальный рейтинг: {minRating > 0 ? minRating : "Любой"}
                </Typography>
                <Slider
                  value={minRating}
                  onChange={(_, value) => setMinRating(value as number)}
                  min={0}
                  max={5}
                  step={0.5}
                  marks
                  size="small"
                />
              </Box>
            </Stack>
          )}
        </Stack>
      </StyledCard>

      {loading ? (
        <LoadingState type="cards" count={4} height={280} />
      ) : freelancers.length === 0 ? (
        <EmptyState icon={User} title="Фрилансеры не найдены" description="Попробуйте изменить параметры поиска" />
      ) : (
        <Grid container spacing={2}>
          {freelancers.map((freelancer) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={freelancer.id}>
              <FreelancerCard freelancer={freelancer} />
            </Grid>
          ))}
        </Grid>
      )}
    </PageContainer>
  );
}

export default function FreelancersPage() {
  return (
    <Suspense fallback={
      <PageContainer title="Фрилансеры">
        <LoadingState type="cards" count={4} height={280} />
      </PageContainer>
    }>
      <FreelancersPageContent />
    </Suspense>
  );
}
