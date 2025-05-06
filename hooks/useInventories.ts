import useSWR from "swr";

export interface Inventory {
  type: string;
  _id: string;
  name: string;
  code: string;
  quantity: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch inventories");
  }
  return response.json();
};

export function useInventories() {
  const { data, error, isLoading } = useSWR<Inventory[]>(
    "/api/productionInventory",
    fetcher
  );
  return {
    inventories: data || [],
    isLoading,
    error: error ? error.message : null,
  };
}
