"use client";

import { Card, CardContent, type CardProps } from "@mui/material";
import type { ReactNode } from "react";
import { radius } from "@/src/shared/lib/constants/design";

interface StyledCardProps extends Omit<CardProps, "children"> {
  children: ReactNode;
  interactive?: boolean;
  padding?: number;
  noPadding?: boolean;
}

export function StyledCard({ children, interactive = false, padding = 2, noPadding = false, sx, ...props }: StyledCardProps) {
  return (
    <Card
      sx={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: `${radius.lg}px`,
        ...(interactive && {
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "var(--primary)",
            transform: "translateY(-2px)",
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {noPadding ? children : <CardContent sx={{ p: padding }}>{children}</CardContent>}
    </Card>
  );
}
