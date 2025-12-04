"use client";

import { Box } from "@mui/material";
import type { LucideIcon } from "lucide-react";
import { radius, iconSize } from "@/src/shared/lib/constants/design";

interface IconBoxProps {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
  color?: string;
  bg?: string;
}

const sizeMap = {
  sm: { box: 24, icon: iconSize.xs },
  md: { box: 32, icon: iconSize.md },
  lg: { box: 40, icon: iconSize.lg },
};

export function IconBox({ icon: Icon, size = "md", color = "var(--primary)", bg = "var(--primary-10)" }: IconBoxProps) {
  const s = sizeMap[size];
  return (
    <Box
      sx={{
        width: s.box,
        height: s.box,
        borderRadius: `${radius.md}px`,
        bgcolor: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={s.icon} style={{ color }} />
    </Box>
  );
}
