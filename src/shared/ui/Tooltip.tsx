"use client";

import { useState, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import {
  useFloating,
  autoUpdate,
  offset,
  shift,
  flip,
  arrow,
  Placement,
} from "@floating-ui/react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  label: string;
  children: React.ReactElement;
  placement?: Placement;
}

export function Tooltip({ label, children, placement = "bottom" }: TooltipProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef<HTMLDivElement>(null);

  const { refs, floatingStyles, middlewareData, placement: finalPlacement } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      shift({ padding: 8 }),
      flip({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
  });

  const isBottom = finalPlacement?.startsWith("bottom");

  return (
    <>
      <div
        ref={refs.setReference}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={refs.setFloating}
            style={{ ...floatingStyles, zIndex: 50, pointerEvents: 'none' }}
            initial={{ opacity: 0, scale: 0.8, y: isBottom ? -8 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: isBottom ? -8 : 8 }}
            transition={{ duration: 0.2 }}
          >
            <div
              style={{
                position: 'relative',
                whiteSpace: 'nowrap',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
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
                    left: middlewareData.arrow.x != null ? `${middlewareData.arrow.x}px` : undefined,
                    top: middlewareData.arrow.y != null ? `${middlewareData.arrow.y}px` : undefined,
                    [isBottom ? "top" : "bottom"]: "-4px",
                  }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

