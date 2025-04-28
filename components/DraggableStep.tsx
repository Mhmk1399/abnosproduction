"use client";
import { useDrag, useDrop } from "react-dnd";
import { useRef } from "react";
import StepItem from "./StepItem";
import InventoryItem from "./InventoryItem";
import { ProductionStep, Inventory } from "./types/production";

interface DraggableItemProps {
  item: ProductionStep | Inventory;
  index: number;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: () => void;
}

export default function DraggableItem({
  item,
  index,
  onReorder,
  onRemove,
}: DraggableItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Determine if this is a step or inventory
  const isStep = 'description' in item;
  const itemType = isStep ? "step" : "inventory";

  // Set up drag for reordering
  const [{ isDragging }, drag] = useDrag(() => ({
    type: itemType,
    item: { 
      id: item.id,
      type: itemType,
      index, // Include index for reordering
      isReordering: true // Flag to indicate this is a reordering operation
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Set up drop for reordering
  const [, drop] = useDrop(() => ({
    accept: ["step", "inventory"],
    hover: (draggedItem: { id: string; index: number; isReordering: boolean }) => {
      // Skip if dragging over itself
      if (draggedItem.index === index) {
        return;
      }
      
      // Only handle reordering operations here
      if (draggedItem.isReordering) {
        // Call reorder function
        onReorder(draggedItem.index, index);
        
        // Update the index in the dragged item
        draggedItem.index = index;
      }
    },
  }));

  // Combine drag and drop refs
  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`mb-2 ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      {isStep ? (
        <StepItem 
          step={item as ProductionStep} 
          isInLine={true} 
          onRemove={onRemove} 
        />
      ) : (
        <InventoryItem 
          inventory={item as Inventory} 
          isInLine={true} 
          onRemove={onRemove} 
        />
      )}
    </div>
  );
}
