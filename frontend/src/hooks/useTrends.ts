import { useState, useEffect, useCallback } from 'react';
import { trends as trendsApi } from '../services/api';
import type { Trend, TrendsResponse } from '../services/api';

interface UseTrendsResult {
  data: Trend[];
  count: number;
  isLoading: boolean;
  error: string | null;
  syncInterval: number;
  refresh: () => Promise<void>;
  refetch: () => void;
  updateSyncInterval: (minutes: number) => Promise<void>;
}

export function useTrends(sort?: string, source?: string): UseTrendsResult {
  const [data, setData]       = useState<Trend[]>([]);
  const [count, setCount]     = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [syncInterval, setSyncInterval] = useState(60);

  const fetchTrends = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res: TrendsResponse = await trendsApi.list(sort, source);
      setData(res.trends);
      setCount(res.count);
      const config = await trendsApi.getConfig();
      setSyncInterval(config.intervalMinutes);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load trends');
    } finally {
      setIsLoading(false);
    }
  }, [sort, source]);

  useEffect(() => { fetchTrends(); }, [fetchTrends]);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await trendsApi.refresh();
      await fetchTrends();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to refresh trends');
      setIsLoading(false);
    }
  };

  const updateSyncInterval = async (minutes: number) => {
    try {
      await trendsApi.updateConfig(minutes);
      setSyncInterval(minutes);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update sync interval');
    }
  };

  return { data, count, isLoading, error, syncInterval, refresh, refetch: fetchTrends, updateSyncInterval };
}
