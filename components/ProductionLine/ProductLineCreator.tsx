"use client";
import { useState, useCallback, useEffect } from "react";

import { useProductionLines } from "@/hooks/useProductionLines";
import DraggableItemSource from "./DraggableItemSource";
import {
  InventoryData,
  LineItem,
  ProductionLine,
  Step,
} from "../../types/types";

import {
  FiAlertCircle,
  FiCheckCircle,
  FiFileText,
  FiHash,
  FiLayers,
  FiLoader,
  FiPackage,
  FiSave,
  FiSettings,
  FiTrello,
  FiType,
} from "react-icons/fi";
import DropArea from "./DropArea";

interface ProductLineCreatorProps {
  initialConfig?: ProductionLine;
  onSave?: (config: string) => void;
}

export default function ProductLineCreator({
  onSave,
  initialConfig,
}: ProductLineCreatorProps) {
  // Use our custom hook to fetch data and manage production lines
  const {
    isLoading,
    error: apiError,
    steps,
    inventories,
    loadingSteps,
    loadingInventories,
    createProductionLine,
    updateProductionLine,
    fetchSteps,
    fetchInventories,
    mutate,
  } = useProductionLines();

  // State for the production line being built
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [lineName, setLineName] = useState<string>("");
  const [lineCode, setLineCode] = useState<string>("");
  const [lineDescription, setLineDescription] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch steps and inventories when component mounts
  useEffect(() => {
    fetchSteps();
    fetchInventories();
  }, []);

  // Handle dropping a new item into the line area
  const handleDrop = useCallback(
    (itemId: string, itemType: "step" | "inventory") => {
      // Check if this item already exists in the line
      const isDuplicate = lineItems.some(
        (item) => item.originalId === itemId && item.type === itemType
      );

      if (isDuplicate) {
        setError(
          `این ${
            itemType === "inventory" ? "انبار" : "مرحله"
          } قبلاً به خط تولید اضافه شده است`
        );
        return;
      }

      let originalItem;
      if (itemType === "step") {
        originalItem = steps.find((s) => s._id === itemId);
      } else if (itemType === "inventory") {
        originalItem = inventories.find((i) => i._id === itemId);
      }

      if (originalItem) {
        // Create a new line item with a unique ID
        const newItem: LineItem = {
          id: `${itemType}-${itemId}-${Date.now()}`,
          originalId: itemId,
          type: itemType,
          name: originalItem.name,
          description: originalItem.description,
          ...(itemType === "inventory" && {
            quantity: (originalItem as InventoryData).Capacity,
          }),
          ...(itemType === "step" && {
            code: (originalItem as Step).code,
          }),
        };

        setLineItems((prev) => [...prev, newItem]);
        setError(null);
      }
    },
    [steps, inventories, lineItems]
  );

  // Handle reordering items within the line area
  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setLineItems((prev) => {
      const newItems = [...prev];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return newItems;
    });
  }, []);

  // Handle removing an item from the line area
  const handleRemove = useCallback((itemId: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  // Handle saving the production line
  const handleSave = async () => {
    if (!lineName.trim()) {
      setError("Production line name is required");
      return;
    }

    if (lineItems.length === 0) {
      setError("Production line must have at least one item");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare the data for the API
      const stepsData = lineItems
        .filter((item) => item.type === "step")
        .map((item, index) => ({
          step: item.originalId,
          sequence: index, // Changed from 'order' to 'sequence' to match model
        }));

      const inventoryId =
        lineItems.find((item) => item.type === "inventory")?.originalId || null;

      const productionLineData = {
        name: lineName,
        code: lineCode,
        description: lineDescription,
        steps: stepsData,
        inventory: inventoryId,
        active: true,
        ...(initialConfig?._id && { _id: initialConfig._id }),
      };

      let success;
      if (initialConfig?._id) {
        success = await updateProductionLine(
          productionLineData as ProductionLine
        );
      } else {
        success = await createProductionLine(
          productionLineData as ProductionLine
        );
      }

      if (success) {
        setSuccess("Production line saved successfully!");
        mutate(); // Refresh the data

        // Call the onSave callback if provided
        if (onSave) {
          onSave(JSON.stringify(productionLineData));
        }
      } else {
        throw new Error("Failed to save production line");
      }
    } catch (err) {
      console.error("Error saving production line:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading || loadingSteps || loadingInventories) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (apiError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p className="font-bold">Error:</p>
        <p>{apiError}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 rounded-xl" dir="rtl">
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-5 font-vazir flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-md">
            <FiSettings className="text-blue-600 text-lg" />
          </div>
          <span>اطلاعات خط تولید</span>
        </h2>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="lineName"
              className="text-sm font-medium text-gray-700 mb-1 font-vazir flex items-center gap-1"
            >
              <FiType className="text-gray-500" />
              <span>نام خط تولید</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lineName"
              value={lineName}
              onChange={(e) => setLineName(e.target.value)}
              placeholder="نام خط تولید را وارد کنید"
              className="w-full p-3 border border-gray-300 rounded-lg font-vazir"
              required
            />
          </div>

          <div>
            <label
              htmlFor="lineCode"
              className="text-sm font-medium text-gray-700 mb-1 font-vazir flex items-center gap-1"
            >
              <FiHash className="text-gray-500" />
              <span>کد</span>
            </label>
            <input
              type="text"
              id="lineCode"
              value={lineCode}
              onChange={(e) => setLineCode(e.target.value)}
              placeholder="کد را وارد کنید (اختیاری)"
              className="w-full p-3 border border-gray-300 rounded-lg font-vazir"
            />
          </div>

          <div>
            <label
              htmlFor="lineDescription"
              className="text-sm font-medium text-gray-700 mb-1 font-vazir flex items-center gap-1"
            >
              <FiFileText className="text-gray-500" />
              <span>توضیحات</span>
            </label>
            <textarea
              id="lineDescription"
              value={lineDescription}
              onChange={(e) => setLineDescription(e.target.value)}
              placeholder="توضیحات را وارد کنید (اختیاری)"
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg font-vazir resize-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div
          className="mb-4 p-4 bg-red-50 border-r-4 border-red-500 text-red-700 rounded-lg shadow-sm flex items-center gap-3"
          dir="rtl"
        >
          <FiAlertCircle className="text-red-500 text-xl flex-shrink-0" />
          <p className="font-vazir">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border-r-4 border-green-500 text-green-700 rounded-lg shadow-sm flex items-center gap-3">
          <FiCheckCircle className="text-green-500 text-xl flex-shrink-0" />
          <p className="font-vazir">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 className="text-lg font-bold mb-4 font-vazir flex items-center gap-2 text-gray-800">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <FiTrello className="text-blue-600 text-lg" />
            </div>
            <span>مراحل موجود</span>
          </h2>
          <div className="bg-white p-5 rounded-xl shadow-sm h-[500px] overflow-y-auto border border-gray-100">
            <div className="space-y-3">
              {steps.map((step) => (
                <DraggableItemSource key={step._id} item={step} type="step" />
              ))}
            </div>
            {steps.length === 0 && (
              <div className="text-gray-500 text-center py-8 border border-dashed border-gray-300 rounded-lg font-vazir bg-gray-50 flex flex-col items-center justify-center gap-2">
                <FiAlertCircle className="text-gray-400 text-2xl" />
                <p className="font-vazir">هیچ مرحله‌ای موجود نیست</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4 font-vazir flex items-center gap-2 text-gray-800">
            <div className="p-1.5 bg-amber-100 rounded-md">
              <FiPackage className="text-amber-600 text-lg" />
            </div>
            <span>موجودی‌های موجود</span>
          </h2>
          <div className="bg-white p-5 rounded-xl shadow-sm h-[500px] overflow-y-auto border border-gray-100">
            <div className="space-y-3">
              {inventories.map((inventory) => (
                <DraggableItemSource
                  key={inventory._id}
                  item={inventory}
                  type="inventory"
                />
              ))}
            </div>
            {inventories.length === 0 && (
              <div className="text-gray-500 text-center py-8 border border-dashed border-gray-300 rounded-lg font-vazir bg-gray-50 flex flex-col items-center justify-center gap-2">
                <FiAlertCircle className="text-gray-400 text-2xl" />
                <p className="font-vazir">هیچ موجودی‌ای موجود نیست</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4 font-vazir flex items-center gap-2 text-gray-800">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <FiLayers className="text-blue-600 text-lg" />
            </div>
            <span>خط تولید</span>
          </h2>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            {/* Drop Area */}
            <DropArea
              lineItems={lineItems}
              onDrop={handleDrop}
              onReorder={handleReorder}
              onRemove={handleRemove}
            />

            <button
              onClick={handleSave}
              disabled={isSaving || !lineName.trim() || lineItems.length === 0}
              className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300 font-vazir flex items-center justify-center gap-2 shadow-sm"
            >
              {isSaving ? (
                <>
                  <span>در حال ذخیره...</span>
                  <FiLoader className="animate-spin" />
                </>
              ) : (
                <>
                  <span>ذخیره پیکربندی</span>
                  <FiSave />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
