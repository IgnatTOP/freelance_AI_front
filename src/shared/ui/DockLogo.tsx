/**
 * Общий компонент логотипа для Dock навигации
 */

import Link from "next/link";
import { motion } from "framer-motion";

interface DockLogoProps {
  href?: string;
  size?: number;
}

export function DockLogo({ href, size = 40 }: DockLogoProps) {
  const logoContent = (
    <motion.div
      whileHover={{ scale: 1.2, rotate: 360 }}
      whileTap={{ scale: 0.9 }}
      className="w-10 h-10 rounded-xl flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, var(--primary-20), rgba(var(--primary-dark-rgb), 0.2))",
        transition: "all 0.2s ease",
      }}
    >
      <span
        className="text-xl font-bold"
        style={{
          background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        M
      </span>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center justify-center group">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

