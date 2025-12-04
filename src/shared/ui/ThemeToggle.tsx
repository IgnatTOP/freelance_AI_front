'use client';

import { IconButton, Tooltip } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useTheme } from '@/src/app/providers';

export function ThemeToggle() {
  const { mode, toggleTheme } = useTheme();

  return (
    <Tooltip title={mode === 'dark' ? 'Светлая тема' : 'Темная тема'}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          color: 'text.primary',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'rotate(180deg)',
            bgcolor: 'action.hover',
          },
        }}
      >
        {mode === 'dark' ? <LightMode /> : <DarkMode />}
      </IconButton>
    </Tooltip>
  );
}
