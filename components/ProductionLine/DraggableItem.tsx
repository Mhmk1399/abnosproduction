"use client";
import React from "react";
import { useDrag, useDrop } from "react-dnd";
import { InventoryData, Step, DraggableItemProps } from "@/types/types";

export default function DraggableItem({
  item,
  index,
  type,
  isInLine,
  onReorder,
  onRemove,
}: DraggableItemProps) {
  // Set up drag for reordering
  const [{ isDragging }, drag] = useDrag(() => ({
    type,
    item: {
      id:
        type === "inventory" ? (item as InventoryData).id : (item as Step)._id,
      index,
      isReordering: true,
      type,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Set up drop for reordering
  const [, drop] = useDrop(() => ({
    accept: type,
    hover: (draggedItem: { id: string; index: number }) => {
      // Skip if dragging over itself
      if (draggedItem.index === index) {
        return;
      }

      // Call reorder function
      onReorder(draggedItem.index, index);

      // Update the index in the dragged item
      draggedItem.index = index;
    },
  }));

  // Combine drag and drop refs
  const ref = (node: HTMLDivElement | null) => {
    drag(node);
    drop(node);
  };

  // Render inventory item
  const renderInventoryItem = (inventory: InventoryData) => (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="font-medium">{inventory.name}</h3>
        {inventory.Capacity !== undefined && (
          <p className="text-sm text-gray-600">ظرفیت: {inventory.Capacity}</p>
        )}
      </div>
      {isInLine && (
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
          aria-label="Remove item"
        >
          ×
        </button>
      )}
    </div>
  );

  // Render step item
  const renderStepItem = (step: Step) => (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="font-medium text-gray-800">{step.name}</h3>
        {step.description && (
          <p className="text-sm text-gray-500">{step.description}</p>
        )}
      </div>
      {isInLine && (
        <button
          onClick={onRemove}
          className="ml-2 text-red-500 hover:text-red-700"
          aria-label="Remove step"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );

  return (
    <div
      ref={ref}
      className={`mb-2 ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      <div
        className={`p-4 rounded-lg cursor-move ${
          type === "inventory"
            ? "bg-green-100 border border-green-300"
            : "bg-white border border-gray-200 shadow-sm"
        }`}
      >
        {type === "inventory"
          ? renderInventoryItem(item as InventoryData)
          : renderStepItem(item as Step)}
      </div>
    </div>
  );
}
