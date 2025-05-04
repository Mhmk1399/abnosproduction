import useSWR from "swr";

export interface ProductLayer {
  _id: string;
  customer: string;
  code: string;
  glass: string;
  treatments: string[];
  width: number;
  height: number;
  product: string;
  invoice: string;
  productionCode: string;
  productionLine: string;
  productionDate: string;
  currentStep: string;
  currentline: string;
  currentInventory: string;
  productionNotes: string;
  designNumber: string;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch product layers");
  }
  return response.json();
};

export function useProductLayers() {
  const { data, error, isLoading, mutate } = useSWR<{ productLayers: ProductLayer[] }>(
    "/api/productLayer",
    fetcher
  );
  
  return {
    layers: data?.productLayers || [],
    isLoading,
    error: error ? error.message : null,
    mutate
  };
}

export function useProductLayersByLine(lineId: string) {
  const { layers, isLoading, error, mutate } = useProductLayers();
  
  const filteredLayers = layers.filter(layer => layer.currentline === lineId);
  
  return {
    layers: filteredLayers,
    isLoading,
    error,
    mutate
  };
}

export function useProductLayer(id: string) {
  const { data, error, isLoading, mutate } = useSWR<{ productLayer: ProductLayer }>(
    id ? `/api/productLayer?id=${id}` : null,
    fetcher
  );
  
  return {
    layer: data?.productLayer,
    isLoading,
    error: error ? error.message : null,
    mutate
  };
}