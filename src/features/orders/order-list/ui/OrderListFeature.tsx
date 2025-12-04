"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Typography,
  Box,
  Pagination,
  Button,
  Stack,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Collapse,
} from "@mui/material";
import { Plus, Search, Sparkles, RefreshCw, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { PageContainer, EmptyState, StyledCard, LoadingState } from "@/src/shared/ui";
import { OrderCard } from "./OrderCard";
import { getOrders, getMyOrders, getOrdersByIds } from "@/src/shared/api/orders";
import { aiService } from "@/src/shared/lib/ai/ai.service";
import { iconSize } from "@/src/shared/lib/constants/design";
import type { Order } from "@/src/entities/order/model/types";

interface OrderListFeatureProps {
  userRole?: "client" | "freelancer" | null;
  isMarketplace?: boolean;
}

const PAGE_SIZE = 12;

const categoryOptions = [
  { value: "", label: "Все категории" },
  { value: "web", label: "Веб-разработка" },
  { value: "mobile", label: "Мобильная разработка" },
  { value: "design", label: "Дизайн" },
  { value: "marketing", label: "Маркетинг" },
  { value: "writing", label: "Копирайтинг" },
  { value: "other", label: "Другое" },
];

const sortOptions = [
  { value: "newest", label: "Сначала новые" },
  { value: "oldest", label: "Сначала старые" },
  { value: "budget_high", label: "По бюджету ↓" },
  { value: "budget_low", label: "По бюджету ↑" },
];

export function OrderListFeature({ userRole, isMarketplace = true }: OrderListFeatureProps) {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [aiRecommendations, setAiRecommendations] = useState<Map<string, { score: number; reason: string }>>(new Map());
  const [recommendedOrders, setRecommendedOrders] = useState<Order[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [budgetRange, setBudgetRange] = useState<number[]>([0, 500000]);

  const activeFiltersCount = [category, budgetRange[0] > 0 || budgetRange[1] < 500000].filter(Boolean).length;

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      if (isMarketplace) {
        const response = await getOrders({
          status: "published",
          limit: PAGE_SIZE,
          offset: (currentPage - 1) * PAGE_SIZE,
          search: search || undefined,
          budget_min: budgetRange[0] > 0 ? budgetRange[0] : undefined,
          budget_max: budgetRange[1] < 500000 ? budgetRange[1] : undefined,
        });
        setOrders(response.data || []);
        setTotal(response.pagination?.total || 0);
      } else if (userRole === "client") {
        const response = await getMyOrders();
        let myOrders = response.as_client || [];
        if (search) {
          const q = search.toLowerCase();
          myOrders = myOrders.filter(o => o.title.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q));
        }
        setOrders(myOrders);
        setTotal(myOrders.length);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [isMarketplace, userRole, currentPage, search, budgetRange]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const loadAIRecommendations = async () => {
    if (userRole !== "freelancer" || !isMarketplace) return;
    setAiLoading(true);
    try {
      const result = await aiService.getRecommendedOrders();
      const map = new Map<string, { score: number; reason: string }>();
      const orderIds: string[] = [];
      
      result.recommended_orders?.forEach((rec: any) => {
        const orderId = rec.order_id || rec.order?.id;
        if (orderId) {
          map.set(orderId, { score: rec.match_score, reason: rec.explanation });
          orderIds.push(orderId);
        }
      });
      setAiRecommendations(map);
      
      // Загружаем рекомендованные заказы отдельно
      if (orderIds.length > 0) {
        try {
          const recOrders = await getOrdersByIds(orderIds);
          setRecommendedOrders(recOrders);
        } catch {
          setRecommendedOrders([]);
        }
      }
    } catch {
      // Ignore
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "freelancer" && isMarketplace) {
      loadAIRecommendations();
    }
  }, [userRole, isMarketplace]);

  const clearFilters = () => {
    setCategory("");
    setBudgetRange([0, 500000]);
    setSortBy("newest");
  };

  const pageTitle = isMarketplace ? "Биржа заказов" : "Мои заказы";
  const pageSubtitle = isMarketplace
    ? userRole === "freelancer" ? "Найдите проекты, подходящие вашим навыкам" : "Все доступные проекты"
    : "Управляйте своими проектами";

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Исключаем рекомендованные из общего списка
  const recommendedIds = new Set(recommendedOrders.map(o => o.id));
  
  // Client-side sorting and filtering
  const processedOrders = [...orders]
    .filter(order => !recommendedIds.has(order.id)) // Исключаем рекомендованные
    .filter(order => !category || order.description?.toLowerCase().includes(category))
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "budget_high":
          return (b.budget_max || 0) - (a.budget_max || 0);
        case "budget_low":
          return (a.budget_min || 0) - (b.budget_min || 0);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  // Сортируем рекомендованные по score
  const sortedRecommended = [...recommendedOrders].sort((a, b) => {
    const scoreA = aiRecommendations.get(a.id)?.score || 0;
    const scoreB = aiRecommendations.get(b.id)?.score || 0;
    return scoreB - scoreA;
  });

  return (
    <PageContainer
      title={pageTitle}
      subtitle={`${pageSubtitle} • ${total} заказов`}
      actions={
        userRole === "client" && !isMarketplace ? (
          <Link href="/orders/create" style={{ textDecoration: "none" }}>
            <Button variant="contained" startIcon={<Plus size={iconSize.md} />}>Создать заказ</Button>
          </Link>
        ) : userRole === "freelancer" && isMarketplace ? (
          <Button
            variant="outlined"
            startIcon={aiLoading ? <RefreshCw size={iconSize.md} className="animate-spin" /> : <Sparkles size={iconSize.md} />}
            onClick={loadAIRecommendations}
            disabled={aiLoading}
          >
            AI рекомендации
          </Button>
        ) : null
      }
    >
      {/* Search & Filters */}
      <StyledCard sx={{ mb: 2 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Поиск по названию..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search size={iconSize.md} /></InputAdornment>,
              }}
              size="small"
              sx={{ flex: 1 }}
            />
            <Button
              variant={showFilters ? "contained" : "outlined"}
              startIcon={<Filter size={iconSize.sm} />}
              endIcon={showFilters ? <ChevronUp size={iconSize.sm} /> : <ChevronDown size={iconSize.sm} />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ minWidth: 120 }}
            >
              Фильтры {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </Stack>

          <Collapse in={showFilters}>
            <Stack spacing={2} sx={{ pt: 2, borderTop: "1px solid var(--border)" }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Категория</InputLabel>
                    <Select value={category} label="Категория" onChange={(e) => setCategory(e.target.value)}>
                      {categoryOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Сортировка</InputLabel>
                    <Select value={sortBy} label="Сортировка" onChange={(e) => setSortBy(e.target.value)}>
                      {sortOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ px: 1 }}>
                    <Typography variant="caption" sx={{ color: "var(--text-muted)", fontSize: 11 }}>
                      Бюджет: {budgetRange[0].toLocaleString()} - {budgetRange[1].toLocaleString()} ₽
                    </Typography>
                    <Slider
                      value={budgetRange}
                      onChange={(_, v) => setBudgetRange(v as number[])}
                      min={0}
                      max={500000}
                      step={5000}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
              {activeFiltersCount > 0 && (
                <Button size="small" startIcon={<X size={iconSize.xs} />} onClick={clearFilters} sx={{ alignSelf: "flex-start" }}>
                  Сбросить фильтры
                </Button>
              )}
            </Stack>
          </Collapse>
        </Stack>
      </StyledCard>

      {/* AI Recommended Orders Section */}
      {userRole === "freelancer" && isMarketplace && sortedRecommended.length > 0 && currentPage === 1 && !search && (
        <Box sx={{ mb: 3 }}>
          <StyledCard sx={{ mb: 2, bgcolor: "var(--primary-5)", borderColor: "var(--primary-15)" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Sparkles size={iconSize.md} style={{ color: "var(--primary)" }} />
              <Typography variant="body2" sx={{ color: "var(--primary)", fontSize: 13, fontWeight: 500 }}>
                Рекомендовано для вас ({sortedRecommended.length})
              </Typography>
            </Stack>
          </StyledCard>
          <Grid container spacing={2}>
            {sortedRecommended.map((order) => {
              const aiRec = aiRecommendations.get(order.id);
              return (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={order.id}>
                  <OrderCard order={order} userRole={userRole} aiScore={aiRec?.score} aiReason={aiRec?.reason} showStatus={!isMarketplace} />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Orders Grid */}
      {loading ? (
        <LoadingState type="cards" count={6} height={180} />
      ) : orders.length === 0 && recommendedOrders.length === 0 ? (
        <EmptyState
          title={isMarketplace ? "Нет заказов" : "У вас нет заказов"}
          description={isMarketplace ? "Попробуйте изменить фильтры" : "Создайте первый заказ"}
          action={userRole === "client" && !isMarketplace ? { label: "Создать заказ", href: "/orders/create" } : undefined}
        />
      ) : (
        <>
          {processedOrders.length > 0 && (
            <>
              {sortedRecommended.length > 0 && currentPage === 1 && !search && (
                <Typography variant="subtitle2" sx={{ mb: 2, color: "var(--text-muted)" }}>
                  Другие заказы
                </Typography>
              )}
              <Grid container spacing={2}>
                {processedOrders.map((order) => (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={order.id}>
                    <OrderCard order={order} userRole={userRole} showStatus={!isMarketplace} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination count={totalPages} page={currentPage} onChange={(_, page) => setCurrentPage(page)} color="primary" />
            </Box>
          )}
        </>
      )}
    </PageContainer>
  );
}
