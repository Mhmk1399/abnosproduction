import { useState, useEffect } from 'react';

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

  useEffect(() => {
    async function fetchSteps() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/steps');
        if (!response.ok) {
          throw new Error('Failed to fetch steps');
        }
        const data = await response.json();
        setSteps(data);
      } catch (err) {
        console.error('Error fetching steps:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSteps();
  }, []);

  return { steps, isLoading, error };
}
