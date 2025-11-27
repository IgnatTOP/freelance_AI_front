"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

// Роуты, где НЕ нужен плавный скролл (страницы дашборда)
const noSmoothScrollRoutes = [
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
  "/auth",
];

export function LenisScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const [shouldEnable, setShouldEnable] = useState(true);

  useEffect(() => {
    // Проверяем, нужен ли плавный скролл на этой странице
    const isDashboardRoute = noSmoothScrollRoutes.some((route) =>
      pathname.startsWith(route)
    );

    setShouldEnable(!isDashboardRoute);

    // Если это страница дашборда, уничтожаем Lenis если он был создан
    if (isDashboardRoute) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      // Убираем класс lenis с html и body
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      document.body.classList.add("no-lenis-scroll");
      return;
    } else {
      // Убираем класс no-lenis-scroll для лендинга
      document.body.classList.remove("no-lenis-scroll");
    }

    // Если это лендинг, инициализируем Lenis
    if (!isDashboardRoute && !lenisRef.current) {
      // Initialize Lenis
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      });

      lenisRef.current = lenis;

      // Update Lenis on scroll
      function raf(time: number) {
        if (lenisRef.current) {
          lenisRef.current.raf(time);
          requestAnimationFrame(raf);
        }
      }

      requestAnimationFrame(raf);

      // Handle anchor links
      const handleAnchorClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement;

        if (anchor && lenisRef.current) {
          const href = anchor.getAttribute("href");
          if (href && href.startsWith("#")) {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element instanceof HTMLElement) {
              lenisRef.current.scrollTo(element, {
                offset: -100,
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              });
            }
          }
        }
      };

      document.addEventListener("click", handleAnchorClick);

      // Cleanup function
      return () => {
        document.removeEventListener("click", handleAnchorClick);
        if (lenisRef.current) {
          lenisRef.current.destroy();
          lenisRef.current = null;
        }
      };
    }
  }, [pathname]);

  return null;
}
