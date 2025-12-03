/**
 * Shared hooks
 */

export { useAuth } from "./useAuth";
export { useAsyncOperation } from "./useAsyncOperation";
export { useRequireAuth } from "./useRequireAuth";
export { useScroll } from "./useScroll";
export { useMobileMenu } from "./useMobileMenu";
export { calculateDockScale } from "./useDockScale";
export { useActivities } from "./useActivities";

// Re-export Activity type from shared utility
export type { Activity } from "../utils/activity-parser";
