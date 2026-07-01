"use client";

import { useCallback, useEffect, useState } from "react";

type ResourceState<T> =
  | { status: "loading"; data: null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: null; error: string };

export function useApiResource<T>(url: string) {
  const [state, setState] = useState<ResourceState<T>>({ status: "loading", data: null, error: null });

  const refetch = useCallback(async () => {
    setState({ status: "loading", data: null, error: null });
    try {
      const response = await fetch(url, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Request failed");
      }
      setState({ status: "success", data: payload as T, error: null });
    } catch (error) {
      setState({ status: "error", data: null, error: error instanceof Error ? error.message : "Request failed" });
    }
  }, [url]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { ...state, refetch };
}
