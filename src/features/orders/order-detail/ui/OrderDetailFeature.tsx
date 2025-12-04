"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Skeleton, Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { OrderDetailHeader } from "./OrderDetailHeader";
import { OrderDetailContent } from "./OrderDetailContent";
import { OrderDetailSidebar } from "./OrderDetailSidebar";
import { getOrder } from "@/src/shared/api/orders";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { useRequireAuth } from "@/src/shared/lib/hooks";
import { handleApiError } from "@/src/shared/lib/utils";
import type { Order } from "@/src/entities/order/model/types";

interface OrderDetailFeatureProps {
  orderId: string;
}

export function OrderDetailFeature({ orderId }: OrderDetailFeatureProps) {
  const router = useRouter();
  useRequireAuth();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [userRole, setUserRole] = useState<"client" | "freelancer" | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    const role = user?.role === "admin" ? "client" : (user?.role as "client" | "freelancer" | null);
    setUserRole(role);
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const orderData = await getOrder(orderId);
      setOrder(orderData);
    } catch (error) {
      handleApiError(error, "Ошибка загрузки заказа");
      router.push("/orders");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <Card sx={{ p: 3 }}>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="40%" sx={{ mt: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 3 }} />
          <Skeleton variant="text" sx={{ mt: 2 }} />
          <Skeleton variant="text" sx={{ mt: 1 }} />
          <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
        </Card>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ py: 4 }}>
        <Card sx={{ p: 6, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            Заказ не найден
          </Typography>
        </Card>
      </Box>
    );
  }

  const currentUser = authService.getCurrentUser();
  const isOwner = Boolean(userRole === "client" && currentUser && String(order.client_id) === String(currentUser.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <OrderDetailHeader order={order} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <OrderDetailContent order={order} />
        </div>

        {/* Sidebar */}
        <OrderDetailSidebar
          order={order}
          userRole={userRole}
          isOwner={isOwner}
          orderId={orderId}
        />
      </div>
    </motion.div>
  );
}

