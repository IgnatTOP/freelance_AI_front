/**
 * Общие валидации для форм
 * Синхронизировано с бекендом
 * @deprecated These rules were designed for Ant Design Form. Use custom validation with MUI forms instead.
 */

import { VALIDATION_CONSTANTS } from "./validation-constants";

// Custom Rule type to replace Ant Design's Rule type
export type Rule = {
  required?: boolean;
  message?: string;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'url';
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (rule: any, value: any) => Promise<void>;
} | ((form: { getFieldValue: (field: string) => any }) => {
  validator: (rule: any, value: any) => Promise<void>;
});

/**
 * Валидация email
 */
export const emailRules: Rule[] = [
  { required: true, message: 'Введите email' },
  { type: 'email', message: 'Введите корректный email' },
];

/**
 * Валидация пароля (синхронизировано с бекендом: минимум 8 символов, заглавные, строчные, цифры)
 */
export const passwordRules: Rule[] = [
  { required: true, message: 'Введите пароль' },
  { min: VALIDATION_CONSTANTS.MIN_PASSWORD_LENGTH, message: `Пароль должен быть не менее ${VALIDATION_CONSTANTS.MIN_PASSWORD_LENGTH} символов` },
  {
    validator: (_, value) => {
      if (!value) return Promise.resolve();
      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      
      if (!hasUpper) {
        return Promise.reject(new Error('Пароль должен содержать хотя бы одну заглавную букву'));
      }
      if (!hasLower) {
        return Promise.reject(new Error('Пароль должен содержать хотя бы одну строчную букву'));
      }
      if (!hasNumber) {
        return Promise.reject(new Error('Пароль должен содержать хотя бы одну цифру'));
      }
      return Promise.resolve();
    },
  },
];

/**
 * Валидация имени пользователя (синхронизировано с бекендом)
 */
export const usernameRules: Rule[] = [
  { required: true, message: 'Введите имя пользователя' },
  { min: VALIDATION_CONSTANTS.MIN_USERNAME_LENGTH, message: `Минимум ${VALIDATION_CONSTANTS.MIN_USERNAME_LENGTH} символа` },
  { max: VALIDATION_CONSTANTS.MAX_USERNAME_LENGTH, message: `Максимум ${VALIDATION_CONSTANTS.MAX_USERNAME_LENGTH} символов` },
  { pattern: /^[a-zA-Z0-9_]+$/, message: 'Только буквы, цифры и подчеркивание' },
  {
    validator: (_, value) => {
      if (!value) return Promise.resolve();
      if (/^[0-9]/.test(value)) {
        return Promise.reject(new Error('Имя пользователя не может начинаться с цифры'));
      }
      return Promise.resolve();
    },
  },
];

/**
 * Валидация отображаемого имени (синхронизировано с бекендом)
 */
export const displayNameRules: Rule[] = [
  { required: true, message: 'Введите имя' },
  { min: VALIDATION_CONSTANTS.MIN_DISPLAY_NAME_LENGTH, message: `Минимум ${VALIDATION_CONSTANTS.MIN_DISPLAY_NAME_LENGTH} символа` },
  { max: VALIDATION_CONSTANTS.MAX_DISPLAY_NAME_LENGTH, message: `Максимум ${VALIDATION_CONSTANTS.MAX_DISPLAY_NAME_LENGTH} символов` },
];

/**
 * Валидация имени пользователя (для обратной совместимости)
 */
export const nameRules: Rule[] = displayNameRules;

/**
 * Валидация подтверждения пароля
 */
export const confirmPasswordRules: Rule[] = [
  { required: true, message: 'Подтвердите пароль' },
  ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('Пароли не совпадают'));
    },
  }),
];

/**
 * Валидация заголовка заказа (синхронизировано с бекендом)
 */
export const orderTitleRules: Rule[] = [
  { required: true, message: 'Введите название заказа' },
  { min: VALIDATION_CONSTANTS.MIN_ORDER_TITLE_LENGTH, message: `Минимум ${VALIDATION_CONSTANTS.MIN_ORDER_TITLE_LENGTH} символа` },
  { max: VALIDATION_CONSTANTS.MAX_ORDER_TITLE_LENGTH, message: `Максимум ${VALIDATION_CONSTANTS.MAX_ORDER_TITLE_LENGTH} символов` },
];

/**
 * Валидация описания заказа (синхронизировано с бекендом)
 */
export const orderDescriptionRules: Rule[] = [
  { required: true, message: 'Введите описание заказа' },
  { min: VALIDATION_CONSTANTS.MIN_ORDER_DESCRIPTION_LENGTH, message: `Минимум ${VALIDATION_CONSTANTS.MIN_ORDER_DESCRIPTION_LENGTH} символов` },
  { max: VALIDATION_CONSTANTS.MAX_ORDER_DESCRIPTION_LENGTH, message: `Максимум ${VALIDATION_CONSTANTS.MAX_ORDER_DESCRIPTION_LENGTH} символов` },
];

/**
 * Валидация сопроводительного письма (синхронизировано с бекендом)
 */
export const proposalCoverLetterRules: Rule[] = [
  { required: true, message: 'Введите сопроводительное письмо' },
  { min: VALIDATION_CONSTANTS.MIN_PROPOSAL_COVER_LETTER_LENGTH, message: `Минимум ${VALIDATION_CONSTANTS.MIN_PROPOSAL_COVER_LETTER_LENGTH} символов` },
  { max: VALIDATION_CONSTANTS.MAX_PROPOSAL_COVER_LETTER_LENGTH, message: `Максимум ${VALIDATION_CONSTANTS.MAX_PROPOSAL_COVER_LETTER_LENGTH} символов` },
];

/**
 * Валидация биографии (синхронизировано с бекендом)
 */
export const bioRules: Rule[] = [
  { max: VALIDATION_CONSTANTS.MAX_BIO_LENGTH, message: `Максимум ${VALIDATION_CONSTANTS.MAX_BIO_LENGTH} символов` },
];

/**
 * Валидация местоположения (синхронизировано с бекендом)
 */
export const locationRules: Rule[] = [
  { max: VALIDATION_CONSTANTS.MAX_LOCATION_LENGTH, message: `Максимум ${VALIDATION_CONSTANTS.MAX_LOCATION_LENGTH} символов` },
];

/**
 * Валидация почасовой ставки (синхронизировано с бекендом)
 */
export const hourlyRateRules: Rule[] = [
  { type: 'number', min: VALIDATION_CONSTANTS.MIN_HOURLY_RATE, message: 'Ставка должна быть положительным числом' },
  { type: 'number', max: VALIDATION_CONSTANTS.MAX_HOURLY_RATE, message: `Ставка не может превышать ${VALIDATION_CONSTANTS.MAX_HOURLY_RATE.toLocaleString()}` },
];

/**
 * Валидация бюджета (синхронизировано с бекендом)
 */
export const budgetRules: Rule[] = [
  { type: 'number', min: VALIDATION_CONSTANTS.MIN_BUDGET, message: 'Бюджет должен быть положительным числом' },
  { type: 'number', max: VALIDATION_CONSTANTS.MAX_BUDGET, message: `Бюджет не может превышать ${VALIDATION_CONSTANTS.MAX_BUDGET.toLocaleString()}` },
];

/**
 * Валидация заголовка портфолио (синхронизировано с бекендом)
 */
export const portfolioTitleRules: Rule[] = [
  { required: true, message: 'Введите название работы' },
  { min: VALIDATION_CONSTANTS.MIN_PORTFOLIO_TITLE_LENGTH, message: `Минимум ${VALIDATION_CONSTANTS.MIN_PORTFOLIO_TITLE_LENGTH} символ` },
  { max: VALIDATION_CONSTANTS.MAX_PORTFOLIO_TITLE_LENGTH, message: `Максимум ${VALIDATION_CONSTANTS.MAX_PORTFOLIO_TITLE_LENGTH} символов` },
];

/**
 * Валидация описания портфолио (синхронизировано с бекендом)
 */
export const portfolioDescriptionRules: Rule[] = [
  { max: VALIDATION_CONSTANTS.MAX_PORTFOLIO_DESCRIPTION_LENGTH, message: `Максимум ${VALIDATION_CONSTANTS.MAX_PORTFOLIO_DESCRIPTION_LENGTH} символов` },
];

/**
 * Валидация внешней ссылки (синхронизировано с бекендом)
 */
export const externalLinkRules: Rule[] = [
  { max: VALIDATION_CONSTANTS.MAX_EXTERNAL_LINK_LENGTH, message: `Максимум ${VALIDATION_CONSTANTS.MAX_EXTERNAL_LINK_LENGTH} символов` },
  { type: 'url', message: 'Введите корректный URL (начинается с http:// или https://)' },
];

/**
 * Валидация сообщения (синхронизировано с бекендом)
 */
export const messageContentRules: Rule[] = [
  { required: true, message: 'Сообщение не может быть пустым' },
  { min: VALIDATION_CONSTANTS.MIN_MESSAGE_LENGTH, message: `Минимум ${VALIDATION_CONSTANTS.MIN_MESSAGE_LENGTH} символ` },
  { max: VALIDATION_CONSTANTS.MAX_MESSAGE_LENGTH, message: `Максимум ${VALIDATION_CONSTANTS.MAX_MESSAGE_LENGTH} символов` },
];

