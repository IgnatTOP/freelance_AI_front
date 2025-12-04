"use client";

import Link from "next/link";
import { Typography, Box } from "@mui/material";
import type { LucideIcon } from "lucide-react";
import { StyledCard } from "./StyledCard";
import { IconBox } from "./IconBox";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  href: string;
}

export function ActionCard({ icon, title, href }: ActionCardProps) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <StyledCard interactive sx={{ textAlign: "center" }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
          <IconBox icon={icon} size="md" />
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 13, color: "var(--text)" }}>
          {title}
        </Typography>
      </StyledCard>
    </Link>
  );
}
