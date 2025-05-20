import { useState } from 'react';
import useSWR from 'swr';
import { InventoryData } from '../types/types';




interface UseProductionInventoryReturn {
  inventories: InventoryData[];
  isLoading: boolean;
  error: string | null;
  mutate: () => Promise<InventoryData[]>;
  createInventory: (data: InventoryData) => Promise<boolean>;
  updateInventory: (data: InventoryData) => Promise<boolean>;
  deleteInventory: (id: string) => Promise<boolean>;
  getInventory: (id: string) => Promise<InventoryData | null>;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProductionInventory(): UseProductionInventoryReturn {
  const [error, setError] = useState<string | null>(null);

  const { data, error: swrError, mutate: swrMutate } = useSWR<InventoryData[]>(
    '/api/productionInventory',
    fetcher,
    {
      dedupingInterval: 2000, // Deduplicate requests within 2 seconds
      revalidateOnFocus: false, // Don't revalidate when window gets focus
      revalidateIfStale: true,
      revalidateOnReconnect: true
    }
  );

  // Create a new inventory
  const createInventory = async (inventoryData: InventoryData): Promise<boolean> => {
    try {
      const response = await fetch('/api/productionInventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inventoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create inventory');
      }

      return swrMutate().then(() => true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };

  // Get a specific inventory by ID
  const getInventory = async (id: string): Promise<InventoryData | null> => {
    try {
      const response = await fetch(`/api/productionInventory/detailed`, {
        method: 'GET',
        headers: {
          'id': id,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch inventory');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  };

  // Update an existing inventory
  const updateInventory = async (inventoryData: InventoryData): Promise<boolean> => {
    try {
      const response = await fetch(`/api/productionInventory/detailed`, {
        method: 'PATCH',
        headers: new Headers({
          'Content-Type': 'application/json',
          'id': inventoryData._id || '',
        }),
        body: JSON.stringify({
          name: inventoryData.name,
          Capacity: inventoryData.Capacity,
          location: inventoryData.location,
          description: inventoryData.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update inventory');
      }

      return swrMutate().then(() => true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };
  // Delete an inventory
  const deleteInventory = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/productionInventory/detailed`, {
        method: 'DELETE',
        headers: {
          'id': id,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete inventory');
      }

      return swrMutate().then(() => true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };

  const mutate = async () => {
    const result = await swrMutate();
    return result || [];
  };

  return {
    inventories: data || [],
    isLoading: !error && !data,
    error: swrError ? swrError.message : error,
    mutate,
    createInventory,
    updateInventory,
    deleteInventory,
    getInventory,
  };
}