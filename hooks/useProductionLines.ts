import { useState, useEffect } from 'react';
import { ProductionLine } from '@/types/production';







export function useProductionLines() {
    const [lines, setLines] = useState<ProductionLine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProductionLines() {
            setIsLoading(true);
            try {
                const response = await fetch('/api/production-lines');
                if (!response.ok) {
                    throw new Error('Failed to fetch production lines');
                }
                const data = await response.json();
                setLines(data);
            } catch (err) {
                console.error('Error fetching production lines:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        }

        fetchProductionLines();
    }, []);

    return { lines, isLoading, error };
}

// Hook for fetching a single production line by ID
export function useProductionLine(id: string) {
    const [line, setLine] = useState<ProductionLine | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProductionLine() {
            if (!id) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`/api/production-lines/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch production line');
                }
                const data = await response.json();
                setLine(data);
            } catch (err) {
                console.error(`Error fetching production line ${id}:`, err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        }

        fetchProductionLine();
    }, [id]);

    return { line, isLoading, error };
}
