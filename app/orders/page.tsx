"use client";

import { Layout } from "antd";
import { OrderListFeature } from "@/src/features/orders/order-list";
import { useAuth } from "@/src/shared/lib/hooks";
import { Metadata } from "next";

const { Content } = Layout;

// Note: Metadata export doesn't work with "use client" components
// This should be moved to a layout or wrapper component
// For now, we'll handle SEO via head tags in the component

export default function OrdersPage() {
  const { userRole } = useAuth();

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Content>
        <OrderListFeature userRole={userRole} />
      </Content>
    </Layout>
  );
}
