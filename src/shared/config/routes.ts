/**
 * Константы маршрутов приложения
 */

/**
 * Роуты, которые относятся к дашборду (используют DashboardHeader)
 */
export const DASHBOARD_ROUTES = [
  "/dashboard",
  "/orders",
  "/messages",
  "/profile",
  "/proposals",
  "/settings",
  "/analytics",
  "/my-projects",
  "/freelancers",
  "/users",
  "/portfolio",
] as const;

/**
 * Проверяет, является ли путь частью дашборда
 */
export function isDashboardRoute(pathname: string): boolean {
  return DASHBOARD_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Проверяет, является ли путь страницей авторизации
 */
export function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith("/auth");
}


