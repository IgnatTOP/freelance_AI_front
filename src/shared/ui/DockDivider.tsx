/**
 * Общий компонент разделителя для Dock навигации
 */

"use client";

import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export function DockDivider() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: 32,
        width: '1px',
        background: theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.2)' : 'rgba(24, 144, 255, 0.15)',
      }}
    />
  );
}


