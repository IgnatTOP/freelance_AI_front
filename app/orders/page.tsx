"use client";

import { OrderListFeature } from "@/src/features/orders/order-list";
import { useAuth } from "@/src/shared/lib/hooks";
import { LoadingState } from "@/src/shared/ui";

export default function OrdersPage() {
  const { userRole, loading } = useAuth();

  if (loading) {
    return <LoadingState type="spinner" />;
  }

  return <OrderListFeature userRole={userRole === "admin" ? "client" : userRole} isMarketplace />;
}
