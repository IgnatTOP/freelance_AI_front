/**
 * Общий компонент логотипа для Dock навигации
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "@mui/material/styles";

interface DockLogoProps {
  href?: string;
  size?: number;
}

export function DockLogo({ href, size = 40 }: DockLogoProps) {
  const theme = useTheme();

  const logoContent = (
    <motion.div
      whileHover={{ scale: 1.2, rotate: 360 }}
      whileTap={{ scale: 0.9 }}
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(24, 144, 255, 0.2), rgba(24, 144, 255, 0.15))'
          : 'linear-gradient(135deg, rgba(24, 144, 255, 0.15), rgba(24, 144, 255, 0.1))',
        transition: "all 0.2s ease",
      }}
    >
      <span
        style={{
          fontSize: 20,
          fontWeight: 700,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        M
      </span>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

