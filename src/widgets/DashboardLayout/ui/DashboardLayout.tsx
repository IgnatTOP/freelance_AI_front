/**
 * Layout компонент для страниц дашборда
 * Обеспечивает единообразную структуру для всех дашборд-страниц
 */

"use client";

import { ReactNode } from "react";
import { Layout } from "antd";

const { Content } = Layout;

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Content>{children}</Content>
    </Layout>
  );
}


