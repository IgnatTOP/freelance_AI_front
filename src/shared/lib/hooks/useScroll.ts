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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Устанавливаем mounted только на клиенте, чтобы избежать проблем с гидратацией
    setMounted(true);
    
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setScrolled(window.scrollY > threshold);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener("scroll", handleScroll);
      // Проверяем начальное состояние
      handleScroll();
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [threshold]);

  // Возвращаем false до монтирования, чтобы избежать несоответствия гидратации
  return { scrolled: mounted ? scrolled : false };
}


