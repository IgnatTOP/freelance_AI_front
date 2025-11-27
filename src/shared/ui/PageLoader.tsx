"use client";

import { useEffect, useState } from "react";

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Блокируем прокрутку страницы во время загрузки
    document.body.style.overflow = "hidden";

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoading(false);
            // Разблокируем прокрутку после загрузки
            document.body.style.overflow = "";
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return () => {
      clearInterval(interval);
      // Разблокируем прокрутку при размонтировании
      document.body.style.overflow = "";
    };
  }, []);

  if (!isLoading) return null;

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
      }}
      className="bg-background"
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
