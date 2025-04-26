"use client";
import { Ref } from "react";
import { useDrop } from "react-dnd";
import { ProductionStep, Inventory } from "../types/production";
import DraggableStep from "./DraggableStep";
import DraggableInventory from "./DraggableInventory";

type LineItem = ProductionStep | Inventory;

export default function LineArea({
  items,
  onDrop,
  onReorder,
  onRemove,
}: {
  items: LineItem[];
  onDrop: (itemId: string, itemType: "step" | "inventory") => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (itemId: string) => void;
}) {
  // Handle drops for steps
  const [, dropStep] = useDrop(() => ({
    accept: "step",
    drop: (item: { id: string; index?: number }) => {
      // Only handle drops for new items (not reordering)
      if (item.index === undefined) {
        onDrop(item.id, "step");
      }
    },
  }));

  // Handle drops for inventories
  const [, dropInventory] = useDrop(() => ({
    accept: "inventory",
    drop: (item: { id: string; index?: number }) => {
      // Only handle drops for new items (not reordering)
      if (item.index === undefined) {
        onDrop(item.id, "inventory");
      }
    },
  }));

  // Combine the refs
  const dropRef = (node: HTMLDivElement | null) => {
    dropStep(node);
    dropInventory(node);
  };

  // Helper function to determine if an item is a step or inventory
  const isStep = (item: LineItem): item is ProductionStep => {
    return 'description' in item; // Assuming steps have a description property and inventories don't
  };

  return (
    <div
      ref={dropRef as unknown as Ref<HTMLDivElement>}
      className="min-h-[400px] p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
    >
      {items.map((item, index) => (
        isStep(item) ? (
          <DraggableStep
            key={`step-${item.id}-${index}`}
            step={item}
            index={index}
            onReorder={onReorder}
            onRemove={() => onRemove(item.id)}
          />
        ) : (
          <DraggableInventory
            key={`inventory-${item.id}-${index}`}
            inventory={item as Inventory}
            index={index}
            onReorder={onReorder}
            onRemove={() => onRemove(item.id)}
          />
        )
      ))}
      {items.length === 0 && (
        <div className="text-gray-400 text-center py-8">
          Drag steps and inventories here to build your production line
        </div>
      )}
    </div>
  );
}
