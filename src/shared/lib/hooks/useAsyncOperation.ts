/**
 * Хук для унификации обработки async операций с loading состоянием
 */

import { useState, useCallback } from "react";

interface UseAsyncOperationOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: unknown) => void;
}

/**
 * Хук для выполнения async операций с автоматическим управлением loading состоянием
 * 
 * @example
 * const { execute, loading } = useAsyncOperation(async (data) => {
 *   return await api.post('/endpoint', data);
 * });
 * 
 * await execute(formData);
 */
export function useAsyncOperation<T = any, P = any>(
  operation: (params: P) => Promise<T>,
  options: UseAsyncOperationOptions<T> = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const execute = useCallback(
    async (params: P): Promise<T | null> => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await operation(params);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        setError(err);
        options.onError?.(err);
        console.error("Async operation error:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [operation, options]
  );

  return {
    execute,
    loading,
    error,
  };
}

