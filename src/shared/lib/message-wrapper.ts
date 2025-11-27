/**
 * Обертка для message из Ant Design
 * Использует App.useApp() для правильного применения стилей темы
 */

import { App } from 'antd';

/**
 * Хелпер для использования message с правильными стилями
 * Используйте этот хук в компонентах вместо статического message
 * 
 * @example
 * const { message } = useMessage();
 * message.success('Успешно!');
 */
export function useMessage() {
  return App.useApp();
}

/**
 * Для использования вне компонентов React, используйте статический message
 * Но он будет использовать стили из ConfigProvider
 */
export { message } from 'antd';


