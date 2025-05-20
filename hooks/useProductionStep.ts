import { useState } from 'react';
import useSWR from 'swr';
import { glasstreatments, Step, UseProductionStepReturn } from '../types/types';






const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProductionStep(): UseProductionStepReturn {
  const [error, setError] = useState<string | null>(null);
  const [treatments, setTreatments] = useState<glasstreatments[]>([]);
  const [loadingTreatments, setLoadingTreatments] = useState(false);

  const { data, error: swrError, mutate: swrMutate } = useSWR<Step[]>(
    '/api/steps',
    fetcher,
    {
      dedupingInterval: 2000, // Deduplicate requests within 2 seconds
      revalidateOnFocus: false, // Don't revalidate when window gets focus
      revalidateIfStale: true,
      revalidateOnReconnect: true
    }
  );

  // Create a new Step



  // Function to fetch glass treatments
  const fetchGlassTreatments = async (): Promise<glasstreatments[]> => {
    try {
      setLoadingTreatments(true);
      console.log(treatments)
      console.log(loadingTreatments)

      const response = await fetch('/api/glassTreatments');
      if (!response.ok) {
        throw new Error('Failed to fetch glass treatments');
      }
      const data = await response.json();
      setTreatments(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    } finally {
      setLoadingTreatments(false);
    }
  };

  const createStep = async (StepData: Step): Promise<boolean> => {
    try {
      const response = await fetch('/api/steps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(StepData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create Step');
      }

      return swrMutate().then(() => true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };

  // Get a specific Step by ID
  const getStep = async (id: string): Promise<Step | null> => {
    try {
      const response = await fetch(`/api/steps/detailed`, {
        method: 'GET',
        headers: {
          'id': id,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch Step');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  };

  // Update an existing Step
  const updateStep = async (StepData: Step): Promise<boolean> => {
    try {
      const response = await fetch(`/api/steps/detailed`, {
        method: 'PATCH',
        headers: new Headers({
          'Content-Type': 'application/json',
          'id': StepData._id || '',
        }),
        body: JSON.stringify({
          name: StepData.name,
          code: StepData.code,
          description: StepData.description,
          requiresScan: StepData.requiresScan,
          handlesTreatments: StepData.handlesTreatments,
          type: StepData.type,
          password: StepData.password,
          createdAt: StepData.createdAt,
          updatedAt: StepData.updatedAt,

        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update Step');
      }

      return swrMutate().then(() => true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };
  // Delete an Step
  const deleteStep = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/steps/detailed`, {
        method: 'DELETE',
        headers: {
          'id': id,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete StepData');
      }

      return swrMutate().then(() => true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };

  const mutate = async (): Promise<Step[]> => {
    const result = await swrMutate();
    return result ?? [];
  };

  return {
    steps: data || [],
    isLoading: !error && !data,
    error: swrError ? swrError.message : error,
    mutate,
    createStep,
    updateStep,
    deleteStep,
    getStep,
    fetchGlassTreatments,
    treatments,
    loadingTreatments,
  };
}