"use client";
import React, { Ref } from "react";
import { useDrag } from "react-dnd";
import { InventoryData, Step } from "@/types/types";

type ItemType = "inventory" | "step";

interface DraggableItemSourceProps {
  item: InventoryData | Step;
  type: ItemType;
}

export default function DraggableItemSource({
  item,
  type,
}: DraggableItemSourceProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type, // This must match the "accept" in your drop target
    item: {
      id: item._id,
      type,
      isNew: true, // Flag to indicate this is a new item being dragged
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as unknown as Ref<HTMLDivElement>}
      className={`p-4 mb-2 rounded-lg cursor-grab ${
        isDragging ? "opacity-50" : "opacity-100"
      } bg-gray-100 border border-gray-300`}
    >
      <div>
        <h3 className="font-medium">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-gray-600">{item.description}</p>
        )}
        {type === "inventory" && item.Capacity !== undefined && (
          <p className="text-sm text-gray-600">ظرفیت: {item.Capacity}</p>
        )}
        {type === "step" && item.code && (
          <p className="text-sm text-gray-600">کد: {item.code}</p>
        )}
      </div>
    </div>
  );
}
