"use client";

import { Stack, Typography, Box } from "@mui/material";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { iconSize } from "@/src/shared/lib/constants/design";

interface SectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  action?: ReactNode;
  iconColor?: string;
}

export function SectionHeader({ icon: Icon, title, action, iconColor = "var(--primary)" }: SectionHeaderProps) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" spacing={1} alignItems="center">
        {Icon && <Icon size={iconSize.md} style={{ color: iconColor }} />}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 14 }}>
          {title}
        </Typography>
      </Stack>
      {action && <Box>{action}</Box>}
    </Stack>
  );
}
