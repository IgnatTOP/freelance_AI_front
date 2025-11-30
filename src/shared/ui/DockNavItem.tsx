/**
 * Общий компонент элемента навигации для macOS Dock
 */

"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useTheme } from "@mui/material/styles";
import {
  useFloating,
  autoUpdate,
  offset,
  arrow,
  FloatingPortal,
} from "@floating-ui/react";

interface DockNavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
  isHovered?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  scale?: number;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function DockNavItem({
  href,
  label,
  icon: Icon,
  isActive = false,
  isHovered = false,
  onHoverStart,
  onHoverEnd,
  scale = 1,
  onClick,
}: DockNavItemProps) {
  const theme = useTheme();
  const arrowRef = useRef<HTMLDivElement>(null);

  const { refs, floatingStyles, middlewareData } = useFloating({
    open: isHovered,
    placement: "bottom",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      arrow({ element: arrowRef }),
    ],
  });

  const handleMouseEnter = () => {
    onHoverStart?.();
  };

  const handleMouseLeave = () => {
    onHoverEnd?.();
  };

  return (
    <>
      <Link
        href={href}
        onClick={onClick}
        className="flex items-center justify-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          ref={refs.setReference}
          animate={{
            scale,
            y: isHovered ? -12 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className="relative cursor-pointer"
          style={{
            width: "44px",
            height: "44px",
            transformOrigin: "center bottom",
          }}
        >
          {/* Icon Container */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isActive
                ? (theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.2)' : 'rgba(24, 144, 255, 0.15)')
                : isHovered
                ? (theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.15)' : 'rgba(24, 144, 255, 0.1)')
                : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            <Icon
              size={20}
              style={{
                color: isActive
                  ? theme.palette.primary.main
                  : isHovered
                  ? theme.palette.primary.light
                  : theme.palette.mode === 'dark' ? "rgba(240, 253, 244, 0.7)" : "rgba(0, 0, 0, 0.6)",
                transition: "color 0.2s ease",
              }}
            />
          </div>
        </motion.div>
      </Link>

      {/* Tooltip via FloatingPortal */}
      {isHovered && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{ ...floatingStyles, zIndex: 100, pointerEvents: 'none' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'relative',
                whiteSpace: 'nowrap',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: '12px',
                fontWeight: 500,
                background: theme.palette.mode === 'dark' ? "rgba(17, 26, 21, 0.95)" : "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.2)' : 'rgba(24, 144, 255, 0.15)'}`,
                color: theme.palette.mode === 'dark' ? "#f0fdf4" : "#000",
                boxShadow: theme.shadows[4],
              }}
            >
              {label}
              {/* Arrow */}
              {middlewareData.arrow && (
                <div
                  ref={arrowRef}
                  style={{
                    position: 'absolute',
                    width: 8,
                    height: 8,
                    transform: 'rotate(45deg)',
                    background: theme.palette.mode === 'dark' ? "rgba(17, 26, 21, 0.95)" : "rgba(255, 255, 255, 0.95)",
                    borderLeft: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.2)' : 'rgba(24, 144, 255, 0.15)'}`,
                    borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.2)' : 'rgba(24, 144, 255, 0.15)'}`,
                    left: middlewareData.arrow.x != null ? `${middlewareData.arrow.x}px` : "50%",
                    top: middlewareData.arrow.y != null ? `${middlewareData.arrow.y}px` : undefined,
                    ...(middlewareData.arrow.x == null ? { transform: 'translateX(-50%) rotate(45deg)' } : {}),
                    bottom: "-4px",
                  }}
                />
              )}
            </motion.div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

