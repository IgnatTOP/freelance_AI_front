"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Typography,
  Card,
  Skeleton,
  Box,
  Pagination as MuiPagination,
  Button as MuiButton,
  Stack,
  Grid,
} from "@mui/material";
import { Plus, Sparkles, Inbox, X, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@mui/material/styles";
import { OrderFilters } from "./OrderFilters";
import { OrderCard } from "./OrderCard";
import { AISearchStatus } from "./AISearchStatus";
import { getOrders, getMyOrders, getOrder } from "@/src/shared/api/orders";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { aiService } from "@/src/shared/lib/ai/ai.service";
import { useRequireAuth } from "@/src/shared/lib/hooks";
import { handleApiError } from "@/src/shared/lib/utils";
import { cleanExplanationText } from "@/src/shared/lib/ai/ai-utils";
import type { Order, OrderStatus } from "@/src/entities/order/model/types";

interface OrderListFeatureProps {
  userRole?: "client" | "freelancer" | null;
}

export function OrderListFeature({ userRole }: OrderListFeatureProps) {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [skillsFilter, setSkillsFilter] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState<number | undefined>(undefined);
  const [budgetMax, setBudgetMax] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [recommendedOrderIds, setRecommendedOrderIds] = useState<string[]>([]);
  const [recommendedOrdersMap, setRecommendedOrdersMap] = useState<Map<string, { matchScore: number; explanation: string }>>(new Map());
  const [isSmartSearchActive, setIsSmartSearchActive] = useState(false);
  const [aiSearchStatus, setAiSearchStatus] = useState<"idle" | "analyzing" | "success" | "error" | "no-results">("idle");
  const [aiExplanation, setAiExplanation] = useState<string>("");

  const PAGE_SIZE = 20;
  const CACHE_KEY = "ai_recommended_orders_cache";
  const CACHE_DURATION = 24 * 60 * 60 * 1000;

  const saveToCache = (
    orderIds: string[],
    ordersMap: Map<string, { matchScore: number; explanation: string }>,
    explanation: string,
    status: "success" | "no-results"
  ) => {
    if (typeof window === "undefined") return;
    const cacheData = {
      timestamp: Date.now(),
      orderIds,
      ordersMap: Object.fromEntries(ordersMap),
      explanation,
      status,
    };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Failed to save cache:", error);
    }
  };

  const loadFromCache = (): {
    orderIds: string[];
    ordersMap: Map<string, { matchScore: number; explanation: string }>;
    explanation: string;
    status: "success" | "no-results";
  } | null => {
    if (typeof window === "undefined") return null;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      const cacheData = JSON.parse(cached);
      const now = Date.now();
      const cacheAge = now - cacheData.timestamp;
      if (cacheAge > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      const ordersMap = new Map<string, { matchScore: number; explanation: string }>();
      if (cacheData.ordersMap) {
        Object.entries(cacheData.ordersMap).forEach(([key, value]) => {
          ordersMap.set(key, value as { matchScore: number; explanation: string });
        });
      }
      return {
        orderIds: cacheData.orderIds || [],
        ordersMap,
        explanation: cacheData.explanation || "",
        status: cacheData.status || "success",
      };
    } catch (error) {
      console.error("Failed to load cache:", error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  };

  const clearCache = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(CACHE_KEY);
  };

  useEffect(() => {
    if (userRole === "freelancer") {
      const cached = loadFromCache();
      if (cached && cached.orderIds.length > 0) {
        setRecommendedOrderIds(cached.orderIds);
        setRecommendedOrdersMap(cached.ordersMap);
        setAiExplanation(cached.explanation);
        setIsSmartSearchActive(true);
        setAiSearchStatus(cached.status);
      }
    }
  }, [userRole]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      if (userRole === "client") {
        const response = await getMyOrders();
        let myOrders = response.as_client || [];

        if (search) {
          const searchLower = search.toLowerCase();
          myOrders = myOrders.filter(order =>
            order.title.toLowerCase().includes(searchLower) ||
            (order.description && order.description.toLowerCase().includes(searchLower))
          );
        }
        if (statusFilter !== "all") {
          myOrders = myOrders.filter(order => order.status === statusFilter);
        }
        if (skillsFilter && skillsFilter.length > 0) {
          myOrders = myOrders.filter(order => {
            if (!order.requirements || order.requirements.length === 0) return false;
            const orderSkills = order.requirements.map(r => r.skill.toLowerCase());
            return skillsFilter.some(skill =>
              orderSkills.includes(skill.toLowerCase())
            );
          });
        }
        if (budgetMin !== undefined) {
          myOrders = myOrders.filter(order =>
            order.budget_max !== undefined && order.budget_max >= budgetMin
          );
        }
        if (budgetMax !== undefined) {
          myOrders = myOrders.filter(order =>
            order.budget_min !== undefined && order.budget_min <= budgetMax
          );
        }

        myOrders.sort((a, b) => {
          let aValue: any;
          let bValue: any;
          switch (sortBy) {
            case "date":
              aValue = new Date(a.created_at).getTime();
              bValue = new Date(b.created_at).getTime();
              break;
            case "budget":
              aValue = a.budget_min || 0;
              bValue = b.budget_min || 0;
              break;
            default:
              aValue = new Date(a.created_at).getTime();
              bValue = new Date(b.created_at).getTime();
          }
          if (sortOrder === "asc") {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });

        const totalFiltered = myOrders.length;
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const paginatedOrders = myOrders.slice(startIndex, endIndex);

        setTotal(totalFiltered);
        setOrders(paginatedOrders);
        return;
      }

      let params: any = {
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (isSmartSearchActive && recommendedOrderIds.length > 0) {
        params.limit = 50;
        params.offset = 0;
        params.status = "published" as OrderStatus;
      } else {
        params.limit = PAGE_SIZE;
        params.offset = (currentPage - 1) * PAGE_SIZE;
        if (search) params.search = search;
        if (statusFilter !== "all") params.status = statusFilter as OrderStatus;
        if (skillsFilter && skillsFilter.length > 0) params.skills = skillsFilter;
        if (budgetMin !== undefined) params.budget_min = budgetMin;
        if (budgetMax !== undefined) params.budget_max = budgetMax;
      }

      let filteredOrders: Order[] = [];
      let response: { data?: Order[]; pagination?: { total: number } } | null = null;

      if (isSmartSearchActive && recommendedOrderIds.length > 0) {
        try {
          const orderPromises = recommendedOrderIds.map(id => getOrder(id));
          const loadedOrders = await Promise.all(orderPromises);
          filteredOrders = loadedOrders.filter(order => order !== null) as Order[];
        } catch (error) {
          console.error("Error loading recommended orders by ID:", error);
          response = await getOrders(params);
          const recommendedSet = new Set(recommendedOrderIds);
          filteredOrders = (response.data || []).filter(order => recommendedSet.has(order.id));
        }

        if (search) {
          const searchLower = search.toLowerCase();
          filteredOrders = filteredOrders.filter(order =>
            order.title.toLowerCase().includes(searchLower) ||
            (order.description && order.description.toLowerCase().includes(searchLower))
          );
        }
        if (skillsFilter && skillsFilter.length > 0) {
          filteredOrders = filteredOrders.filter(order => {
            if (!order.requirements || order.requirements.length === 0) return false;
            const orderSkills = order.requirements.map(r => r.skill.toLowerCase());
            return skillsFilter.some(skill =>
              orderSkills.includes(skill.toLowerCase())
            );
          });
        }
        if (budgetMin !== undefined) {
          filteredOrders = filteredOrders.filter(order =>
            order.budget_max !== undefined && order.budget_max >= budgetMin
          );
        }
        if (budgetMax !== undefined) {
          filteredOrders = filteredOrders.filter(order =>
            order.budget_min !== undefined && order.budget_min <= budgetMax
          );
        }

        filteredOrders.sort((a, b) => {
          const aScore = recommendedOrdersMap.get(a.id)?.matchScore || 0;
          const bScore = recommendedOrdersMap.get(b.id)?.matchScore || 0;
          return bScore - aScore;
        });

        const totalFiltered = filteredOrders.length;
        setTotal(totalFiltered);
      } else {
        response = await getOrders(params);
        filteredOrders = response.data || [];
        const backendTotal = response.pagination?.total ?? 0;
        setTotal(backendTotal);
      }

      setOrders(filteredOrders);
    } catch (error) {
      handleApiError(error, "Ошибка загрузки заказов");
    } finally {
      setLoading(false);
    }
  };

  useRequireAuth();

  useEffect(() => {
    loadOrders();
  }, [search, statusFilter, skillsFilter, budgetMin, budgetMax, sortBy, sortOrder, currentPage, isSmartSearchActive, recommendedOrderIds]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSkillsFilterChange = (skills: string[]) => {
    setSkillsFilter(skills);
    setCurrentPage(1);
  };

  const handleBudgetMinChange = (value: number | null) => {
    setBudgetMin(value ?? undefined);
    setCurrentPage(1);
  };

  const handleBudgetMaxChange = (value: number | null) => {
    setBudgetMax(value ?? undefined);
    setCurrentPage(1);
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleSortOrderChange = (value: "asc" | "desc") => {
    setSortOrder(value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearch("");
    setStatusFilter("all");
    setSkillsFilter([]);
    setBudgetMin(undefined);
    setBudgetMax(undefined);
    setSortBy("date");
    setSortOrder("desc");
    setCurrentPage(1);
    setRecommendedOrderIds([]);
    setIsSmartSearchActive(false);
    setAiSearchStatus("idle");
    setAiExplanation("");
    setRecommendedOrdersMap(new Map());
    clearCache();
  };

  const handleSmartSearch = async (forceRefresh: boolean = false) => {
    if (userRole !== "freelancer") return;

    try {
      setAiSearchStatus("analyzing");
      setAiExplanation("");

      const response = await aiService.getRecommendedOrders(10);
      const orderIds = response.recommended_order_ids || [];
      let explanation = response.explanation || "";
      explanation = explanation ? cleanExplanationText(explanation) : "";

      const ordersMap = new Map<string, { matchScore: number; explanation: string }>();
      if (response.recommended_orders && response.recommended_orders.length > 0) {
        response.recommended_orders.forEach(ro => {
          ordersMap.set(ro.order_id, {
            matchScore: ro.match_score,
            explanation: ro.explanation || "",
          });
        });
      }
      setRecommendedOrdersMap(ordersMap);

      if (!orderIds || orderIds.length === 0) {
        setAiSearchStatus("no-results");
        setIsSmartSearchActive(false);
        setRecommendedOrderIds([]);
        setRecommendedOrdersMap(new Map());
        const noResultsExplanation = "Не найдено подходящих заказов. Попробуйте обновить профиль или расширить фильтры поиска.";
        setAiExplanation(noResultsExplanation);
        saveToCache([], new Map(), noResultsExplanation, "no-results");
      } else {
        const limitedOrderIds = orderIds.slice(0, 10);
        setRecommendedOrderIds(limitedOrderIds);
        setIsSmartSearchActive(true);
        setCurrentPage(1);
        setAiSearchStatus("success");
        setAiExplanation(explanation || "");
        saveToCache(limitedOrderIds, ordersMap, explanation || "", "success");
      }
    } catch (error: any) {
      console.error("Smart search error:", error);
      let errorMessage = "Неизвестная ошибка";
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes("AI сервис недоступен") || errorMessage.includes("Service Unavailable")) {
        userFriendlyMessage = "AI сервис временно недоступен. Пожалуйста, используйте обычные фильтры для поиска заказов.";
      }

      setAiSearchStatus("error");
      setAiExplanation(userFriendlyMessage);
      setIsSmartSearchActive(false);
      setRecommendedOrderIds([]);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', p: 4, maxWidth: 1600, mx: 'auto', width: '100%' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Stack spacing={4}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 3, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Box flex={1}>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                {userRole === "client" ? "Мои заказы" : "Все заказы"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userRole === "client"
                  ? "Управляйте своими проектами и отслеживайте прогресс"
                  : "Найдите подходящие проекты и начните работу"}
              </Typography>
            </Box>

            {userRole === "client" && (
              <Stack direction="row" spacing={1}>
                <Link href="/orders/create?ai=true">
                  <MuiButton variant="outlined" startIcon={<Sparkles size={16} />}>
                    Быстрое создание
                  </MuiButton>
                </Link>
                <Link href="/orders/create">
                  <MuiButton variant="contained" startIcon={<Plus size={16} />}>
                    Создать заказ
                  </MuiButton>
                </Link>
              </Stack>
            )}
          </Box>

          <Grid container spacing={4}>
            {/* Left Sidebar: Filters */}
            <Grid size={{ xs: 12, lg: 3 }}>
              <Box sx={{ position: 'sticky', top: 32 }}>
                <Card>
                  <Box sx={{ p: 3 }}>
                    <OrderFilters
                      search={search}
                      statusFilter={statusFilter}
                      skillsFilter={skillsFilter}
                      budgetMin={budgetMin}
                      budgetMax={budgetMax}
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSearchChange={handleSearchChange}
                      onStatusFilterChange={handleStatusFilterChange}
                      onSkillsFilterChange={handleSkillsFilterChange}
                      onBudgetMinChange={handleBudgetMinChange}
                      onBudgetMaxChange={handleBudgetMaxChange}
                      onSortByChange={handleSortByChange}
                      onSortOrderChange={handleSortOrderChange}
                      onReset={handleReset}
                      userRole={userRole}
                      onSmartSearch={handleSmartSearch}
                    />
                  </Box>
                </Card>
              </Box>
            </Grid>

            {/* Right Content: Orders List */}
            <Grid size={{ xs: 12, lg: 9 }}>
              <AISearchStatus
                status={aiSearchStatus}
                orderCount={recommendedOrderIds.length}
                explanation={aiExplanation}
                onClose={() => {
                  setAiSearchStatus("idle");
                  setAiExplanation("");
                }}
                onReset={handleReset}
              />

              {loading ? (
                <Stack spacing={2}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i}>
                      <Box sx={{ p: 3 }}>
                        <Skeleton variant="text" width="60%" height={32} />
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="80%" />
                      </Box>
                    </Card>
                  ))}
                </Stack>
              ) : orders.length === 0 ? (
                <Card>
                  <Box sx={{ p: 10, textAlign: 'center' }}>
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 2,
                      bgcolor: `${theme.palette.primary.main}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}>
                      <Inbox size={40} style={{ color: theme.palette.primary.main }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {search || statusFilter !== "all" || (skillsFilter && skillsFilter.length > 0)
                        ? "Заказы не найдены"
                        : userRole === "client"
                        ? "У вас пока нет заказов"
                        : "Нет доступных заказов"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                      {search || statusFilter !== "all"
                        ? "Попробуйте изменить критерии поиска или сбросить фильтры"
                        : userRole === "client"
                        ? "Создайте первый заказ и найдите исполнителя"
                        : "Новые заказы появятся здесь"}
                    </Typography>
                    {userRole === "client" && !(search || statusFilter !== "all") && (
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Link href="/orders/create?ai=true">
                          <MuiButton variant="outlined" startIcon={<Sparkles size={16} />}>
                            Быстрое создание
                          </MuiButton>
                        </Link>
                        <Link href="/orders/create">
                          <MuiButton variant="contained" startIcon={<Plus size={16} />}>
                            Создать заказ
                          </MuiButton>
                        </Link>
                      </Stack>
                    )}
                  </Box>
                </Card>
              ) : (
                <Stack spacing={2.5}>
                  {/* Results Count */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary">
                        {isSmartSearchActive ? "Рекомендовано AI: " : "Найдено заказов: "}
                        <Typography component="span" fontWeight={600} color="text.primary">
                          {total}
                        </Typography>
                      </Typography>
                      {isSmartSearchActive && (
                        <Stack direction="row" spacing={0.5}>
                          <MuiButton
                            size="small"
                            startIcon={<RefreshCw size={12} />}
                            onClick={() => handleSmartSearch(true)}
                            disabled={aiSearchStatus === "analyzing"}
                          >
                            Обновить
                          </MuiButton>
                          <MuiButton
                            size="small"
                            startIcon={<X size={12} />}
                            onClick={() => {
                              setIsSmartSearchActive(false);
                              setRecommendedOrderIds([]);
                              setRecommendedOrdersMap(new Map());
                              setCurrentPage(1);
                              setAiSearchStatus("idle");
                              setAiExplanation("");
                              clearCache();
                            }}
                          >
                            Сбросить
                          </MuiButton>
                        </Stack>
                      )}
                    </Box>
                  </Box>

                  {/* Orders */}
                  {orders.map((order, index) => {
                    const recommendation = recommendedOrdersMap.get(order.id);
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                      >
                        <OrderCard
                          order={order}
                          matchScore={recommendation?.matchScore}
                          matchExplanation={recommendation?.explanation}
                        />
                      </motion.div>
                    );
                  })}

                  {/* Pagination */}
                  {total > PAGE_SIZE && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3, borderTop: 1, borderColor: 'divider' }}>
                      <MuiPagination
                        count={Math.ceil(total / PAGE_SIZE)}
                        page={currentPage}
                        onChange={(_, page) => setCurrentPage(page)}
                        color="primary"
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}
                </Stack>
              )}
            </Grid>
          </Grid>
        </Stack>
      </motion.div>
    </Box>
  );
}
