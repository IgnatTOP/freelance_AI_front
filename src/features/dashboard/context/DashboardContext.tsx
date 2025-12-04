"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { getDashboardData, type DashboardData } from "@/src/shared/api/dashboard";
import { useAuth } from "@/src/shared/lib/hooks";
import { parseActivities, type Activity } from "@/src/shared/lib/utils/activity-parser";

type DashboardRole = "client" | "freelancer" | null;

interface DashboardContextValue {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  activities: Activity[];
  aiLoading: boolean;
  loadAIRecommendations: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

interface DashboardProviderProps {
  children: React.ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const { user, userRole: rawUserRole, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Normalize userRole (admin -> client)
  const userRole: DashboardRole = rawUserRole === "admin" ? "client" : rawUserRole;

  const fetchData = useCallback(async () => {
    if (!user || authLoading) return;

    try {
      setLoading(true);
      setError(null);
      const dashboardData = await getDashboardData(false);
      setData(dashboardData);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch dashboard data"));
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadAIRecommendations = useCallback(async () => {
    if (!user || authLoading || !userRole) return;

    try {
      setAiLoading(true);
      const dashboardDataWithAI = await getDashboardData(true);
      
      setData((prev) => prev 
        ? { ...prev, ai_recommendations: dashboardDataWithAI.ai_recommendations }
        : dashboardDataWithAI
      );
    } catch (err) {
      console.error("Failed to fetch AI recommendations:", err);
    } finally {
      setAiLoading(false);
    }
  }, [user, userRole, authLoading]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (userRole && !authLoading) {
      fetchData();
    }
  }, [userRole, authLoading, fetchData]);

  // Parse activities using shared utility
  const activities = useMemo(() => 
    parseActivities(data?.activities || [], userRole),
    [data?.activities, userRole]
  );

  // Auto-load AI recommendations once after initial data load
  const [aiLoadedOnce, setAiLoadedOnce] = useState(false);
  
  useEffect(() => {
    if (!loading && data && !aiLoadedOnce && !aiLoading) {
      setAiLoadedOnce(true);
      const timer = setTimeout(loadAIRecommendations, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, data, aiLoadedOnce, aiLoading, loadAIRecommendations]);

  const value: DashboardContextValue = useMemo(() => ({
    data,
    loading,
    error,
    refetch,
    activities,
    aiLoading,
    loadAIRecommendations,
  }), [data, loading, error, refetch, activities, aiLoading, loadAIRecommendations]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
}

export function useDashboardData() {
  const context = useContext(DashboardContext);
  
  if (!context) {
    return {
      data: null,
      loading: false,
      error: null,
      refetch: async () => {},
      activities: [] as Activity[],
      aiLoading: false,
      loadAIRecommendations: async () => {},
    };
  }

  return context;
}
