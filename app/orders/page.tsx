"use client";

import { Box } from "@mui/material";
import { OrderListFeature } from "@/src/features/orders/order-list";
import { useAuth } from "@/src/shared/lib/hooks";
import { Metadata } from "next";

// Note: Metadata export doesn't work with "use client" components
// This should be moved to a layout or wrapper component
// For now, we'll handle SEO via head tags in the component

export default function OrdersPage() {
  const { userRole } = useAuth();

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <OrderListFeature userRole={userRole} />
    </Box>
  );
}
