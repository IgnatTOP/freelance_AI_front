import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Публичные роуты, которые не требуют аутентификации
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/blog",
  "/about",
];

// Роуты, которые требуют аутентификации
const protectedRoutes = ["/dashboard", "/profile", "/orders", "/messages"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Проверяем является ли роут защищенным
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Проверяем является ли роут публичным auth роутом
  const isAuthRoute = pathname.startsWith("/auth");

  // Пытаемся получить токен из cookies (если мы будем их использовать в будущем)
  const token = request.cookies.get("access_token")?.value;

  // Примечание: так как мы используем localStorage, middleware не может проверить токен
  // Реальная проверка происходит на клиенте в компонентах (например, в dashboard/page.tsx)
  // Поэтому мы не блокируем доступ к защищенным роутам здесь

  // Если пользователь залогинен (есть токен в cookies) и пытается попасть на страницу входа/регистрации,
  // перенаправляем на дашборд
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Настройка matcher - на каких путях запускать middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|images).*)",
  ],
};
