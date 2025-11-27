/**
 * Хук для унификации загрузки данных с обработкой ошибок
 */

import { useState, useEffect, useCallback } from "react";
import { toastService } from "../toast";

interface UseDataFetchingOptions<T> {
  fetchFn: () => Promise<T>;
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  errorMessage?: string;
}

/**
 * Хук для загрузки данных с автоматической обработкой loading и ошибок
 * 
 * @example
 * const { data, loading, error, refetch } = useDataFetching({
 *   fetchFn: () => getOrders(),
 *   errorMessage: "Не удалось загрузить заказы"
 * });
 */
export function useDataFetching<T>(options: UseDataFetchingOptions<T>) {
  const {
    fetchFn,
    immediate = true,
    onSuccess,
    onError,
    errorMessage = "Ошибка загрузки данных",
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<unknown>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      onError?.(err);
      toastService.error(errorMessage);
      console.error("Data fetching error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchFn, onSuccess, onError, errorMessage]);

  useEffect(() => {
    if (immediate) {
      fetch();
    }
  }, [immediate, fetch]);

  return {
    data,
    loading,
    error,
    refetch: fetch,
  };
}

