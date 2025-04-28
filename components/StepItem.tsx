"use client";
import { Ref } from "react";
import { useDrag } from "react-dnd";
import { ProductionStep } from "./types/production";

export default function StepItem({
  step,
  isInLine,
  onRemove,
}: {
  step: ProductionStep;
  isInLine: boolean;
  onRemove?: () => void;
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "step",
    item: { 
      id: step.id,
      type: "step",
      isNew: !isInLine // Flag to indicate if this is a new item being dragged
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
          ? "bg-blue-100 border border-blue-300"
          : "bg-gray-100 border border-gray-300"
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{step.name}</h3>
          {step.description && (
            <p className="text-sm text-gray-600">{step.description}</p>
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
