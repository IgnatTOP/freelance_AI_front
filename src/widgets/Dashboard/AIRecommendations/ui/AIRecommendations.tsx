"use client";

import { useEffect, useState, useCallback } from "react";
import { Button, Skeleton, Stack, Typography, Box, Chip, IconButton } from "@mui/material";
import { Bot, Sparkles, Target, Zap, ArrowRight, RefreshCw, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cleanExplanationText } from "@/src/shared/lib/ai/ai-utils";
import { useDashboardData } from "@/src/features/dashboard/context";
import { StyledCard, IconBox, SectionHeader, LoadingState } from "@/src/shared/ui";
import { radius, iconSize, statusColors } from "@/src/shared/lib/constants/design";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  match_score: number;
  reason: string;
  type: "order" | "freelancer" | "improvement";
  href: string;
}

interface AIRecommendationsProps {
  userRole: "client" | "freelancer" | null;
  embedded?: boolean;
}

function RecommendationItem({ rec }: { rec: Recommendation }) {
  const Icon = rec.type === "order" ? Target : rec.type === "freelancer" ? Bot : TrendingUp;
  const matchColor = rec.match_score >= 0.9 ? statusColors.success : rec.match_score >= 0.75 ? statusColors.warning : statusColors.info;

  return (
    <Link href={rec.href} style={{ textDecoration: "none" }}>
      <Box
        sx={{
          p: 1.5,
          borderRadius: `${radius.md}px`,
          bgcolor: "var(--primary-5)",
          border: "1px solid var(--border)",
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": { borderColor: "var(--primary)" },
        }}
      >
        <Stack direction="row" spacing={1.5}>
          <IconBox icon={Icon} size="md" />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              {rec.match_score > 0 && (
                <Chip
                  size="small"
                  icon={<Zap size={10} />}
                  label={`${Math.round(rec.match_score * 100)}%`}
                  sx={{
                    height: 20,
                    fontSize: 10,
                    bgcolor: `${matchColor}15`,
                    color: matchColor,
                    border: `1px solid ${matchColor}30`,
                  }}
                />
              )}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "var(--text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: 13,
                }}
              >
                {rec.title}
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              sx={{
                color: "var(--text-muted)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontSize: 11,
              }}
            >
              {rec.description}
            </Typography>
            {rec.reason && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                <Sparkles size={10} style={{ color: "var(--primary)" }} />
                <Typography variant="caption" sx={{ color: "var(--text-muted)", fontSize: 10 }}>
                  {rec.reason}
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      </Box>
    </Link>
  );
}

export function AIRecommendations({ userRole, embedded = false }: AIRecommendationsProps) {
  const { data: dashboardData, aiLoading, loadAIRecommendations } = useDashboardData();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [explanation, setExplanation] = useState("");

  const processRecommendations = useCallback(() => {
    if (!dashboardData) return;

    if (userRole === "freelancer") {
      const recommendedOrders = dashboardData.ai_recommendations?.recommended_orders || [];
      const explanationText = dashboardData.ai_recommendations?.explanation || "";

      if (recommendedOrders.length === 0) {
        setRecommendations([
          { id: "improve-profile", title: "Улучшите профиль", description: "Добавьте проекты в портфолио", match_score: 0, reason: "Полный профиль увеличивает шансы на 40%", type: "improvement", href: "/profile" },
          { id: "browse-orders", title: "Просмотрите заказы", description: "Изучите доступные проекты", match_score: 0, reason: "Новые заказы каждый день", type: "improvement", href: "/orders" },
        ]);
        setExplanation("Улучшите профиль для персональных рекомендаций");
      } else {
        const recs: Recommendation[] = recommendedOrders.map((rec) => ({
          id: rec.order.id,
          title: rec.order.title.length > 50 ? rec.order.title.substring(0, 50) + "..." : rec.order.title,
          description: (rec.order.ai_summary || rec.order.description || "").substring(0, 100),
          match_score: Math.min(rec.match_score / 10, 1),
          reason: rec.explanation || "",
          type: "order" as const,
          href: `/orders/${rec.order.id}`,
        }));
        setRecommendations(recs);
        setExplanation(cleanExplanationText(explanationText) || "");
      }
    } else if (userRole === "client") {
      const suitableFreelancers = dashboardData.ai_recommendations?.suitable_freelancers || [];

      if (suitableFreelancers.length === 0) {
        setRecommendations([
          { id: "improve-order", title: "Улучшите описание", description: "Добавьте детали и требования", match_score: 0, reason: "Подробные заказы получают в 3 раза больше откликов", type: "improvement", href: "/orders/create" },
        ]);
        setExplanation("Создайте заказ для получения рекомендаций");
      } else {
        const ordersMap = new Map((dashboardData.recent_orders || []).map((o) => [o.id, o]));
        const recs: Recommendation[] = suitableFreelancers.slice(0, 5).map((sf) => {
          const order = ordersMap.get(sf.order_id);
          const orderTitle = order?.title ? (order.title.length > 30 ? order.title.substring(0, 30) + "..." : order.title) : "Заказ";
          return {
            id: sf.freelancer_id,
            title: `Фрилансер для "${orderTitle}"`,
            description: (sf.explanation || "").substring(0, 100),
            match_score: Math.min(sf.match_score / 10, 1),
            reason: "",
            type: "freelancer" as const,
            href: `/users/${sf.freelancer_id}?order_id=${sf.order_id}`,
          };
        });
        setRecommendations(recs);
      }
    }
    setLoading(false);
  }, [dashboardData, userRole]);

  useEffect(() => {
    if (userRole) processRecommendations();
  }, [userRole, processRecommendations]);

  useEffect(() => {
    if (dashboardData?.ai_recommendations) processRecommendations();
  }, [dashboardData?.ai_recommendations, processRecommendations]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAIRecommendations();
    setRefreshing(false);
  };

  const isLoading = loading || (userRole === "client" && aiLoading && !dashboardData?.ai_recommendations);

  if (isLoading) {
    return embedded ? (
      <Stack spacing={1.5}>
        <Skeleton variant="text" width="60%" />
        <LoadingState type="list" count={3} height={64} />
      </Stack>
    ) : (
      <StyledCard>
        <SectionHeader icon={Bot} title="AI Рекомендации" />
        <Box sx={{ mt: 2 }}>
          <LoadingState type="list" count={3} height={64} />
        </Box>
      </StyledCard>
    );
  }

  const content = (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ color: "var(--text-muted)", fontSize: 13 }}>
        {userRole === "freelancer" ? "Подобрали заказы для вас" : "Лучшие исполнители для проектов"}
      </Typography>

      {explanation && (
        <Box sx={{ p: 1.5, borderRadius: `${radius.md}px`, bgcolor: "var(--primary-5)", border: "1px solid var(--primary-15)" }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "var(--primary)", display: "block", mb: 0.5, fontSize: 11 }}>
            Почему эти заказы?
          </Typography>
          <Typography variant="caption" sx={{ color: "var(--text-secondary)", lineHeight: 1.5, fontSize: 12 }}>
            {explanation}
          </Typography>
        </Box>
      )}

      {recommendations.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography variant="body2" sx={{ color: "var(--text-muted)", fontSize: 13 }}>Пока нет рекомендаций</Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {recommendations.map((rec) => <RecommendationItem key={rec.id} rec={rec} />)}
        </Stack>
      )}

      <Link href={userRole === "freelancer" ? "/orders?ai-recommended=true" : "/freelancers?ai-recommended=true"} style={{ textDecoration: "none" }}>
        <Button variant="outlined" fullWidth size="small" startIcon={<Bot size={iconSize.sm} />} endIcon={<ArrowRight size={iconSize.sm} />} sx={{ fontSize: 13 }}>
          Все рекомендации
        </Button>
      </Link>
    </Stack>
  );

  if (embedded) return content;

  return (
    <StyledCard sx={{ position: "sticky", top: 88 }}>
      <SectionHeader
        icon={Bot}
        title="AI Рекомендации"
        action={
          <IconButton
            size="small"
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{
              animation: refreshing ? "spin 1s linear infinite" : "none",
              "@keyframes spin": { "100%": { transform: "rotate(360deg)" } },
            }}
          >
            <RefreshCw size={iconSize.sm} />
          </IconButton>
        }
      />
      <Box sx={{ mt: 2 }}>{content}</Box>
    </StyledCard>
  );
}
