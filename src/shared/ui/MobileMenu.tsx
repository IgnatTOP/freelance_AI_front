/**
 * Переиспользуемый компонент мобильного меню
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { headerStyles, mobileMenuAnimations } from "@/src/shared/lib/constants/headerStyles";
import type { ReactNode } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  logo: ReactNode;
  menuItems: ReactNode;
  actions?: ReactNode;
  brandName?: string;
}

export function MobileMenu({
  isOpen,
  onToggle,
  onClose,
  logo,
  menuItems,
  actions,
  brandName,
}: MobileMenuProps) {
  return (
    <motion.header
      className="lg:hidden fixed top-0 left-0 right-0 z-[100]"
      style={{
        background: headerStyles.mobile.background,
        backdropFilter: headerStyles.mobile.backdropFilter,
        WebkitBackdropFilter: headerStyles.mobile.backdropFilter,
        borderBottom: headerStyles.mobile.borderBottom,
        boxShadow: headerStyles.mobile.boxShadow,
      }}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 group">
            {logo}
            {brandName && (
              <span className="text-lg font-bold text-foreground hidden sm:block">
                {brandName}
              </span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-foreground hover:text-primary transition-colors"
            onClick={onToggle}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isOpen ? "close" : "menu"}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </nav>

        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              {...mobileMenuAnimations}
              className="py-4 border-t overflow-hidden"
              style={{
                borderColor: headerStyles.border.color,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
                className="flex flex-col space-y-4"
              >
                {menuItems}
                {actions && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="flex flex-col space-y-2 pt-4 border-t"
                    style={{
                      borderColor: headerStyles.border.color,
                    }}
                  >
                    {actions}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}


