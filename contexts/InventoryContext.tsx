"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Inventory } from "../types/production";
import { Layer } from "../types/production";
interface InventoryContextType {
  // Data
  inventories: Inventory[];
  inventoryLayers: Record<string, Layer[]>; // inventoryId -> layers
  isLoading: boolean;
  error: string | null;

  // Operations
  addLayerToInventory: (
    layerId: string,
    inventoryId: string
  ) => Promise<boolean>;
  removeLayerFromInventory: (
    layerId: string,
    inventoryId: string
  ) => Promise<boolean>;
  transferLayer: (
    layerId: string,
    fromInventoryId: string,
    toInventoryId: string
  ) => Promise<boolean>;

  // Queries
  getInventoryById: (id: string) => Inventory | undefined;
  getLayersByInventory: (inventoryId: string) => Layer[];

  // Refresh data
  refreshInventories: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [inventoryLayers, setInventoryLayers] = useState<
    Record<string, Layer[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch inventory data
  const fetchInventories = async () => {
    setIsLoading(true);
    try {
      // Fetch inventories
      const inventoriesResponse = await fetch("/assets/data/inventories.json");
      if (!inventoriesResponse.ok)
        throw new Error("Failed to fetch inventories");
      const inventoriesData = await inventoriesResponse.json();

      // Fetch layers
      const layersResponse = await fetch("/assets/data/layers.json");
      if (!layersResponse.ok) throw new Error("Failed to fetch layers");
      const layersData = await layersResponse.json();

      // Format layers
      // Around line 48-57 in your InventoryContext.tsx file
      const formattedLayers = layersData
        .map((layer: any) => {
          // First check if the layer exists and has all required properties
          if (!layer) return null;

          return {
            ...layer,
            createdAt: new Date(layer.createdAt),
            updatedAt: new Date(layer.updatedAt),
            // Check if processHistory exists before mapping
            processHistory: layer.processHistory
              ? layer.processHistory
                  .map((step: any) => {
                    if (!step) return null;
                    return {
                      ...step,
                      startTime: new Date(step.startTime),
                      endTime: step.endTime
                        ? new Date(step.endTime)
                        : undefined,
                    };
                  })
                  .filter(Boolean) // Remove any null entries
              : [], // Default to empty array if processHistory doesn't exist
          };
        })
        .filter(Boolean); // Remove any null entries from the main map

      // Group layers by inventory
      const layersByInventory: Record<string, Layer[]> = {};
      formattedLayers.forEach((layer: Layer) => {
        if (layer.inventoryId) {
          if (!layersByInventory[layer.inventoryId]) {
            layersByInventory[layer.inventoryId] = [];
          }
          layersByInventory[layer.inventoryId].push(layer);
        }
      });

      setInventories(inventoriesData);
      setInventoryLayers(layersByInventory);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error fetching inventories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchInventories();
  }, []);

  // Inventory operations
  const addLayerToInventory = async (layerId: string, inventoryId: string) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll update our local state

      // Fetch the layer data (in a real app, this would come from the API)
      const layersResponse = await fetch("/assets/data/layers.json");
      const layersData = await layersResponse.json();
      const layer = layersData.find((l: any) => l.id === layerId);

      if (!layer) {
        throw new Error(`Layer ${layerId} not found`);
      }

      // Format the layer
      const formattedLayer = {
        ...layer,
        inventoryId,
        createdAt: new Date(layer.createdAt),
        updatedAt: new Date(),
        processHistory: layer.processHistory.map((step: any) => ({
          ...step,
          startTime: new Date(step.startTime),
          endTime: step.endTime ? new Date(step.endTime) : undefined,
        })),
      };

      // Update inventory layers
      setInventoryLayers((prev) => {
        const updated = { ...prev };
        if (!updated[inventoryId]) {
          updated[inventoryId] = [];
        }
        updated[inventoryId] = [...updated[inventoryId], formattedLayer];
        return updated;
      });

      return true;
    } catch (err) {
      console.error("Error adding layer to inventory:", err);
      return false;
    }
  };

  const removeLayerFromInventory = async (
    layerId: string,
    inventoryId: string
  ) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll update our local state
      setInventoryLayers((prev) => {
        const updated = { ...prev };
        if (updated[inventoryId]) {
          updated[inventoryId] = updated[inventoryId].filter(
            (layer) => layer.id !== layerId
          );
        }
        return updated;
      });

      return true;
    } catch (err) {
      console.error("Error removing layer from inventory:", err);
      return false;
    }
  };

  const transferLayer = async (
    layerId: string,
    fromInventoryId: string,
    toInventoryId: string
  ) => {
    try {
      // Find the layer in the source inventory
      const layer = inventoryLayers[fromInventoryId]?.find(
        (l) => l.id === layerId
      );
      if (!layer) {
        throw new Error(
          `Layer ${layerId} not found in inventory ${fromInventoryId}`
        );
      }

      // Update the layer with new inventory ID
      const updatedLayer = {
        ...layer,
        inventoryId: toInventoryId,
        updatedAt: new Date(),
      };

      // Update inventory layers
      setInventoryLayers((prev) => {
        const updated = { ...prev };
        // Remove from source inventory
        if (updated[fromInventoryId]) {
          updated[fromInventoryId] = updated[fromInventoryId].filter(
            (l) => l.id !== layerId
          );
        }
        // Add to destination inventory
        if (!updated[toInventoryId]) {
          updated[toInventoryId] = [];
        }
        updated[toInventoryId] = [...updated[toInventoryId], updatedLayer];
        return updated;
      });

      return true;
    } catch (err) {
      console.error("Error transferring layer:", err);
      return false;
    }
  };

  // Inventory queries
  const getInventoryById = (id: string) =>
    inventories.find((inv) => inv.id === id);

  const getLayersByInventory = (inventoryId: string) =>
    inventoryLayers[inventoryId] || [];

  // Refresh data function
  const refreshInventories = async () => {
    await fetchInventories();
  };

  const value = {
    inventories,
    inventoryLayers,
    isLoading,
    error,
    addLayerToInventory,
    removeLayerFromInventory,
    transferLayer,
    getInventoryById,
    getLayersByInventory,
    refreshInventories,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

// Hook for using the inventory context
export function useInventories() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventories must be used within an InventoryProvider");
  }
  return context;
}
