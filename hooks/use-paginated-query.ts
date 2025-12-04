"use client";

import { useState, useEffect } from "react";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UsePaginatedQueryOptions<T> {
  queryFn: (page: number, pageSize: number) => Promise<PaginatedResult<T>>;
  pageSize?: number;
  initialPage?: number;
}

/**
 * Hook for paginated data fetching
 * Manages pagination state and loading
 */
export function usePaginatedQuery<T>({
  queryFn,
  pageSize = 10,
  initialPage = 1,
}: UsePaginatedQueryOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await queryFn(page, pageSize);

        if (!cancelled) {
          setData(result.data);
          setTotal(result.total);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setData([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, queryFn]);

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const nextPage = () => goToPage(page + 1);
  const prevPage = () => goToPage(page - 1);
  const firstPage = () => goToPage(1);
  const lastPage = () => goToPage(totalPages);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
  };
}
