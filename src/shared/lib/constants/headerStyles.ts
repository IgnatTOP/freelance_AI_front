/**
 * Общие стили и константы для хедеров
 */

export const headerStyles = {
  desktop: {
    background: "var(--glass-bg)",
    backdropFilter: "blur(40px)",
    border: "1px solid var(--glass-border)",
    boxShadow: {
      default: "var(--glass-shadow), 0 0 0 1px var(--primary-08)",
      scrolled: "var(--shadow-md), 0 0 0 1px var(--primary-10)",
    },
  },
  mobile: {
    background: "var(--glass-bg)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid var(--glass-border)",
    boxShadow: "var(--shadow-sm)",
  },
  divider: {
    background: "var(--primary-20)",
  },
  border: {
    color: "var(--primary-15)",
  },
} as const;

export const headerAnimations = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
} as const;

export const mobileMenuAnimations = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
  transition: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
    opacity: { duration: 0.2 },
    height: { duration: 0.3 }
  },
} as const;


