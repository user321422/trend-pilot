import { useState, useEffect, useCallback } from 'react';
import { briefs as briefsApi } from '../services/api';
import type { Brief } from '../services/api';

interface UseBriefsResult {
  data: Brief[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  generate: (trendId: string) => Promise<Brief>;
  autoGenerate: () => Promise<{ count: number, briefs: Brief[] }>;
  approve: (id: string, status: 'APPROVED' | 'REJECTED', edits?: Partial<Brief>) => Promise<Brief>;
}

export function useBriefs(): UseBriefsResult {
  const [data, setData] = useState<Brief[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBriefs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await briefsApi.list();
      setData(res.briefs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load briefs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBriefs();
  }, [fetchBriefs]);

  const generate = async (trendId: string) => {
    const res = await briefsApi.generate(trendId);
    await fetchBriefs(); // Refresh the list
    return res.brief;
  };

  const autoGenerate = async () => {
    const res = await briefsApi.autoGenerate();
    if (res.count > 0) {
      await fetchBriefs();
    }
    return res;
  };

  const approve = async (id: string, status: 'APPROVED' | 'REJECTED', edits?: Partial<Brief>) => {
    const res = await briefsApi.approve(id, status, edits);
    await fetchBriefs(); // Refresh the list
    return res.brief;
  };

  return { data, isLoading, error, refetch: fetchBriefs, generate, autoGenerate, approve };
}
