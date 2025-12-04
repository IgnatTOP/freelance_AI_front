/**
 * Deprecated: This file is kept for backward compatibility
 * Use toastService from '@/src/shared/lib/toast' instead
 */

import { toastService } from './toast';

/**
 * @deprecated Use toastService instead
 */
export function useMessage() {
  return {
    message: {
      success: toastService.success,
      error: toastService.error,
      warning: toastService.warning,
      info: toastService.info,
    },
  };
}

/**
 * @deprecated Use toastService instead
 */
export const message = {
  success: toastService.success,
  error: toastService.error,
  warning: toastService.warning,
  info: toastService.info,
};


