import { layerData, UseProductLayersReturn } from "@/types/types";
import { useState, useEffect } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProductLayers(): UseProductLayersReturn {
  const [error, setError] = useState<string | null>(null);

  // Fetch product layers
  const { data, error: swrError, mutate: swrMutate } = useSWR<layerData[]>(
    '/api/productLayer',
    fetcher,
    {
      dedupingInterval: 2000,
      revalidateOnFocus: false,
    }
  );

  // Create a new product layer
  const createProductLayer = async (productLayerData: Partial<layerData>): Promise<boolean> => {
    try {
      const response = await fetch('/api/productLayer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productLayerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product layer');
      }

      return swrMutate().then(() => true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };

  // Get a specific product layer by ID
  const getProductLayer = async (id: string): Promise<layerData | null> => {
    try {
      const response = await fetch(`/api/productLayer/detailed`, {
        method: 'GET',
        headers: {
          'id': id,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch product layer');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  };

  // Update an existing product layer
  const updateProductLayer = async (productLayerData: Partial<layerData>): Promise<boolean> => {
    try {
      if (!productLayerData._id) {
        throw new Error('Product layer ID is required for update');
      }

      const response = await fetch(`/api/productLayer/detailed`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'id': productLayerData._id,
        },
        body: JSON.stringify(productLayerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product layer');
      }

      return swrMutate().then(() => true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };

  // Delete a product layer
  const deleteProductLayer = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/productLayer/detailed`, {
        method: 'DELETE',
        headers: {
          'id': id,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product layer');
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
    layers: data || [],
    isLoading: !swrError && !data,
    error: swrError ? swrError.message : error,
    mutate,
    createProductLayer,
    updateProductLayer,
    deleteProductLayer,
    getProductLayer,
  };
}

export function useProductLayersByLine(lineId: string) {
  const { layers, isLoading, error, mutate, createProductLayer, updateProductLayer, deleteProductLayer, getProductLayer } = useProductLayers();

  const filteredLayers = layers.filter(layer => {
    // Check if productionLine is an object with _id or just an id string
    const currentLineId = typeof layer.productionLine === 'object'
      ? layer.productionLine._id
      : layer.productionLine;

    return currentLineId === lineId;
  });

  return {
    layers: filteredLayers,
    isLoading,
    error,
    mutate,
    createProductLayer,
    updateProductLayer,
    deleteProductLayer,
    getProductLayer
  };
}

export function useProductLayer(id: string) {
  const [layer, setLayer] = useState<layerData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { mutate: globalMutate } = useProductLayers();

  const fetchLayer = async () => {
    if (!id) {
      setIsLoading(false);
      return null;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/productLayer/detailed`, {
        method: 'GET',
        headers: {
          'id': id,
        },
      });


      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        throw new Error(errorData.error || 'Failed to fetch product layer');
      }

      const data = await response.json();
      setLayer(data);
      return data;
    } catch (err) {
      console.error("Error in fetchLayer:", err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };


  // Initial fetch - using useEffect properly
  useEffect(() => {
    if (id) {
      fetchLayer();
    }
  }, [id]);

  // Update the layer
  const updateLayer = async (updatedData: Partial<layerData>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/productLayer/detailed`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'id': id,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product layer');
      }

      // Refresh the data
      await fetchLayer();
      // Also update the global cache
      await globalMutate();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };

  // Delete the layer
  const deleteLayer = async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/productLayer/detailed`, {
        method: 'DELETE',
        headers: {
          'id': id,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product layer');
      }

      setLayer(null);
      // Update the global cache
      await globalMutate();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };
  

  return {
    layer,
    isLoading,
    error,
    mutate: fetchLayer,
    updateLayer,
    deleteLayer
  };
}

