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
            whileTap={{ scale: 0.95 }}
            className="p-2 text-foreground hover:text-primary transition-colors"
            onClick={onToggle}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </nav>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={mobileMenuAnimations.initial}
              animate={mobileMenuAnimations.animate}
              exit={mobileMenuAnimations.exit}
              transition={mobileMenuAnimations.transition}
              className="py-4 border-t overflow-hidden"
              style={{
                borderColor: headerStyles.border.color,
              }}
            >
              <div className="flex flex-col space-y-4">
                {menuItems}
                {actions && (
                  <div
                    className="flex flex-col space-y-2 pt-4 border-t"
                    style={{
                      borderColor: headerStyles.border.color,
                    }}
                  >
                    {actions}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}


