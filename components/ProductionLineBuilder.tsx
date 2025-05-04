"use client";
import { useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import LineArea from "./LineArea";
import MicroLineItem from "./MicroLineItem"; // You'll need to create this component
import InventoryItem from "./InventoryItem";
import { useMicroLines, MicroLine } from "../hooks/useMicroLines";
import { useInventories, Inventory } from "../hooks/useInventories";
import { v4 as uuidv4 } from "uuid";
import { LineItem } from "./types/production";

interface ProductionLineBuilderProps {
  initialConfig?: any;
  onSave?: (config: any) => void;
}

export default function ProductionLineBuilder({
  initialConfig,
  onSave,
}: ProductionLineBuilderProps) {
  // Use our custom hooks to fetch microLines and inventories
  const { microLines, isLoading: microLinesLoading, error: microLinesError, mutate } = useMicroLines();
  const {
    inventories,
    isLoading: inventoriesLoading,
    error: inventoriesError,
  } = useInventories();

  // State for the production line being built
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [lineName, setLineName] = useState(initialConfig?.name || "");
  const [lineCode, setLineCode] = useState(initialConfig?.code || "");
  const [lineDescription, setLineDescription] = useState(
    initialConfig?.description || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle dropping a new item into the line area
  const handleDrop = useCallback(
    (itemId: string, itemType: "microLine" | "inventory") => {
      // Find the original item
      let originalItem;
      if (itemType === "microLine") {
        originalItem = microLines.find((ml) => ml._id === itemId);
      } else {
        originalItem = inventories.find((i) => i._id === itemId);
      }

      if (originalItem) {
        // Create a new line item with a unique ID
        const newItem: LineItem = {
          id: uuidv4(),
          originalId: originalItem._id,
          name: originalItem.name,
          type: itemType,
          description: originalItem.description,
          ...(itemType === "inventory" && {
            quantity: (originalItem as Inventory).quantity,
          }),
          ...(itemType === "microLine" && {
            steps: (originalItem as MicroLine).steps,
          }),
        };

        setLineItems((prev) => [...prev, newItem]);
      }
    },
    [microLines, inventories]
  );

  // Handle reordering items within the line area
  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setLineItems((prev) => {
      const newItems = [...prev];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return newItems;
    });
  }, []);

  // Handle removing an item from the line area
  const handleRemove = useCallback((itemId: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  // Handle saving the production line
  const handleSave = async () => {
    if (!lineName.trim()) {
      setError("Production line name is required");
      return;
    }

    if (lineItems.length === 0) {
      setError("Production line must have at least one item");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare the data for the API according to the new model structure
      const microLinesData = lineItems
        .filter((item) => item.type === "microLine")
        .map((item, index) => ({
          microLine: item.originalId,
          order: index,
        }));

      const inventoryId = lineItems
        .find((item) => item.type === "inventory")?.originalId || null;

      const productionLineData = {
        name: lineName,
        code: lineCode,
        description: lineDescription,
        microLines: microLinesData,
        inventory: inventoryId,
        active: true,
        ...(initialConfig?._id && { _id: initialConfig._id }),
      };

      // Send the data to the API
      const url = initialConfig?._id
        ? `/api/production-lines/${initialConfig._id}`
        : "/api/production-lines";

      const method = initialConfig?._id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productionLineData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save production line");
      }

      const savedLine = await response.json();

      setSuccess("Production line saved successfully!");
      mutate(); // Refresh the microLines data

      // Call the onSave callback if provided
      if (onSave) {
        onSave(savedLine);
      }
    } catch (err) {
      console.error("Error saving production line:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  const isLoading = microLinesLoading || inventoriesLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (microLinesError || inventoriesError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p className="font-bold">Error:</p>
        <p>{microLinesError || inventoriesError}</p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="mb-6 space-y-4">
          <div>
            <label
              htmlFor="lineName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Production Line Name*
            </label>
            <input
              type="text"
              id="lineName"
              value={lineName}
              onChange={(e) => setLineName(e.target.value)}
              placeholder="Enter production line name"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="lineCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Code
            </label>
            <input
              type="text"
              id="lineCode"
              value={lineCode}
              onChange={(e) => setLineCode(e.target.value)}
              placeholder="Enter code (optional)"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="lineDescription"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="lineDescription"
              value={lineDescription}
              onChange={(e) => setLineDescription(e.target.value)}
              placeholder="Enter description (optional)"
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Available Micro Lines</h2>
            <div className="bg-white p-4 rounded-lg shadow-md h-[500px] overflow-y-auto">
              <div className="space-y-2">
                {microLines.map((microLine) => (
                  <MicroLineItem
                    key={microLine._id}
                    microLine={{
                      id: microLine._id,
                      name: microLine.name,
                      description: microLine.description,
                      steps: microLine.steps,
                    }}
                    isInLine={false}
                  />
                ))}
              </div>
              {microLines.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No micro lines available
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Available Inventories</h2>
            <div className="bg-white p-4 rounded-lg shadow-md h-[500px] overflow-y-auto">
              <div className="space-y-2">
                {inventories.map((inventory) => (
                  <InventoryItem
                    key={inventory._id}
                    inventory={{
                      id: inventory._id,
                      name: inventory.name,
                      quantity: inventory.quantity,
                      description: inventory.description,
                    }}
                    isInLine={false}
                  />
                ))}
              </div>
              {inventories.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No inventories available
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Production Line</h2>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <LineArea
                items={lineItems}
                onDrop={handleDrop}
                onReorder={handleReorder}
                onRemove={handleRemove}
              />

              <button
                onClick={handleSave}
                disabled={
                  isSaving || !lineName.trim() || lineItems.length === 0
                }
                className="mt-4 w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
