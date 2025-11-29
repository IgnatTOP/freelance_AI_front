'use client';

import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { ruRU } from '@mui/material/locale';
import type { ReactNode } from 'react';

const darkGreenTheme = createTheme(
  {
    palette: {
      mode: 'dark',
      primary: {
        main: '#14b8a6',
        light: '#5eead4',
        dark: '#0d9488',
        contrastText: '#f0fdfa',
      },
      secondary: {
        main: '#99f6e4',
        light: '#ccfbf1',
        dark: '#5eead4',
        contrastText: '#0a1110',
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
        default: '#0a1110',
        paper: '#0d1615',
      },
      text: {
        primary: '#f0fdfa',
        secondary: '#ccfbf1',
        disabled: '#5eead4',
      },
      divider: '#1f2e2c',
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
        styleOverrides: {
          body: {
            scrollbarColor: '#1f2e2c #0a1110',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: '#1f2e2c',
              minHeight: 24,
            },
            '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#2d4340',
            },
            '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
              backgroundColor: '#0a1110',
            },
          },
        },
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
          root: {
            backgroundColor: '#0d1615',
            backgroundImage: 'none',
            borderRadius: 12,
            border: '1px solid #1f2e2c',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: '#0d1615',
            borderRadius: 12,
          },
          elevation1: {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          },
          elevation2: {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          },
          elevation3: {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: '#0d1615',
              '& fieldset': {
                borderColor: '#1f2e2c',
              },
              '&:hover fieldset': {
                borderColor: '#2d4340',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#14b8a6',
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            borderRadius: 12,
            backgroundColor: '#0d1615',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: '#0d1615',
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#0d1615',
            backgroundImage: 'none',
            borderBottom: '1px solid #1f2e2c',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: '#0d1615',
            backgroundImage: 'none',
            borderRight: '1px solid #1f2e2c',
          },
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
          root: {
            '& .MuiPaper-root': {
              borderRadius: 12,
              backgroundColor: '#111a19',
            },
          },
        },
      },
    },
  },
  ruRU
);

interface MuiProviderProps {
  children: ReactNode;
}

export function MuiProvider({ children }: MuiProviderProps) {
  return (
    <ThemeProvider theme={darkGreenTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
