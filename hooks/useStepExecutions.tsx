import { useState, useEffect } from "react";
import { StepExecution } from "@/types/types";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useStepExecutions() {
  const [error, setError] = useState<string | null>(null);

  // Fetch all step executions or filtered by layerId
  const getStepExecutions = async (layerId?: string): Promise<StepExecution[]> => {
    try {
      const url = layerId 
        ? `/api/StepExecution?layerId=${layerId}` 
        : '/api/StepExecution';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch step executions');
      }
      
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    }
  };

  // Create a new step execution
  const createStepExecution = async (stepExecutionData: Partial<StepExecution>): Promise<StepExecution | null> => {
    try {
      const response = await fetch('/api/StepExecution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stepExecutionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create step execution');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  };

  return {
    error,
    getStepExecutions,
    createStepExecution,
  };
}

export function useStepExecution(id: string) {
  const [stepExecution, setStepExecution] = useState<StepExecution | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStepExecution = async () => {
    if (!id) {
      setIsLoading(false);
      return null;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/StepExecution/detailed`, {
        method: 'GET',
        headers: {
          'id': id,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch step execution');
      }

      const data = await response.json();
      setStepExecution(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (id) {
      fetchStepExecution();
    }
  }, [id]);

  // Update the step execution
  const updateStepExecution = async (updatedData: Partial<StepExecution>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/StepExecution/detailed`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'id': id,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update step execution');
      }

      // Refresh the data
      await fetchStepExecution();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };

  // Delete the step execution
  const deleteStepExecution = async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/StepExecution/detailed`, {
        method: 'DELETE',
        headers: {
          'id': id,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete step execution');
      }

      setStepExecution(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };

  return {
    stepExecution,
    isLoading,
    error,
    mutate: fetchStepExecution,
    updateStepExecution,
    deleteStepExecution
  };
}
