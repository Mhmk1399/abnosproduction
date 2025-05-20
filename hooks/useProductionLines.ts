import { useState } from 'react';
import useSWR from 'swr';
import { Step, ProductionLine, invoiceData, UseProductionLinesReturn } from '@/types/types';





const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProductionLines(): UseProductionLinesReturn {
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [inventories, setInventories] = useState<invoiceData[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [loadingInventories, setLoadingInventories] = useState(false);

  // Fetch production lines
  const { data, error: swrError, mutate: swrMutate } = useSWR<ProductionLine[]>(
    '/api/production-lines',
    fetcher,
    {
      dedupingInterval: 2000,
      revalidateOnFocus: false,
    }
  );

  // Fetch available steps
  const fetchSteps = async (): Promise<Step[]> => {
    try {
      setLoadingSteps(true);
      const response = await fetch('/api/steps');
      if (!response.ok) {
        throw new Error('Failed to fetch steps');
      }
      const data = await response.json();
      setSteps(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    } finally {
      setLoadingSteps(false);
    }
  };

  // Fetch available inventories
  const fetchInventories = async (): Promise<invoiceData[]> => {
    try {
      setLoadingInventories(true);
      const response = await fetch('/api/productionInventory');
      if (!response.ok) {
        throw new Error('Failed to fetch production inventories');
      }
      const data = await response.json();
      setInventories(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    } finally {
      setLoadingInventories(false);
    }
  };

  // Create a new production line
  const createProductionLine = async (productionLineData: Partial<ProductionLine>): Promise<boolean> => {
    try {
      // Ensure we have steps and inventory data before creating
      if (steps.length === 0) {
        await fetchSteps();
      }

      if (inventories.length === 0) {
        await fetchInventories();
      }

      const response = await fetch('/api/production-lines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productionLineData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create production line');
      }

      return swrMutate().then(() => true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };

  // Get a specific production line by ID
  const getProductionLine = async (id: string): Promise<ProductionLine | null> => {
    try {
      const response = await fetch(`/api/production-lines/detailed`, {
        method: 'GET',
        headers: {
          'id': id,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch production line');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  };

  // Update an existing production line
  const updateProductionLine = async (productionLineData: ProductionLine): Promise<boolean> => {
    try {
      const response = await fetch(`/api/production-lines/detailed`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'id': productionLineData._id,
        },
        body: JSON.stringify({
          name: productionLineData.name,
          description: productionLineData.description,
          steps: productionLineData.steps,
          inventory: productionLineData.inventory,
          active: productionLineData.active,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update production line');
      }

      return swrMutate().then(() => true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };

  // Delete a production line
  const deleteProductionLine = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/production-lines/detailed`, {
        method: 'DELETE',
        headers: {
          'id': id,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete production line');
      }

      return swrMutate().then(() => true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };

  // Simplified mutate function
  const mutate = async () => {
    const result = await swrMutate();
    return result || [];
  };

  return {
    productionLines: data || [],
    isLoading: !swrError && !data,
    error: swrError ? swrError.message : error,
    steps,
    inventories,
    loadingSteps,
    loadingInventories,
    mutate,
    createProductionLine,
    updateProductionLine,
    deleteProductionLine,
    getProductionLine,
    fetchSteps,
    fetchInventories,
  };
}
