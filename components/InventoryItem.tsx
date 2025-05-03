"use client";
import { Ref } from "react";
import { useDrag } from "react-dnd";
import { Inventory } from "./types/production";

export default function InventoryItem({
  inventory,
  isInLine,
  onRemove,
}: {
  inventory: Inventory;
  isInLine: boolean;
  onRemove?: () => void;
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "inventory", // Different type from "step"
    item: {
      id: inventory.id,
      type: "inventory",
      isNew: !isInLine, // Flag to indicate if this is a new item being dragged
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as unknown as Ref<HTMLDivElement>}
      className={`p-4 mb-2 rounded-lg cursor-move ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${
        isInLine
          ? "bg-green-100 border border-green-300" // Different color for inventories
          : "bg-gray-100 border border-gray-300"
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{inventory.name}</h3>
          {inventory.quantity !== undefined && (
            <p className="text-sm text-gray-600">
              Quantity: {inventory.quantity}
            </p>
          )}
        </div>
        {isInLine && onRemove && (
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
