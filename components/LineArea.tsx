"use client";
import { Ref } from "react";
import { useDrop } from "react-dnd";
import { ProductionStep, Inventory } from "../types/production";
import DraggableItem from "./DraggableStep";

interface LineAreaProps {
  items: (ProductionStep | Inventory)[];
  onDrop: (itemId: any, itemType: any,) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (itemId: string) => void;
}

export default function LineArea({
  items,
  onDrop,
  onReorder,
  onRemove,
}: LineAreaProps) {
  // Set up drop for both steps and inventories
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ["step", "inventory"],
    drop: (item: { id: string; type: string; isNew?: boolean; isReordering?: boolean }, monitor) => {
      // Only handle drops for new items (not reordering)
      if (!item.isReordering && item.isNew) {
        onDrop(item.id, item.type);
        return { dropped: true };
      }
      return undefined;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop as unknown as Ref<HTMLDivElement>}
      className={`min-h-[400px] p-4 rounded-lg border-2 border-dashed ${
        isOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
      } transition-colors duration-200`}
    >
      {items.map((item, index) => (
        <DraggableItem
          key={item.id}
          item={item}
          index={index}
          onReorder={onReorder}
          onRemove={() => onRemove(item.id)}
        />
      ))}
      {items.length === 0 && (
        <div className="text-gray-400 text-center py-8">
          Drag steps and inventories here to build your production line
        </div>
      )}
    </div>
  );
}
