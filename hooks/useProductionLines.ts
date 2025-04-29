import useSWR, { mutate as globalMutate } from 'swr';
import { ProductionLine } from '@/components/types/production';

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`);
  }
  return response.json();
};

export function useProductionLines() {
  const { data, error, isValidating } = useSWR<ProductionLine[]>(
    '/api/production-lines',
    fetcher
  );

  return {
    lines: data || [],
    isLoading: isValidating,
    error: error ? error.message : null
  };
}

// Hook for fetching a single production line by ID
export function useProductionLine(id: string) {
  const { data, error, isValidating, mutate } = useSWR<ProductionLine>(
    id ? `/api/production-lines/${id}` : null,
    fetcher
  );

  const deleteLine = async () => {
    try {
      const response = await fetch(`/api/production-lines/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          "id": id
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete production line');
      }
      
      // Invalidate the cache for this production line and the list
      mutate(undefined, false); // Update the current resource cache
      globalMutate('/api/production-lines'); // Revalidate the list
      
      return true;
    } catch (err) {
      console.error(`Error deleting production line ${id}:`, err);
      return false;
    }
  };

  return {
    line: data || null,
    isLoading: isValidating,
    error: error ? error.message : null,
    deleteLine
  };
}
