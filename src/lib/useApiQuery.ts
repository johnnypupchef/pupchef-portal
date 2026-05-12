import { useCallback, useEffect, useState } from "react";
import { api, peekCache, setCache } from "./api";

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string;
  refetch: () => void;
}

/**
 * Stale-while-revalidate fetch hook.
 * - First visit: shows loading, fetches, caches result.
 * - Re-visits: paints cached data instantly (no loading), refreshes in background.
 *
 * `enabled = false` skips the fetch entirely (use when you need to gate on auth/etc).
 */
export function useApiQuery<T>(path: string, enabled: boolean = true): QueryState<T> {
  const cached = peekCache<T>(path);
  const [data, setData] = useState<T | null>(cached);
  const [loading, setLoading] = useState<boolean>(enabled && cached === null);
  const [error, setError] = useState<string>("");

  const refetch = useCallback(() => {
    if (!enabled) return;
    api
      .get<T>(path)
      .then((d) => {
        setCache(path, d);
        setData(d);
        setError("");
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [path, enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
