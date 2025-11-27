"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Typography,
  Card,
  Skeleton,
  Empty,
  Pagination,
  Button,
  Space,
  theme,
  Row,
  Col,
  Affix,
} from "antd";
import { Plus, Sparkles, Inbox, X, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
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

const { Title, Text } = Typography;
const { useToken } = theme;

interface OrderListFeatureProps {
  userRole?: "client" | "freelancer" | null;
}

export function OrderListFeature({ userRole }: OrderListFeatureProps) {
  const router = useRouter();
  const { token } = useToken();
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

  // Константы для кеширования
  const CACHE_KEY = "ai_recommended_orders_cache";
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

  // Функции для работы с кешем
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
      
      // Проверяем, что кеш не старше 24 часов
      if (cacheAge > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      // Восстанавливаем Map из объекта
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

  // Загружаем кеш при монтировании компонента
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Для клиентов загружаем только их заказы
      if (userRole === "client") {
        const response = await getMyOrders();
        let myOrders = response.as_client || [];
        
        // Применяем фильтры к своим заказам
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
        
        // Сортировка
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
        
        // Применяем пагинацию
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const paginatedOrders = myOrders.slice(startIndex, endIndex);
        
        setTotal(totalFiltered);
        setOrders(paginatedOrders);
        return;
      }
      
      // Для фрилансеров загружаем все заказы (существующая логика)
      let params: any = {
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      // Если активен умный поиск, загружаем рекомендованные заказы
      // Максимум 10 рекомендованных заказов
      if (isSmartSearchActive && recommendedOrderIds.length > 0) {
        // Загружаем достаточно заказов, чтобы найти рекомендованные (но не более 50 для производительности)
        // Рекомендованные заказы будут отфильтрованы ниже
        params.limit = 50;
        params.offset = 0;
        // При умном поиске показываем только опубликованные заказы
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

      // Если активен умный поиск, загружаем заказы по их ID
      let filteredOrders: Order[] = [];
      let response: { data?: Order[]; pagination?: { total: number } } | null = null;
      
      if (isSmartSearchActive && recommendedOrderIds.length > 0) {
        // Загружаем каждый рекомендованный заказ по его ID
        try {
          const orderPromises = recommendedOrderIds.map(id => getOrder(id));
          const loadedOrders = await Promise.all(orderPromises);
          filteredOrders = loadedOrders.filter(order => order !== null) as Order[];
        } catch (error) {
          console.error("Error loading recommended orders by ID:", error);
          // Fallback: загружаем через обычный список и фильтруем
          response = await getOrders(params);
          const recommendedSet = new Set(recommendedOrderIds);
          filteredOrders = (response.data || []).filter(order => recommendedSet.has(order.id));
        }
        
        // Применяем дополнительные фильтры к рекомендованным заказам (если есть)
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
        
        // Сортируем заказы по match_score (самые подходящие первые)
        filteredOrders.sort((a, b) => {
          const aScore = recommendedOrdersMap.get(a.id)?.matchScore || 0;
          const bScore = recommendedOrdersMap.get(b.id)?.matchScore || 0;
          return bScore - aScore; // По убыванию
        });
        
        // Сохраняем общее количество рекомендованных заказов (максимум 10)
        const totalFiltered = filteredOrders.length;
        setTotal(totalFiltered);
      } else {
        // Обычная загрузка заказов
        response = await getOrders(params);
        filteredOrders = response.data || [];
        
        // Устанавливаем total из пагинации бэкенда (с учетом фильтров)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    clearCache(); // Очищаем кеш при сбросе
  };

  const handleSmartSearch = async (forceRefresh: boolean = false) => {
    if (userRole !== "freelancer") return;

    try {
      setAiSearchStatus("analyzing");
      setAiExplanation("");
      
      // Используем обычный запрос - получаем полный ответ сразу
      const response = await aiService.getRecommendedOrders(10);
      
      const orderIds = response.recommended_order_ids || [];
      let explanation = response.explanation || "";
      
      // Очищаем explanation от UUID и технических деталей
      explanation = explanation ? cleanExplanationText(explanation) : "";
      
      // Сохраняем match_score и explanation для каждого заказа
      // Бэкенд возвращает match_score 0-10, OrderCard умножает на 10 для отображения процентов (0-100%)
      const ordersMap = new Map<string, { matchScore: number; explanation: string }>();
      if (response.recommended_orders && response.recommended_orders.length > 0) {
        response.recommended_orders.forEach(ro => {
          ordersMap.set(ro.order_id, {
            matchScore: ro.match_score, // Сохраняем как есть 0-10, OrderCard сам умножит на 10
            explanation: ro.explanation || "",
          });
        });
      }
      setRecommendedOrdersMap(ordersMap);
      
      // Если AI не нашел заказов, показываем сообщение об отсутствии результатов
      if (!orderIds || orderIds.length === 0) {
        setAiSearchStatus("no-results");
        setIsSmartSearchActive(false);
        setRecommendedOrderIds([]);
        setRecommendedOrdersMap(new Map());
        const noResultsExplanation = "Не найдено подходящих заказов. Попробуйте обновить профиль или расширить фильтры поиска.";
        setAiExplanation(noResultsExplanation);
        // Сохраняем в кеш даже при отсутствии результатов
        saveToCache([], new Map(), noResultsExplanation, "no-results");
      } else {
        // AI нашел заказы - берем только первые 10 (самые подходящие)
        const limitedOrderIds = orderIds.slice(0, 10);
        setRecommendedOrderIds(limitedOrderIds);
        setIsSmartSearchActive(true);
        setCurrentPage(1);
        setAiSearchStatus("success");
        setAiExplanation(explanation || "");
        // Сохраняем в кеш
        saveToCache(limitedOrderIds, ordersMap, explanation || "", "success");
      }
    } catch (error: any) {
      console.error("Smart search error:", error);
      
      // Извлекаем детали ошибки для показа пользователю
      let errorMessage = "Неизвестная ошибка";
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      
      // Формируем понятное сообщение об ошибке
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes("AI сервис недоступен") || errorMessage.includes("Service Unavailable")) {
        userFriendlyMessage = "AI сервис временно недоступен. Пожалуйста, используйте обычные фильтры для поиска заказов.";
      } else if (errorMessage.includes("timeout") || errorMessage.includes("Timeout") || error?.code === "ECONNABORTED") {
        userFriendlyMessage = "AI запрос занимает слишком много времени. Попробуйте еще раз через несколько секунд или используйте обычные фильтры поиска.";
      } else if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        userFriendlyMessage = "Ошибка авторизации. Пожалуйста, войдите в систему заново.";
      } else if (errorMessage.includes("500") || errorMessage.includes("Internal Server Error")) {
        userFriendlyMessage = "Внутренняя ошибка сервера. Пожалуйста, попробуйте позже или используйте обычные фильтры.";
      } else if (errorMessage.includes("Failed to fetch") || errorMessage.includes("Network")) {
        userFriendlyMessage = "Ошибка подключения к серверу. Проверьте интернет-соединение и попробуйте еще раз.";
      }
      
      console.error("Smart search error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        errorMessage: userFriendlyMessage
      });
      
      // Показываем ошибку пользователю
      setAiSearchStatus("error");
      setAiExplanation(userFriendlyMessage);
      setIsSmartSearchActive(false);
      setRecommendedOrderIds([]);
      
      // При ошибке также пытаемся показать все заказы как fallback (опционально)
      // Но сначала показываем ошибку пользователю
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "32px 24px",
        maxWidth: 1600,
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
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 24,
              paddingBottom: 8,
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <div style={{ flex: 1 }}>
              <Title
                level={1}
                style={{
                  margin: 0,
                  fontSize: 28,
                  lineHeight: "36px",
                  fontWeight: 600,
                  color: token.colorTextHeading,
                  letterSpacing: "-0.02em",
                }}
              >
                {userRole === "client" ? "Мои заказы" : "Все заказы"}
              </Title>
              <Text
                type="secondary"
                style={{
                  fontSize: 14,
                  lineHeight: "22px",
                  display: "block",
                  marginTop: 8,
                  color: token.colorTextSecondary,
                }}
              >
                {userRole === "client"
                  ? "Управляйте своими проектами и отслеживайте прогресс"
                  : "Найдите подходящие проекты и начните работу"}
              </Text>
            </div>

            {userRole === "client" && (
              <Space size={10}>
                <Link href="/orders/create?ai=true">
                  <Button
                    type="default"
                    icon={<Sparkles size={16} />}
                    size="large"
                    style={{
                      fontSize: 14,
                      lineHeight: "22px",
                      height: 40,
                      fontWeight: 500,
                      borderRadius: token.borderRadius,
                    }}
                  >
                    Быстрое создание
                  </Button>
                </Link>
                <Link href="/orders/create">
                  <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    size="large"
                    style={{
                      fontSize: 14,
                      lineHeight: "22px",
                      height: 40,
                      fontWeight: 500,
                      borderRadius: token.borderRadius,
                    }}
                  >
                    Создать заказ
                  </Button>
                </Link>
              </Space>
            )}
          </div>

          {/* Main Content: Filters + Orders */}
          <Row gutter={[32, 32]} align="top">
            {/* Left Sidebar: Filters - скрыто на мобильных */}
            <Col xs={0} lg={6} xl={5}>
              <Affix offsetTop={32}>
                <Card
                  style={{
                    borderRadius: token.borderRadius,
                    borderColor: token.colorBorder,
                    position: "sticky",
                    top: 32,
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
                  }}
                  styles={{
                    body: { padding: 24 },
                  }}
                >
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
                </Card>
              </Affix>
            </Col>

            {/* Right Content: Orders List */}
            <Col xs={24} lg={18} xl={19}>
              {/* AI Search Status */}
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
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Card
                      key={i}
                      style={{
                        borderRadius: token.borderRadius,
                        borderColor: token.colorBorder,
                      }}
                      styles={{
                        body: { padding: "20px 24px" },
                      }}
                    >
                      <Skeleton active paragraph={{ rows: 3 }} />
                    </Card>
                  ))}
                </Space>
              ) : orders.length === 0 ? (
                <Card
                  style={{
                    borderRadius: token.borderRadius,
                    borderColor: token.colorBorder,
                    textAlign: "center",
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
                  }}
                  styles={{
                    body: { padding: "80px 24px" },
                  }}
                >
                  <Empty
                    image={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: 20,
                        }}
                      >
                        <div
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: token.borderRadius,
                            background: `${token.colorPrimary}08`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Inbox
                            size={40}
                            strokeWidth={1.5}
                            style={{ color: token.colorPrimary }}
                          />
                        </div>
                      </div>
                    }
                    description={
                      <Space direction="vertical" size={8}>
                        <Text
                          strong
                          style={{
                            fontSize: 16,
                            lineHeight: "24px",
                            display: "block",
                            color: token.colorTextHeading,
                            fontWeight: 600,
                          }}
                        >
                          {search || statusFilter !== "all" || (skillsFilter && skillsFilter.length > 0) || budgetMin !== undefined || budgetMax !== undefined
                            ? "Заказы не найдены"
                            : userRole === "client"
                            ? "У вас пока нет заказов"
                            : "Нет доступных заказов"}
                        </Text>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 14,
                            lineHeight: "22px",
                            display: "block",
                            color: token.colorTextSecondary,
                          }}
                        >
                          {search || statusFilter !== "all" || (skillsFilter && skillsFilter.length > 0) || budgetMin !== undefined || budgetMax !== undefined
                            ? "Попробуйте изменить критерии поиска или сбросить фильтры"
                            : userRole === "client"
                            ? "Создайте первый заказ и найдите исполнителя"
                            : "Новые заказы появятся здесь"}
                        </Text>
                      </Space>
                    }
                  >
                    {userRole === "client" && !(search || statusFilter !== "all" || (skillsFilter && skillsFilter.length > 0) || budgetMin !== undefined || budgetMax !== undefined) && (
                      <Space size={10} style={{ marginTop: 24 }}>
                        <Link href="/orders/create?ai=true">
                          <Button
                            type="default"
                            icon={<Sparkles size={16} />}
                            size="large"
                            style={{
                              fontSize: 14,
                              lineHeight: "22px",
                              height: 40,
                              borderRadius: token.borderRadius,
                              fontWeight: 500,
                            }}
                          >
                            Быстрое создание
                          </Button>
                        </Link>
                        <Link href="/orders/create">
                          <Button
                            type="primary"
                            icon={<Plus size={16} />}
                            size="large"
                            style={{
                              fontSize: 14,
                              lineHeight: "22px",
                              height: 40,
                              borderRadius: token.borderRadius,
                              fontWeight: 500,
                            }}
                          >
                            Создать заказ
                          </Button>
                        </Link>
                      </Space>
                    )}
                  </Empty>
                </Card>
              ) : (
                <Space direction="vertical" size={20} style={{ width: "100%" }}>
                  {/* Results Count */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 12,
                      paddingBottom: 8,
                      borderBottom: `1px solid ${token.colorBorderSecondary}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 13,
                          lineHeight: "20px",
                          color: token.colorTextSecondary,
                          fontWeight: 500,
                        }}
                      >
                        {isSmartSearchActive ? "Рекомендовано AI: " : "Найдено заказов: "}
                        <Text
                          strong
                          style={{
                            color: token.colorTextHeading,
                            fontWeight: 600,
                          }}
                        >
                          {total}
                        </Text>
                      </Text>
                      {isSmartSearchActive && (
                        <Space size={4}>
                          <Button
                            type="text"
                            size="small"
                            icon={<RefreshCw size={12} />}
                            onClick={() => handleSmartSearch(true)}
                            loading={aiSearchStatus === "analyzing"}
                            disabled={aiSearchStatus === "analyzing"}
                            style={{
                              fontSize: 11,
                              height: 20,
                              padding: "0 6px",
                              color: token.colorTextSecondary,
                            }}
                            title="Обновить рекомендации"
                          >
                            Обновить
                          </Button>
                          <Button
                            type="text"
                            size="small"
                            icon={<X size={12} />}
                            onClick={() => {
                              setIsSmartSearchActive(false);
                              setRecommendedOrderIds([]);
                              setRecommendedOrdersMap(new Map());
                              setCurrentPage(1);
                              setAiSearchStatus("idle");
                              setAiExplanation("");
                              clearCache();
                            }}
                            style={{
                              fontSize: 11,
                              height: 20,
                              padding: "0 6px",
                              color: token.colorTextSecondary,
                            }}
                            title="Сбросить поиск"
                          >
                            Сбросить
                          </Button>
                        </Space>
                      )}
                    </div>
                  </div>

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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        paddingTop: 24,
                        borderTop: `1px solid ${token.colorBorderSecondary}`,
                      }}
                    >
                      <Pagination
                        current={currentPage}
                        total={total}
                        pageSize={PAGE_SIZE}
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={false}
                        showTotal={(total, range) => (
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 13,
                              lineHeight: "20px",
                              color: token.colorTextSecondary,
                            }}
                          >
                            {range[0]}-{range[1]} из {total}
                          </Text>
                        )}
                      />
                    </div>
                  )}
                </Space>
              )}
            </Col>
          </Row>
        </Space>
      </motion.div>
    </div>
  );
}
