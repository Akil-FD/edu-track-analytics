import { useState, useCallback } from "react";
import { ApiResponse } from "../types/api";
import { AxiosError } from "axios";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  message: string | null;
}

export function useApi<T, A extends unknown[]>(
  apiFunction: (...args: A) => Promise<ApiResponse<T>>
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    message: null
  });

  const request = useCallback(
    async (...args: A): Promise<T | null> => {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null
      }));

      try {
        const response = await apiFunction(...args);

        if (!response.success) {
          throw new Error(response.message || "Request failed");
        }

        const data = response.data ?? null;

        setState({
          data,
          loading: false,
          error: null,
          message: response.message ?? null
        });
        return response.data ?? (response as unknown as T);
      } catch (err) {
        const error = err as AxiosError<{ message: string }>;

        const errorMessage =
          error.response?.data?.message || "Something went wrong";

        setState({
          data: null,
          loading: false,
          error: errorMessage,
          message: null
        });

        return null;
      }
    },
    [apiFunction]
  );

  const reset = () => {
    setState({
      data: null,
      loading: false,
      error: null,
      message: null
    });
  };

  return { ...state, request, reset };
}