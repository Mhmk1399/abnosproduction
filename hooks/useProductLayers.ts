import useSWR from "swr";

export interface Customer {
  _id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  nationalId: string;
  postalCode: string;
  type: string;
}

export interface Step {
  _id: string;
  name: string;
  code: string;
  description: string;
}

export interface ProductionLine {
  _id: string;
  name: string;
  code: string;
  description: string;
  microLines: Array<{
    microLine: string;
    order: number;
    _id: string;
  }>;
  active: boolean;
  inventory: string;
}

export interface ProductLayer {
  _id: string;
  customer: Customer | string;
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
  currentStep: Step | string;
  currentline: ProductionLine | string;
  currentInventory?: any;
  productionNotes?: string;
  designNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
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
  
  const filteredLayers = layers.filter(layer => {
    // Check if currentline is an object with _id or just an id string
    const currentLineId = typeof layer.productionLine === 'object' 
      ? layer.productionLine._id 
      : layer.productionLine;
    
    return currentLineId === lineId;
  });
  
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
