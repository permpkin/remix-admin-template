import { useCallback, useState } from 'react';
import {
  QueryFunction,
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';

type UseQueryParams = Parameters<typeof useQuery>;

export default function useLazyQuery<TData, TError>(
  key: UseQueryParams[0],
  fetchFn: QueryFunction<TData, QueryKey>,
  options?: Omit<UseQueryOptions<TData, TError, unknown, QueryKey>, 'queryKey' | 'queryFn'>
): [() => void, UseQueryResult<unknown, unknown>] {
  const [enabled, setEnabled] = useState(false);

  const query = useQuery<TData, TError, unknown, QueryKey>(key, fetchFn, {
    ...(options || {}),
    enabled,
  });

  const trigger = useCallback(() => {
    if (!enabled) {
      setEnabled(true);
    }
  }, [fetchFn, enabled]);

  return [trigger, query];
}