import { api } from "../lib/api/axios";

// Dashboard data types
export interface DashboardStats {
    orders: {
        total: number;
        open: number;
        in_progress: number;
        completed: number;
        total_proposals: number;
    };
    proposals: {
        total: number;
        pending: number;
        accepted: number;
        rejected: number;
    };
    balance: number;
    average_rating: number;
    total_reviews: number;
    completion_rate: number;
    response_time_hours: number;
}

export interface DashboardActivity {
    id: string;
    user_id: string;
    payload: string;
    is_read: boolean;
    created_at: string;
}

export interface DashboardOrder {
    id: string;
    title: string;
    description: string;
    budget_min?: number;
    budget_max?: number;
    status: "draft" | "published" | "in_progress" | "completed" | "cancelled";
    deadline_at?: string;
    ai_summary?: string;
    created_at: string;
    proposals_count?: number;
    progress?: number;
}

export interface DashboardData {
    stats: DashboardStats;
    activities: DashboardActivity[];
    recent_orders: DashboardOrder[];
    ai_recommendations?: {
        recommended_orders?: Array<{
            order: DashboardOrder;
            match_score: number;
            explanation: string;
        }>;
        explanation?: string;
        suitable_freelancers?: Array<{
            freelancer_id: string;
            order_id: string;
            match_score: number;
            explanation: string;
        }>;
    };
    insights?: {
        orders_without_proposals?: DashboardOrder[];
    };
}

/**
 * Fetches aggregated dashboard data in a single request
 * @param includeAI - Whether to include AI recommendations (slower)
 * @returns Dashboard data including stats, activities, recent orders, and optionally AI recommendations
 */
export async function getDashboardData(includeAI = false): Promise<DashboardData> {
    const params = includeAI ? { include_ai: "true" } : {};
    // For AI requests, use longer timeout (60 seconds instead of 30)
    const timeout = includeAI ? 60000 : undefined;
    const response = await api.get<DashboardData>("/dashboard/data", { 
        params,
        timeout,
    });
    return response.data;
}
