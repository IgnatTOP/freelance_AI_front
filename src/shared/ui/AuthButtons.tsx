/**
 * Переиспользуемые кнопки авторизации
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { LogIn, UserPlus, LayoutDashboard } from "lucide-react";

interface AuthButtonsProps {
  isAuthenticated: boolean;
  showLabels?: boolean;
  size?: "sm" | "default";
  className?: string;
}

export function AuthButtons({
  isAuthenticated,
  showLabels = false,
  size = "sm",
  className = "",
}: AuthButtonsProps) {
  const theme = useTheme();
  const buttonSize = size === "default" ? "medium" : "small";

  if (isAuthenticated) {
    return (
      <Link href="/dashboard" style={{ textDecoration: 'none' }}>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outlined"
            size={buttonSize}
            startIcon={<LayoutDashboard size={16} />}
            sx={{
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(24, 144, 255, 0.2), rgba(24, 144, 255, 0.15))'
                : 'linear-gradient(135deg, rgba(24, 144, 255, 0.15), rgba(24, 144, 255, 0.1))',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.3)' : 'rgba(24, 144, 255, 0.2)',
              color: theme.palette.primary.main,
              '& .button-label': {
                display: 'none',
                '@media (min-width: 1280px)': {
                  display: 'inline',
                },
              },
            }}
          >
            {showLabels && <span className="button-label">Дашборд</span>}
          </Button>
        </motion.div>
      </Link>
    );
  }

  return (
    <>
      <Link href="/auth/login" style={{ textDecoration: 'none' }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outlined"
            size={buttonSize}
            startIcon={<LogIn size={16} />}
            sx={{
              '& .button-label': {
                display: 'none',
                '@media (min-width: 1280px)': {
                  display: 'inline',
                },
              },
            }}
          >
            {showLabels && <span className="button-label">Вход</span>}
          </Button>
        </motion.div>
      </Link>
      <Link href="/auth/register" style={{ textDecoration: 'none' }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="contained"
            size={buttonSize}
            startIcon={<UserPlus size={16} />}
            sx={{
              '& .button-label': {
                display: 'none',
                '@media (min-width: 1280px)': {
                  display: 'inline',
                },
              },
            }}
          >
            {showLabels && <span className="button-label">Регистрация</span>}
          </Button>
        </motion.div>
      </Link>
    </>
  );
}

interface MobileAuthButtonsProps {
  isAuthenticated: boolean;
  onClose: () => void;
}

export function MobileAuthButtons({
  isAuthenticated,
  onClose,
}: MobileAuthButtonsProps) {
  if (isAuthenticated) {
    return (
      <Link href="/dashboard" onClick={onClose} style={{ textDecoration: 'none' }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<LayoutDashboard size={18} />}
        >
          Дашборд
        </Button>
      </Link>
    );
  }

  return (
    <>
      <Link href="/auth/login" onClick={onClose} style={{ textDecoration: 'none' }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<LogIn size={18} />}
        >
          Вход
        </Button>
      </Link>
      <Link href="/auth/register" onClick={onClose} style={{ textDecoration: 'none' }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<UserPlus size={18} />}
        >
          Регистрация
        </Button>
      </Link>
    </>
  );
}

