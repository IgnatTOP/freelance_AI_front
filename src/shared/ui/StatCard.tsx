"use client";

import { Stack, Typography } from "@mui/material";
import type { LucideIcon } from "lucide-react";
import { StyledCard } from "./StyledCard";
import { IconBox } from "./IconBox";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string;
  bg?: string;
}

export function StatCard({ icon, label, value, color = "var(--primary)", bg = "var(--primary-10)" }: StatCardProps) {
  return (
    <StyledCard sx={{ height: "100%" }}>
      <Stack spacing={1}>
        <IconBox icon={icon} size="lg" color={color} bg={bg} />
        <Typography variant="caption" sx={{ color: "var(--text-muted)", fontSize: 12 }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 600, color: "var(--text)" }}>
          {value}
        </Typography>
      </Stack>
    </StyledCard>
  );
}
