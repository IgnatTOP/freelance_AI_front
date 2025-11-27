/**
 * Общие стили и константы для хедеров
 */

export const headerStyles = {
  desktop: {
    background: "rgba(17, 26, 21, 0.7)",
    backdropFilter: "blur(40px)",
    border: "1px solid var(--primary-15)",
    boxShadow: {
      default: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--primary-08)",
      scrolled: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--primary-10)",
    },
  },
  mobile: {
    background: "rgba(17, 26, 21, 0.8)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid var(--primary-15)",
    boxShadow: "0 2px 16px rgba(0, 0, 0, 0.2)",
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
} as const;


