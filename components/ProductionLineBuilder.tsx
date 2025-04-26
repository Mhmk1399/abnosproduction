import { useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import LineArea from "./LineArea";
import {
  ProductionStep,
  ProductionLineConfig,
  Inventory,
} from "../types/production";
import StepItem from "./StepItem";
import InventoryItem from "./InventoryItem";

export default function ProductionLineBuilder({
  availableSteps,
  availableInventories,
  initialConfig,
  onSave,
}: {
  availableSteps: ProductionStep[];
  availableInventories: Inventory[];
  initialConfig?: ProductionLineConfig;
  onSave: (config: ProductionLineConfig) => void;
}) {
  // Initialize with empty array if no initial config
  const [lineItems, setLineItems] = useState<(ProductionStep | Inventory)[]>(
    initialConfig?.items || []
  );
  const [lineName, setLineName] = useState(initialConfig?.name || "");

  // Handle dropping a new item into the line area
  const handleDrop = useCallback(
    (itemId: string, itemType: "step" | "inventory") => {
      if (itemType === "step") {
        // Find the step in available steps
        const step = availableSteps.find((s) => s.id === itemId);
        if (step) {
          // Create a new step with unique ID to allow duplicates
          const newStep = {
            ...step,
            id: `${step.id}-${Date.now()}`, // Ensure unique ID
          };
          // Add to line items
          setLineItems((prev) => [...prev, newStep]);
        }
      } else if (itemType === "inventory") {
        // Find the inventory in available inventories
        const inventory = availableInventories.find((i) => i.id === itemId);
        if (inventory) {
          // Create a new inventory with unique ID to allow duplicates
          const newInventory = {
            ...inventory,
            id: `${inventory.id}-${Date.now()}`, // Ensure unique ID
          };
          // Add to line items
          setLineItems((prev) => [...prev, newInventory]);
        }
      }
    },
    [availableSteps, availableInventories]
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
    // Separate steps and inventories for the API
    const steps = lineItems.filter(
      (item) => "description" in item
    ) as ProductionStep[];
    const inventories = lineItems.filter(
      (item) => !("description" in item)
    ) as Inventory[];

    const config: ProductionLineConfig = {
      id: initialConfig?.id || crypto.randomUUID(),
      name: lineName,
      steps,
      inventories,
      items: lineItems, // Keep the combined items for reference
      order: lineItems.map((item) => item.id),
      createdAt: initialConfig?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    try {
      const response = await fetch("/api/production-lines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error("Failed to save");

      onSave(config);
      alert("Production line saved successfully!");
    } catch (error) {
      console.error("Error saving production line:", error);
      alert("Error saving production line");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <input
            type="text"
            value={lineName}
            onChange={(e) => setLineName(e.target.value)}
            placeholder="Enter production line name"
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {/* Available Steps Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Available Steps</h2>
              <div className="space-y-2">
                {availableSteps.map((step) => (
                  <StepItem key={step.id} step={step} isInLine={false} />
                ))}
              </div>
            </div>

            {/* Available Inventories Section */}
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4">Available Inventories</h2>
            <div className="space-y-2">
              {availableInventories.map((inventory) => (
                <InventoryItem
                  key={inventory.id}
                  inventory={inventory}
                  isInLine={false}
                />
              ))}
            </div>
          </div>

          <div className="grid col-span-2">
            <h2 className="text-xl font-bold mb-4 w-full ">Production Line</h2>
            <LineArea
              items={lineItems}
              onDrop={handleDrop}
              onReorder={handleReorder}
              onRemove={handleRemove}
            />
            <button
              onClick={handleSave}
              disabled={!lineName || lineItems.length === 0}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
