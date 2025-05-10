import useSWR from "swr";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch inventories");
  }
  return response.json();
};

export function useInventory() {
  const { data, error, isLoading, mutate } = useSWR("/api/inventory", fetcher);

  const deleteInventory = async (id: string) => {
    try {
      const response = await fetch("/api/inventory", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete inventory");
      }

      // Revalidate the data after successful deletion
      mutate();
      return true;
    } catch (error) {
      console.error("Error deleting inventory:", error);
      return false;
    }
  };

  const updateInventory = async (data: any) => {
    try {
      const response = await fetch("/api/inventory", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update inventory");
      }

      // Revalidate the data after successful update
      mutate();
      return true;
    } catch (error) {
      console.error("Error updating inventory:", error);
      return false;
    }
  };

  return {
    inventories: data || [],
    isLoading,
    error: error?.message,
    mutate,
    deleteInventory,
    updateInventory,
  };
}
