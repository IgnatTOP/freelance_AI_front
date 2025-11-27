"use client";

import { useState, useRef } from "react";
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
            style={floatingStyles}
            initial={{ opacity: 0, scale: 0.8, y: isBottom ? -8 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: isBottom ? -8 : 8 }}
            transition={{ duration: 0.2 }}
            className="z-50 pointer-events-none"
          >
            <div
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

