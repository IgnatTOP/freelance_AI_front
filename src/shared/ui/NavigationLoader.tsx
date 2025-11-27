"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export function NavigationLoader() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const prevPathnameRef = useRef(pathname);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isNavigatingRef = useRef(false);

  // Отслеживаем клики по ссылкам для раннего показа loader
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      
      if (link && !isNavigatingRef.current) {
        const href = link.getAttribute("href");
        // Показываем loader только для внутренних ссылок
        if (
          href && 
          !href.startsWith("#") && 
          !href.startsWith("http") && 
          !href.startsWith("mailto:") &&
          !href.startsWith("tel:")
        ) {
          isNavigatingRef.current = true;
          setIsNavigating(true);
          setProgress(0);
          document.body.style.overflow = "hidden";
          
          // Очищаем предыдущие таймеры
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          
          // Симулируем прогресс загрузки
          intervalRef.current = setInterval(() => {
            setProgress((prev) => {
              if (prev >= 85) {
                return 85; // Останавливаемся на 85%
              }
              return prev + 8;
            });
          }, 80);
        }
      }
    };

    document.addEventListener("click", handleLinkClick, true);

    return () => {
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, []);

  // Отслеживаем изменения pathname для завершения загрузки
  useEffect(() => {
    // Если путь изменился
    if (pathname !== prevPathnameRef.current) {
      // Если мы уже навигируем (был клик)
      if (isNavigatingRef.current) {
        // Очищаем интервал прогресса
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Завершаем прогресс до 100%
        setProgress(100);
        
        // Скрываем loader после небольшой задержки
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          setIsNavigating(false);
          isNavigatingRef.current = false;
          document.body.style.overflow = "";
          setProgress(0);
          prevPathnameRef.current = pathname;
        }, 300);
      } else {
        // Путь изменился без предварительного клика (программная навигация)
        // Показываем короткий loader
        setIsNavigating(true);
        setProgress(50);
        document.body.style.overflow = "hidden";
        
        // Быстро завершаем
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        setProgress(100);
        timeoutRef.current = setTimeout(() => {
          setIsNavigating(false);
          document.body.style.overflow = "";
          setProgress(0);
          prevPathnameRef.current = pathname;
        }, 400);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname]);

  // Инициализация
  useEffect(() => {
    prevPathnameRef.current = pathname;
  }, []);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      document.body.style.overflow = "";
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        transition: "opacity 0.3s ease-in-out",
      }}
      className="bg-background/80"
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        className="flex flex-col items-center space-y-6"
      >
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
          <span className="text-4xl font-bold gradient-text">M</span>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-background-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-gradient transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading text */}
        <p className="text-foreground-secondary text-sm animate-pulse">
          Загрузка...
        </p>
      </div>
    </div>
  );
}