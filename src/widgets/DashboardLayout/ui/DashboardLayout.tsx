/**
 * Layout компонент для страниц дашборда
 * Обеспечивает единообразную структуру для всех дашборд-страниц
 */

"use client";

import { ReactNode } from "react";
import { Box } from "@mui/material";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        backgroundColor: "transparent",
      }}
    >
      {children}
    </Box>
  );
}


