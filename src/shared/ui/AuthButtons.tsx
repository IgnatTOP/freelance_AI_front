/**
 * Переиспользуемые кнопки авторизации
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/src/shared/ui";
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
  // Map "default" to "md" for Button component
  const buttonSize = size === "default" ? "md" : size;
  
  if (isAuthenticated) {
    return (
      <Link href="/dashboard">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${className}`}
          style={{
            background: "linear-gradient(135deg, var(--primary-20), rgba(var(--primary-dark-rgb), 0.2))",
            border: "1px solid var(--primary-30)",
            color: "var(--primary)",
          }}
        >
          <LayoutDashboard size={16} />
          {showLabels && <span className="hidden xl:inline">Дашборд</span>}
        </motion.div>
      </Link>
    );
  }

  return (
    <>
      <Link href="/auth/login">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="glass"
            size={buttonSize}
            className={`flex items-center gap-1.5 ${className}`}
          >
            <LogIn size={16} />
            {showLabels && <span className="hidden xl:inline">Вход</span>}
          </Button>
        </motion.div>
      </Link>
      <Link href="/auth/register">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="primary"
            size={buttonSize}
            className={`flex items-center gap-1.5 ${className}`}
          >
            <UserPlus size={16} />
            {showLabels && <span className="hidden xl:inline">Регистрация</span>}
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
      <Link href="/dashboard" onClick={onClose}>
        <Button
          variant="primary"
          className="w-full flex items-center justify-center gap-1.5"
        >
          <LayoutDashboard size={18} />
          Дашборд
        </Button>
      </Link>
    );
  }

  return (
    <>
      <Link href="/auth/login" onClick={onClose}>
        <Button
          variant="glass"
          className="w-full flex items-center justify-center gap-1.5"
        >
          <LogIn size={18} />
          Вход
        </Button>
      </Link>
      <Link href="/auth/register" onClick={onClose}>
        <Button
          variant="primary"
          className="w-full flex items-center justify-center gap-1.5"
        >
          <UserPlus size={18} />
          Регистрация
        </Button>
      </Link>
    </>
  );
}

