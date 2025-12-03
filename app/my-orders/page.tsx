"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OrderListFeature } from "@/src/features/orders/order-list";
import { useAuth } from "@/src/shared/lib/hooks";
import { toastService } from "@/src/shared/lib/toast";
import { LoadingState } from "@/src/shared/ui";

export default function MyOrdersPage() {
  const router = useRouter();
  const { userRole, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        toastService.warning("Необходимо авторизоваться");
        router.push("/auth/login");
        return;
      }
      if (userRole === "freelancer") {
        router.push("/orders/in-progress");
      }
    }
  }, [loading, isAuthenticated, userRole, router]);

  if (loading) {
    return <LoadingState type="spinner" />;
  }

  if (userRole !== "client" && userRole !== "admin") {
    return null;
  }

  return <OrderListFeature userRole="client" isMarketplace={false} />;
}
