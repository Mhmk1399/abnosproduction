"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Layer, ProcessStep } from "../types/production";

interface LayerContextType {
  // Data
  layers: Layer[];
  isLoading: boolean;
  error: string | null;

  // Layer operations
  getLayerById: (id: string) => Layer | undefined;
  getLayersByLine: (lineId: string) => Layer[];
  getLayersByStep: (stepId: string) => Layer[];
  getLayersByInventory: (inventoryId: string) => Layer[];

  // Layer status operations
  startProcessing: (
    layerId: string,
    workerId: string,
    stepId: string
  ) => Promise<boolean>;
  completeProcessing: (
    layerId: string,
    isDefective: boolean,
    notes?: string
  ) => Promise<boolean>;
  moveToInventory: (layerId: string, inventoryId: string) => Promise<boolean>;

  // Refresh data
  refreshLayers: () => Promise<void>;
}

const LayerContext = createContext<LayerContextType | undefined>(undefined);

export function LayerProvider({ children }: { children: ReactNode }) {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch layers data from API/JSON file
  const fetchLayers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/assets/data/layers.json");
      if (!response.ok) throw new Error("Failed to fetch layers data");

      const data = await response.json();
      console.log(data);

      // Convert string dates to Date objects
      const formattedLayers = data.map((layer: any) => ({
        ...layer,
        createdAt: new Date(layer.createdAt),
        updatedAt: new Date(layer.updatedAt),
        // Check if processHistory exists before mapping
        processHistory: layer.processHistory
          ? layer.processHistory.map((step: any) => ({
              ...step,
              startTime: new Date(step.startTime),
              endTime: step.endTime ? new Date(step.endTime) : undefined,
            }))
          : [], // Provide a default empty array if processHistory doesn't exist
      }));

      setLayers(formattedLayers);
    } catch (error) {
      console.error("Error fetching layers:", error);
      setError("Failed to fetch layers data");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchLayers();
  }, []);

  // Layer query functions
  const getLayerById = (id: string) => layers.find((layer) => layer.id === id);

  const getLayersByLine = (lineId: string) =>
    layers.filter((layer) => layer.currentLineId === lineId);

  const getLayersByStep = (stepId: string) =>
    layers.filter((layer) => layer.currentStepId === stepId);

  const getLayersByInventory = (inventoryId: string) =>
    layers.filter((layer) => layer.inventoryId === inventoryId);

  // Layer status operations
  const startProcessing = async (
    layerId: string,
    workerId: string,
    stepId: string
  ) => {
    try {
      const layer = getLayerById(layerId);
      if (!layer) throw new Error(`Layer ${layerId} not found`);

      // In a real app, this would be an API call
      // For now, we'll update our local state
      const updatedLayer: Layer = {
        ...layer,
        status: "in-progress",
        currentStepId: stepId,
        updatedAt: new Date(),
        processHistory: [
          ...layer.processHistory,
          {
            stepId,
            stepName: "Processing", // This would come from your step data
            workerId,
            startTime: new Date(),
            status: "in-progress",
          },
        ],
      };

      // Update layers array
      setLayers((prev) =>
        prev.map((l) => (l.id === layerId ? updatedLayer : l))
      );

      return true;
    } catch (err) {
      console.error("Error starting processing:", err);
      return false;
    }
  };

  const completeProcessing = async (
    layerId: string,
    isDefective: boolean,
    notes?: string
  ) => {
    try {
      const layer = getLayerById(layerId);
      if (!layer) throw new Error(`Layer ${layerId} not found`);

      // Find the current in-progress process step
      const currentProcessIndex = layer.processHistory.findIndex(
        (p) => p.status === "in-progress"
      );

      if (currentProcessIndex === -1) {
        throw new Error("No in-progress step found for this layer");
      }

      const newStatus = isDefective
        ? ("defective" as const)
        : ("completed" as const);

      // Create updated process history
      const updatedHistory = [...layer.processHistory];
      updatedHistory[currentProcessIndex] = {
        ...updatedHistory[currentProcessIndex],
        endTime: new Date(),
        status: newStatus,
        notes,
      };

      // Update the layer
      const updatedLayer: Layer = {
        ...layer,
        status: newStatus,
        updatedAt: new Date(),
        processHistory: updatedHistory,
      };

      // Update layers array
      setLayers((prev) =>
        prev.map((l) => (l.id === layerId ? updatedLayer : l))
      );

      return true;
    } catch (err) {
      console.error("Error completing processing:", err);
      return false;
    }
  };

  const moveToInventory = async (layerId: string, inventoryId: string) => {
    try {
      const layer = getLayerById(layerId);
      if (!layer) throw new Error(`Layer ${layerId} not found`);

      // Update the layer
      const updatedLayer: Layer = {
        ...layer,
        inventoryId,
        updatedAt: new Date(),
      };

      // Update layers array
      setLayers((prev) =>
        prev.map((l) => (l.id === layerId ? updatedLayer : l))
      );

      return true;
    } catch (err) {
      console.error("Error moving to inventory:", err);
      return false;
    }
  };

  // Refresh data function
  const refreshLayers = async () => {
    await fetchLayers();
  };

  const value = {
    layers,
    isLoading,
    error,
    getLayerById,
    getLayersByLine,
    getLayersByStep,
    getLayersByInventory,
    startProcessing,
    completeProcessing,
    moveToInventory,
    refreshLayers,
  };

  return (
    <LayerContext.Provider value={value}>{children}</LayerContext.Provider>
  );
}

// Hook for using the layer context
export function useLayers() {
  const context = useContext(LayerContext);
  if (context === undefined) {
    throw new Error("useLayers must be used within a LayerProvider");
  }
  return context;
}
