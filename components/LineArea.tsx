import { useDrop } from "react-dnd";
import { LineItem } from "./types/production";
import MicroLineItem from "./MicroLineItem";
import InventoryItem from "./InventoryItem";
import StepItem from "./StepItem";
import {
  FiArrowDown,
  FiCheckCircle,
  FiCheckSquare,
  FiDatabase,
  FiLayers,
  FiPackage,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

interface LineAreaProps {
  items: LineItem[];
  onDrop: (
    itemId: string,
    itemType: "microLine" | "inventory" | "step"
  ) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (itemId: string) => void;
}

export default function LineArea({
  items,
  onDrop,
  onReorder,
  onRemove,
}: LineAreaProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ["microLine", "inventory", "step"],
    drop: (item: { id: string; type: "microLine" | "inventory" | "step" }) => {
      onDrop(item.id, item.type);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    onReorder(dragIndex, hoverIndex);
  };

  return (
    <div
      ref={drop}
      className={`min-h-[300px] border-2 border-dashed rounded-xl p-5 transition-all duration-300 ${
        isOver
          ? "border-blue-400 bg-blue-50 shadow-inner"
          : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
      }`}
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <FiUploadCloud className="text-blue-500 text-2xl" />
          </div>
          <p className="font-vazir text-center mb-2">
            برای ایجاد خط تولید خود، موارد را به اینجا بکشید و رها کنید
          </p>
          <p className="text-xs text-gray-400 font-vazir text-center">
            خطوط میکرو، مراحل و موجودی‌ها را از سمت راست به اینجا بکشید
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="relative group">
              {item.type === "microLine" ? (
                <div className="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm group-hover:shadow-md transition-all duration-200">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full opacity-50 pointer-events-none"></div>
                  <div className="flex items-start gap-3 relative">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <FiLayers className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-800 font-vazir text-base mb-1">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-vazir">
                            خط میکرو
                          </span>
                          <button
                            onClick={() => onRemove(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            aria-label="حذف"
                          >
                            <FiX className="text-lg" />
                          </button>
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 font-vazir mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      {item.steps && item.steps.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 font-vazir">
                          <FiCheckSquare className="text-gray-400" />
                          <span>{item.steps.length} مرحله</span>
                        </div>
                      )}
                    </div>
                  </div>
                
                </div>
              ) : item.type === "inventory" ? (
                <div className="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm group-hover:shadow-md transition-all duration-200">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-bl-full opacity-50 pointer-events-none"></div>
                  <div className="flex items-start gap-3 relative">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <FiPackage className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-800 font-vazir text-base mb-1">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-vazir">
                            موجودی
                          </span>
                          <button
                            onClick={() => onRemove(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            aria-label="حذف"
                          >
                            <FiX className="text-lg" />
                          </button>
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 font-vazir mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      {item.quantity !== undefined && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 font-vazir">
                          <FiDatabase className="text-gray-400" />
                          <span>موجودی: {item.quantity}</span>
                        </div>
                      )}
                    </div>
                  </div>
                
                </div>
              ) : (
                <div className="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm group-hover:shadow-md transition-all duration-200">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full opacity-50 pointer-events-none"></div>
                  <div className="flex items-start gap-3 relative">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <FiCheckCircle className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-800 font-vazir text-base mb-1">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-vazir">
                            مرحله
                          </span>
                          <button
                            onClick={() => onRemove(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            aria-label="حذف"
                          >
                            <FiX className="text-lg" />
                          </button>
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 font-vazir mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
               
                </div>
              )}

              {/* {index < items.length - 1 && (
                <div className="absolute bottom-0 left-1/2 transform translate-y-1/2 -translate-x-1/2 z-10">
                  <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center">
                    <FiArrowDown className="text-gray-500 text-sm" />
                  </div>
                </div>
              )} */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
