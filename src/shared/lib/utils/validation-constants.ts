/**
 * Константы валидации, синхронизированные с бекендом
 * Эти значения должны совпадать с константами в backend/internal/validation/input.go
 */

export const VALIDATION_CONSTANTS = {
  // Username
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  
  // Display Name
  MIN_DISPLAY_NAME_LENGTH: 2,
  MAX_DISPLAY_NAME_LENGTH: 100,
  
  // Order
  MIN_ORDER_TITLE_LENGTH: 3,
  MAX_ORDER_TITLE_LENGTH: 200,
  MIN_ORDER_DESCRIPTION_LENGTH: 10,
  MAX_ORDER_DESCRIPTION_LENGTH: 5000,
  
  // Proposal
  MIN_PROPOSAL_COVER_LETTER_LENGTH: 10,
  MAX_PROPOSAL_COVER_LETTER_LENGTH: 2000,
  
  // Portfolio
  MIN_PORTFOLIO_TITLE_LENGTH: 1,
  MAX_PORTFOLIO_TITLE_LENGTH: 200,
  MAX_PORTFOLIO_DESCRIPTION_LENGTH: 2000,
  
  // Profile
  MAX_BIO_LENGTH: 1000,
  MAX_LOCATION_LENGTH: 100,
  
  // Skills
  MAX_SKILL_LENGTH: 50,
  MAX_SKILLS_COUNT: 50,
  
  // Budget
  MIN_BUDGET: 0,
  MAX_BUDGET: 100000000, // 100 миллионов
  
  // Hourly Rate
  MIN_HOURLY_RATE: 0,
  MAX_HOURLY_RATE: 100000,
  
  // Message
  MIN_MESSAGE_LENGTH: 1,
  MAX_MESSAGE_LENGTH: 5000,
  
  // External Link
  MAX_EXTERNAL_LINK_LENGTH: 500,
  
  // Password
  MIN_PASSWORD_LENGTH: 8,
} as const;


