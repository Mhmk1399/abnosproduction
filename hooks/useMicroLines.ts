import useSWR from "swr";

export interface MicroLine {
  _id: string;
  name: string;
  code: string;
  description: string;
  steps: {
    step: {
      _id: string;
      name: string;
      description: string;
    };
    order: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch micro lines");
  }
  return response.json();
};

export function useMicroLines() {
  const { data, error, isLoading, mutate } = useSWR<MicroLine[]>(
    "/api/microLine",
    fetcher
  );
  
  return {
    microLines: data || [],
    isLoading,
    error: error ? error.message : null,
    mutate
  };
}