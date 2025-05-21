"use client";
import { useDrop } from "react-dnd";
import { FiUploadCloud, FiArrowDown } from "react-icons/fi";
import DraggableItem from "./DraggableItem";
import { DropAreaItem, InventoryData, Step } from "@/types/types";

export interface DraggableItemProps {
  item: Step | InventoryData | DropAreaItem;
  index: number;
  type: "inventory" | "step";
  isInLine: boolean;
  onReorder: (from: number, to: number) => void;
  onRemove: () => void;
}

export interface DropAreaProps {
  lineItems: DropAreaItem[];
  onDrop: (id: string, type: "step" | "inventory") => void;
  onReorder: (from: number, to: number) => void;
  onRemove: (id: string) => void;
}

export default function DropArea({
  lineItems,
  onDrop,
  onReorder,
  onRemove,
}: DropAreaProps) {
  // Set up drop target
  const [{ isOver }, dropRef] = useDrop(
    () => ({
      accept: ["step", "inventory"],
      drop: (item: {
        id: string;
        type: "step" | "inventory";
        isNew?: boolean;
      }) => {
        // Only handle new items being dropped, not reordering
        if (item.isNew) {
          onDrop(item.id, item.type);
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [onDrop]
  );

  return (
    <div
      ref={dropRef as unknown as React.RefObject<HTMLDivElement>}
      className={`min-h-[300px] border-2 border-dashed rounded-xl p-5 transition-all duration-300 ${
        isOver
          ? "border-blue-400 bg-blue-50 shadow-inner"
          : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
      }`}
    >
      {lineItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <FiUploadCloud className="text-blue-500 text-2xl" />
          </div>
          <p className="font-vazir text-center mb-2">
            برای ایجاد خط تولید خود، موارد را به اینجا بکشید و رها کنید
          </p>
          <p className="text-xs text-gray-400 font-vazir text-center">
            می‌توانید آیتم‌های موجودی یا مراحل را به این بخش بکشید.
          </p>
        </div>
      ) : (
        <div>
          {lineItems.map((item, index) => (
            <div key={item.id}>
              <DraggableItem
                item={{
                  ...item,
                  Capacity: item.Capacity || 0, // Ensure Capacity is always a number
                  location: item.location || "", // Ensure location is always a string
                }}
                index={index}
                type={item.type}
                isInLine={true}
                onReorder={onReorder}
                onRemove={() => onRemove(item.id)}
              />
              {index < lineItems.length - 1 && (
                <div className="flex justify-center my-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center">
                    <FiArrowDown className="text-gray-500 text-sm" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
