import { useState, useEffect } from 'react';

export interface Inventory {
  _id: string;
  name: string;
  code: string;
  quantity: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export function useInventories() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInventories() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/productionInventory');
        if (!response.ok) {
          throw new Error('Failed to fetch inventories');
        }
        const data = await response.json();
        setInventories(data);
      } catch (err) {
        console.error('Error fetching inventories:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchInventories();
  }, []);

  return { inventories, isLoading, error };
}
