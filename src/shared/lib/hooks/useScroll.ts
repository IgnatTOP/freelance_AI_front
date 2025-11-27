/**
 * Хук для отслеживания скролла страницы
 */

import { useState, useEffect } from "react";

interface UseScrollOptions {
  threshold?: number;
}

/**
 * Хук для отслеживания скролла страницы
 * 
 * @example
 * const { scrolled } = useScroll({ threshold: 50 });
 */
export function useScroll(options: UseScrollOptions = {}) {
  const { threshold = 50 } = options;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll);
    // Проверяем начальное состояние
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return { scrolled };
}


