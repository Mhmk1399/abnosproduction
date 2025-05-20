import React from "react";
import { useDrag, useDrop } from "react-dnd";

interface ProductionStep {
  _id: string;
  name: string;
  code: string;
  // Add other properties as needed
}

interface Inventory {
  _id: string;
  name: string;
  // Add other inventory properties
}

interface DraggableItemProps {
  item: ProductionStep | Inventory;
  index: number;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: () => void;
}

const DraggableStep: React.FC<DraggableItemProps> = ({
  item,
  index,
  onReorder,
  onRemove,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: "STEP",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "STEP",
    hover(draggedItem: { index: number }) {
      if (draggedItem.index !== index) {
        onReorder(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`p-4 mb-2 bg-white rounded shadow ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-sm text-gray-500">{item.code}</p>
        </div>
        <button onClick={onRemove} className="text-red-500 hover:text-red-700">
          Remove
        </button>
      </div>
    </div>
  );
};

export default DraggableStep;
