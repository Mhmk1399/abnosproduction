import { useState, useEffect, useRef } from "react";
import useSWR, { mutate } from "swr";
import { useLayerTracking } from "./useLayerTracking";
import { Layer, ProcessStep } from "../components/types/production";

interface UseLayerProcessingProps {
  stepId?: string; // Make stepId optional
  workerId: string;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`);
  }
  return response.json();
};

export function useLayerProcessing({ stepId, workerId }: UseLayerProcessingProps) {
  const [layerId, setLayerId] = useState("");
  const [currentLayer, setCurrentLayer] = useState<Layer | null>(null);
  const [isProcessComplete, setIsProcessComplete] = useState(false);
  const [isDefective, setIsDefective] = useState(false);
  const [notes, setNotes] = useState("");
  const [recentLayers, setRecentLayers] = useState<Layer[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Only track layers if stepId is provided
  const { layers: stepsLayers, isLoading: isLayersLoading, error: layersError } = 
    useLayerTracking(stepId);

  // Use SWR to fetch layer data when layerId changes
// Use SWR to fetch layer data when layerId changes
const { data: layerData, error: layerError } = useSWR(
  layerId ? `/api/productLayer/${layerId}` : null,
  fetcher,
  { 
    revalidateOnFocus: false,
    shouldRetryOnError: false
  }
);


  // Set error from layer tracking if it exists
  useEffect(() => {
    if (layersError) {
      setError(layersError);
    }
  }, [layersError]);

  // Set error from SWR if it exists
  useEffect(() => {
    if (layerError) {
      setError(layerError.message);
      setCurrentLayer(null);
    }
  }, [layerError]);

  // Focus the input field when the component mounts or after submission
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentLayer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate stepId before proceeding
    if (!stepId) {
      setError("No step selected. Please select a production step first.");
      return;
    }
    
    setError("");
    setIsLoading(true);

    try {
      // Layer data is already fetched by SWR
      if (!layerData) {
        throw new Error(`Layer ID ${layerId} not found`);
      }

      const layer = layerData;

      // Check if this layer is already in this step or needs to be started
      const isInCurrentStep = layer.currentStep?._id === stepId;

      if (!isInCurrentStep) {
        // Start the layer in this step
        const startResponse = await fetch(`/api/layers/${layer._id}/process`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stepId,
            eventType: "start",
            workerId,
          }),
        });

        if (!startResponse.ok) {
          throw new Error("Failed to start processing layer");
        }

        // Trigger revalidation of the layer data
        mutate(`/api/layers/${layerId}`);
        
        // Wait for the updated data
        const updatedResponse = await fetch(`/api/layers/${layerId}`);
        if (!updatedResponse.ok) {
          throw new Error("Failed to fetch updated layer data");
        }
        
        const updatedLayer = await updatedResponse.json();
        setCurrentLayer(updatedLayer);
      } else {
        setCurrentLayer(layer);
      }

      setIsProcessComplete(false);
      setIsDefective(false);
      setNotes("");
    } catch (err) {
      console.error("Error fetching layer:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setCurrentLayer(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessComplete = async () => {
    if (!currentLayer || !stepId) return;

    setIsLoading(true);
    try {
      // Send the process completion to the API
      const response = await fetch(`/api/layers/${currentLayer._id}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stepId,
          eventType: isDefective ? "defect" : "complete",
          workerId,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update layer status");
      }

      // Add to recent layers
      setRecentLayers((prev) =>
        [
          {
            ...currentLayer,
            status: isDefective ? ("defective" as const) : ("completed" as const),
            processedAt: new Date(),
          },
          ...prev,
        ].slice(0, 5)
      );

      // Show success message
      setSuccess(`Layer ${currentLayer.code} processed successfully`);

      // Reset form for next entry
      setCurrentLayer(null);
      setLayerId("");
      setIsProcessComplete(false);
      setIsDefective(false);
      setNotes("");

      // Revalidate any related data
      mutate(`/api/layers/${currentLayer._id}`);
      if (stepId) {
        const queryParams = new URLSearchParams();
        queryParams.append('status', 'in-progress');
        queryParams.append('stepId', stepId);
        mutate(`/api/layers?${queryParams.toString()}`);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Error completing process:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const [productionLine, setProductionLine] = useState<any>(null);
  const [allSteps, setAllSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);

  const fetchLayerDetails = async (id: string) => {
    setIsLoading(true);
    try {
      // Fetch the layer first
      const response = await fetch(`/api/layers/${id}`);
      if (!response.ok) {
        throw new Error('Layer not found');
      }
      
      const layerData = await response.json();
      setCurrentLayer(layerData);
      
      // Now fetch the production line and steps information
      const lineResponse = await fetch(`/api/layers/${id}/production-info`);
      if (lineResponse.ok) {
        const productionInfo = await lineResponse.json();
        setProductionLine(productionInfo.productionLine);
        setAllSteps(productionInfo.allSteps);
        
        // Find the current step index
        if (productionInfo.allSteps && layerData.currentStep) {
          const index = productionInfo.allSteps.findIndex(
            (step: any) => step._id === layerData.currentStep.stepId
          );
          setCurrentStepIndex(index);
        }
      }
      
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load layer');
      setCurrentLayer(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    layerId,
    setLayerId,
    currentLayer,
    isProcessComplete,
    setIsProcessComplete,
    isDefective,
    setIsDefective,
    notes,
    setNotes,
    recentLayers,
    error,
    success,
    isLoading,
    isLayersLoading,
    stepsLayers,
    inputRef,
    handleSubmit,
    handleProcessComplete,
    productionLine,
    allSteps,
    currentStepIndex,
  };
}
