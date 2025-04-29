import useSWR from "swr";
import { Layer } from "../components/types/production";

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch layers");
  }
  return response.json();
};

export function useLayerTracking(stepId?: string) {
  // Only create the URL if stepId is provided
  const queryParams = new URLSearchParams();
  queryParams.append('status', 'in-progress');
  
  // Make sure stepId is a valid ObjectId (24 character hex string)
  const shouldFetch = stepId && /^[0-9a-fA-F]{24}$/.test(stepId);
  
  if (shouldFetch) {
    queryParams.append('stepId', stepId);
  }
  
  // Use SWR for data fetching with a polling interval
  const { data, error, isValidating } = useSWR(
    shouldFetch ? `/api/layers?${queryParams.toString()}` : null,
    fetcher,
    {
      refreshInterval: 10000, // Poll every 10 seconds
      revalidateOnFocus: true,
      dedupingInterval: 5000, // Deduplicate requests within 5 seconds
    }
  );

  return {
    layers: data?.layers || [],
    isLoading: isValidating,
    error: error ? error.message : ""
  };
}
