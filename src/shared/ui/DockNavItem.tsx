/**
 * Общий компонент элемента навигации для macOS Dock
 */

"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";
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
            className="relative w-full h-full rounded-xl flex items-center justify-center"
            style={{
              background: isActive
                ? "var(--primary-20)"
                : isHovered
                ? "var(--primary-15)"
                : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            <Icon
              size={20}
              style={{
                color: isActive
                  ? "var(--primary)"
                  : isHovered
                  ? "var(--primary-light)"
                  : "rgba(240, 253, 244, 0.7)",
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
            style={floatingStyles}
            className="z-[100] pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="relative whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium"
              style={{
                background: "rgba(17, 26, 21, 0.95)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid var(--primary-20)",
                color: "#f0fdf4",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
              }}
            >
              {label}
              {/* Arrow */}
              {middlewareData.arrow && (
                <div
                  ref={arrowRef}
                  className="absolute w-2 h-2 rotate-45"
                  style={{
                    background: "rgba(17, 26, 21, 0.95)",
                    borderLeft: "1px solid var(--primary-20)",
                    borderTop: "1px solid var(--primary-20)",
                    left: middlewareData.arrow.x != null ? `${middlewareData.arrow.x}px` : "50%",
                    top: middlewareData.arrow.y != null ? `${middlewareData.arrow.y}px` : undefined,
                    transform: middlewareData.arrow.x != null ? undefined : "translateX(-50%)",
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

