"use client";
import { useDrag, useDrop } from "react-dnd";
import InventoryItem from "./InventoryItem";
import { Inventory } from "../types/production";

export default function DraggableInventory({
  inventory,
  index,
  onReorder,
  onRemove,
}: {
  inventory: Inventory;
  index: number;
  onReorder: (from: number, to: number) => void;
  onRemove: () => void;
}) {
  // Set up drag for reordering
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "inventory",
    item: { 
      id: inventory.id,
      index, // Include index for reordering
      isReordering: true,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Set up drop for reordering
  const [, drop] = useDrop(() => ({
    accept: "inventory",
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

  return (
    <div
      ref={ref}
      className={`mb-2 ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      <InventoryItem 
        inventory={inventory} 
        isInLine={true} 
        onRemove={onRemove} 
      />
    </div>
  );
}
