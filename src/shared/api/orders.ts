/**
 * API для работы с заказами
 */

import api from "../lib/api/axios";
import type {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderListParams,
  OrderListResponse,
  MyOrdersResponse,
} from "@/src/entities/order/model/types";

/**
 * Получить список заказов
 */
export const getOrders = async (params?: OrderListParams): Promise<OrderListResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params?.search) searchParams.append("search", params.search);
  if (params?.status) searchParams.append("status", params.status);
  if (params?.skills) {
    // Если skills - массив, объединяем через запятую
    const skillsStr = Array.isArray(params.skills) 
      ? params.skills.join(",") 
      : params.skills;
    searchParams.append("skills", skillsStr);
  }
  if (params?.budget_min !== undefined) {
    searchParams.append("budget_min", String(params.budget_min));
  }
  if (params?.budget_max !== undefined) {
    searchParams.append("budget_max", String(params.budget_max));
  }
  if (params?.sort_by) searchParams.append("sort_by", params.sort_by);
  if (params?.sort_order) searchParams.append("sort_order", params.sort_order);
  if (params?.limit) searchParams.append("limit", String(params.limit));
  if (params?.offset) searchParams.append("offset", String(params.offset));
  
  const response = await api.get<OrderListResponse>(`/orders?${searchParams.toString()}`);
  return response.data;
};

/**
 * Получить заказ по ID
 */
export const getOrder = async (id: string): Promise<Order> => {
  const response = await api.get<Order>(`/orders/${id}`);
  return response.data;
};

/**
 * Создать заказ
 */
export const createOrder = async (data: CreateOrderRequest): Promise<Order> => {
  const response = await api.post<Order>("/orders", data);
  return response.data;
};

/**
 * Обновить заказ
 */
export const updateOrder = async (id: string, data: UpdateOrderRequest): Promise<Order> => {
  const response = await api.put<Order>(`/orders/${id}`, data);
  return response.data;
};

/**
 * Удалить заказ
 */
export const deleteOrder = async (id: string): Promise<void> => {
  await api.delete(`/orders/${id}`);
};

/**
 * Получить свои заказы
 */
export const getMyOrders = async (): Promise<MyOrdersResponse> => {
  const response = await api.get<MyOrdersResponse>("/orders/my");
  return response.data;
};

/**
 * Отметить заказ как выполненный (для исполнителя)
 */
export const markOrderAsCompletedByFreelancer = async (orderId: string): Promise<Order> => {
  const response = await api.post<{ order: Order; message: string }>(`/orders/${orderId}/complete-by-freelancer`);
  return response.data.order;
};

/**
 * Получить заказы по списку ID
 */
export const getOrdersByIds = async (ids: string[]): Promise<Order[]> => {
  const orders: Order[] = [];
  await Promise.all(
    ids.map(async (id) => {
      try {
        const order = await getOrder(id);
        orders.push(order);
      } catch {
        // Игнорируем ошибки для отдельных заказов
      }
    })
  );
  return orders;
};

