'use client';

import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { ruRU } from '@mui/material/locale';
import type { ReactNode } from 'react';
import { useMemo, useContext, createContext, useState, useEffect } from 'react';

const getTheme = (mode: 'light' | 'dark') =>
  createTheme(
    {
      palette: {
        mode,
        primary: {
          main: '#14b8a6',
          light: '#5eead4',
          dark: '#0d9488',
          contrastText: mode === 'dark' ? '#f0fdfa' : '#ffffff',
        },
        secondary: {
          main: '#99f6e4',
          light: '#ccfbf1',
          dark: '#5eead4',
          contrastText: mode === 'dark' ? '#0a1110' : '#0f172a',
        },
        success: {
          main: '#0d9488',
          light: '#14b8a6',
          dark: '#0f766e',
        },
        warning: {
          main: '#fbbf24',
          light: '#fcd34d',
          dark: '#f59e0b',
        },
        error: {
          main: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
        },
        info: {
          main: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
        },
        background: {
          default: mode === 'dark' ? '#0a1110' : '#f8fafc',
          paper: mode === 'dark' ? '#0d1615' : '#ffffff',
        },
        text: {
          primary: mode === 'dark' ? '#f0fdfa' : '#0f172a',
          secondary: mode === 'dark' ? '#ccfbf1' : '#475569',
          disabled: mode === 'dark' ? '#5eead4' : '#94a3b8',
        },
        divider: mode === 'dark' ? '#1f2e2c' : '#e2e8f0',
      },
    typography: {
      fontFamily: 'var(--font-inter)',
      fontSize: 14,
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.8125rem',
        lineHeight: 1.5,
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          body: {
            scrollbarColor: theme.palette.mode === 'dark' ? '#1f2e2c #0a1110' : '#cbd5e1 #f8fafc',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: theme.palette.mode === 'dark' ? '#1f2e2c' : '#cbd5e1',
              minHeight: 24,
            },
            '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? '#2d4340' : '#94a3b8',
            },
            '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
              backgroundColor: theme.palette.mode === 'dark' ? '#0a1110' : '#f8fafc',
            },
          },
        }),
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '10px 24px',
            fontSize: '0.875rem',
            fontWeight: 500,
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(20, 184, 166, 0.25)',
            },
          },
          sizeLarge: {
            padding: '14px 32px',
            fontSize: '0.9375rem',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            borderRadius: 12,
            border: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 12,
          },
          elevation1: {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          },
          elevation2: {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
          },
          elevation3: {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              '& fieldset': {
                borderColor: theme.palette.divider,
              },
              '&:hover fieldset': {
                borderColor: theme.palette.mode === 'dark' ? '#2d4340' : '#94a3b8',
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
          }),
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            borderRadius: 12,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: ({ theme }) => ({
            backgroundImage: 'none',
            borderRight: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiPaper-root': {
              borderRadius: 12,
              backgroundColor: theme.palette.mode === 'dark' ? '#111a19' : '#ffffff',
            },
          }),
        },
      },
    },
  },
  ruRU
);

// Theme Context
type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a MuiProvider');
  }
  return context;
}

interface MuiProviderProps {
  children: ReactNode;
}

export function MuiProvider({ children }: MuiProviderProps) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme) {
      setMode(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', mode);
      document.documentElement.classList.toggle('dark', mode === 'dark');
      document.documentElement.classList.toggle('light', mode === 'light');
    }
  }, [mode, mounted]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
