/**
 * Утилиты для навигации
 */

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Обработчик клика по anchor ссылкам (#section)
 * Если ссылка начинается с #, выполняет плавную прокрутку к элементу
 * 
 * @param href - URL ссылки
 * @param pathname - Текущий путь страницы
 * @param router - Next.js router
 * @param basePath - Базовый путь для редиректа (по умолчанию "/")
 */
export function createAnchorClickHandler(
  href: string,
  pathname: string,
  router: AppRouterInstance,
  basePath: string = "/"
) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith("#")) return;

    e.preventDefault();
    const targetId = href;

    // Если мы не на главной странице, переходим на неё
    if (pathname !== basePath) {
      router.push(basePath);
      // Ждем перехода и прокручиваем
      setTimeout(() => {
        scrollToElement(targetId);
      }, 100);
    } else {
      // Прокручиваем сразу
      scrollToElement(targetId);
    }
  };
}

/**
 * Прокручивает страницу к элементу с указанным ID
 */
function scrollToElement(selector: string) {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

