"use client";

import { Stack, Typography } from "@mui/material";
import type { LucideIcon } from "lucide-react";
import { iconSize } from "@/src/shared/lib/constants/design";

interface MetaItemProps {
  icon: LucideIcon;
  children: React.ReactNode;
  size?: "sm" | "md";
}

const sizeMap = {
  sm: { icon: iconSize.xs, font: 11 },
  md: { icon: iconSize.sm, font: 13 },
};

export function MetaItem({ icon: Icon, children, size = "sm" }: MetaItemProps) {
  const s = sizeMap[size];
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Icon size={s.icon} style={{ color: "var(--text-muted)" }} />
      <Typography variant="caption" sx={{ color: "var(--text-muted)", fontSize: s.font }}>
        {children}
      </Typography>
    </Stack>
  );
}
