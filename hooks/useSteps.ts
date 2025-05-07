import { useState, useEffect, useCallback } from "react";

export interface Step {
  _id: string;
  name: string;
  code: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export function useSteps() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSteps = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/steps");
      if (!response.ok) {
        throw new Error("Failed to fetch steps");
      }
      const data = await response.json();
      setSteps(data);
    } catch (err) {
      console.error("Error fetching steps:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  const deleteStep = async (id: string) => {
    try {
      const response = await fetch(`/api/steps/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete step");
      }
      
      // Refresh the steps list
      await fetchSteps();
      return true;
    } catch (err) {
      console.error("Error deleting step:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      return false;
    }
  };

  const updateStep = async (id: string, data: Partial<Step>) => {
    try {
      const response = await fetch(`/api/steps/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update step");
      }
      
      // Refresh the steps list
      await fetchSteps();
      return true;
    } catch (err) {
      console.error("Error updating step:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      return false;
    }
  };

  const getStepById = async (id: string) => {
    try {
      const response = await fetch(`/api/steps/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch step");
      }
      
      return await response.json();
    } catch (err) {
      console.error("Error fetching step:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    }
  };

  return { 
    steps, 
    isLoading, 
    error, 
    fetchSteps, 
    deleteStep, 
    updateStep,
    getStepById
  };
}
