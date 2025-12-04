"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Typography, Stack, Box, Tabs, Tab, Avatar, IconButton } from "@mui/material";
import { Heart, Briefcase, User, Trash2 } from "lucide-react";
import { PageContainer, StyledCard, EmptyState, LoadingState } from "@/src/shared/ui";
import { useAuth } from "@/src/shared/lib/hooks";
import { toastService } from "@/src/shared/lib/toast";
import { getFavorites, removeFavorite } from "@/src/shared/api/favorites";
import { getOrder } from "@/src/shared/api/orders";
import { getUserProfile } from "@/src/shared/api/profile";
import type { Favorite, FavoriteTargetType } from "@/src/entities/favorite/model/types";

interface FavoriteWithData extends Favorite {
  data?: {
    title?: string;
    display_name?: string;
    username?: string;
  };
}

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteWithData[]>([]);
  const [tab, setTab] = useState<FavoriteTargetType | "all">("all");

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toastService.warning("Необходимо авторизоваться");
        router.push("/auth/login");
        return;
      }
      loadFavorites();
    }
  }, [authLoading, isAuthenticated, router]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await getFavorites();
      
      // Load additional data for each favorite
      const enrichedFavorites = await Promise.all(
        data.map(async (fav) => {
          try {
            if (fav.target_type === "order") {
              const order = await getOrder(fav.target_id);
              return { ...fav, data: { title: order.title } };
            } else if (fav.target_type === "freelancer") {
              const user = await getUserProfile(fav.target_id);
              return { ...fav, data: { display_name: user.profile?.display_name, username: user.user?.username } };
            }
          } catch {
            // Ignore errors for individual items
          }
          return fav;
        })
      );
      
      setFavorites(enrichedFavorites);
    } catch (error) {
      console.error("Failed to load favorites:", error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (type: FavoriteTargetType, id: string) => {
    try {
      await removeFavorite(type, id);
      setFavorites((prev) => prev.filter((f) => !(f.target_type === type && f.target_id === id)));
      toastService.success("Удалено из избранного");
    } catch (error) {
      toastService.error("Ошибка удаления");
    }
  };

  const filteredFavorites = tab === "all" ? favorites : favorites.filter((f) => f.target_type === tab);

  if (authLoading || loading) {
    return (
      <PageContainer title="Избранное">
        <LoadingState type="list" count={3} height={72} />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Избранное" subtitle={`${favorites.length} элементов`}>
      {/* Tabs */}
      <StyledCard sx={{ mb: 3 }} noPadding>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
          <Tab value="all" label="Все" />
          <Tab value="order" label="Заказы" />
          <Tab value="freelancer" label="Фрилансеры" />
        </Tabs>
      </StyledCard>

      {/* List */}
      {filteredFavorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Нет избранного"
          description="Добавляйте заказы и фрилансеров в избранное для быстрого доступа"
        />
      ) : (
        <Stack spacing={1.5}>
          {filteredFavorites.map((fav) => (
            <Link
              key={fav.id}
              href={fav.target_type === "order" ? `/orders/${fav.target_id}` : `/users/${fav.target_id}`}
              style={{ textDecoration: "none" }}
            >
              <StyledCard interactive>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: fav.target_type === "order" ? "var(--primary-10)" : "var(--success-10)", width: 44, height: 44 }}>
                    {fav.target_type === "order" ? (
                      <Briefcase size={20} style={{ color: "var(--primary)" }} />
                    ) : (
                      <User size={20} style={{ color: "var(--success)" }} />
                    )}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight={500}>
                      {fav.data?.title || fav.data?.display_name || fav.target_id}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {fav.target_type === "order" ? "Заказ" : `@${fav.data?.username || "—"}`}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(fav.target_type, fav.target_id);
                    }}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </Stack>
              </StyledCard>
            </Link>
          ))}
        </Stack>
      )}
    </PageContainer>
  );
}
