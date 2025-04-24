"use client";
import { Ref } from "react";
import { useDrop } from "react-dnd";
import { ProductionStep } from "../types/production";
import DraggableStep from "./DraggableStep";

export default function LineArea({
  steps,
  onDrop,
  onReorder,
  onRemove,
}: {
  steps: ProductionStep[];
  onDrop: (stepId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (stepId: string) => void;
}) {
  const [, drop] = useDrop(() => ({
    accept: "step",
    drop: (item: { id: string }) => onDrop(item.id),
  }));

  return (
    <div
      ref={drop as unknown as Ref<HTMLDivElement>}
      className="min-h-[400px] p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
    >
      {steps.map((step, index) => (
        <DraggableStep
          key={step.id}
          step={step}
          index={index}
          onReorder={onReorder}
          onRemove={() => onRemove(step.id)}
        />
      ))}
      {steps.length === 0 && (
        <div className="text-gray-400 text-center py-8">
          Drag steps here to build your production line
        </div>
      )}
    </div>
  );
}
