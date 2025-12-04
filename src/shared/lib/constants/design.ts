/**
 * Design System Constants
 * Единые константы для всего приложения
 */

// Spacing (в пикселях, кратно 4)
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// Border Radius
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 9999,
} as const;

// Font Sizes
export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
} as const;

// Icon Sizes
export const iconSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
} as const;

// Status Colors
export const statusColors = {
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#14b8a6",
  primary: "var(--primary)",
} as const;

// Order Status Config
export const orderStatusConfig = {
  draft: { label: "Черновик", color: "default" as const, bg: "var(--text-muted)" },
  published: { label: "Опубликован", color: "info" as const, bg: statusColors.info },
  in_progress: { label: "В работе", color: "warning" as const, bg: statusColors.warning },
  completed: { label: "Завершён", color: "success" as const, bg: statusColors.success },
  cancelled: { label: "Отменён", color: "error" as const, bg: statusColors.error },
} as const;

// Proposal Status Config
export const proposalStatusConfig = {
  pending: { label: "Ожидает", color: "info" as const, bg: statusColors.info },
  shortlisted: { label: "В шорт-листе", color: "warning" as const, bg: statusColors.warning },
  accepted: { label: "Принято", color: "success" as const, bg: statusColors.success },
  rejected: { label: "Отклонено", color: "error" as const, bg: statusColors.error },
} as const;

// Card Styles (для sx prop)
export const cardStyles = {
  base: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: radius.lg,
  },
  glass: {
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    border: "1px solid var(--glass-border)",
  },
  interactive: {
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: "var(--primary)",
      transform: "translateY(-2px)",
    },
  },
} as const;

// Common SX Styles
export const sx = {
  // Flex utilities
  flexCenter: { display: "flex", alignItems: "center", justifyContent: "center" },
  flexBetween: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  flexStart: { display: "flex", alignItems: "center", justifyContent: "flex-start" },
  
  // Text truncate
  truncate: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  lineClamp2: { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  
  // Icon box
  iconBox: (size: number = 32, bg: string = "var(--primary-10)") => ({
    width: size,
    height: size,
    borderRadius: radius.md,
    bgcolor: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),
} as const;

// Breakpoints
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// Z-Index
export const zIndex = {
  dropdown: 100,
  sticky: 200,
  modal: 300,
  toast: 400,
} as const;

// Animation Durations
export const duration = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;
