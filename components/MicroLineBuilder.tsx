"use client";
import { useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import LineArea from "./LineArea";
import StepItem from "./StepItem";
import { useSteps } from "../hooks/useSteps";
import { useInventories } from "../hooks/useInventories";
import { v4 as uuidv4 } from "uuid";
import { LineItem } from "./types/production";
import {
  FiTag,
  FiFileText,
  FiPackage,
  FiList,
  FiLayers,
  FiSave,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";

interface MicroLineBuilderProps {
  initialConfig?: any;
  onSave?: (config: any) => void;
}

export default function MicroLineBuilder({
  initialConfig,
  onSave,
}: MicroLineBuilderProps) {
  // Use our custom hooks to fetch steps and inventories
  const { steps, isLoading: stepsLoading, error: stepsError } = useSteps();
  const {
    inventories,
    isLoading: inventoriesLoading,
    error: inventoriesError,
  } = useInventories();

  // State for the micro line being built
  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialConfig?.steps
      ? initialConfig.steps
          .map((stepConfig: any) => {
            const step =
              typeof stepConfig.step === "object"
                ? stepConfig.step
                : steps.find((s) => s._id === stepConfig.step);

            if (!step) return null;

            return {
              id: uuidv4(),
              originalId: step._id,
              name: step.name,
              type: "step",
              description: step.description,
            };
          })
          .filter(Boolean)
      : []
  );

  const [lineName, setLineName] = useState(initialConfig?.name || "");
  const [lineDescription, setLineDescription] = useState(
    initialConfig?.description || ""
  );
  const [selectedInventory, setSelectedInventory] = useState(
    initialConfig?.inventory || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle dropping a new item into the line area
  const handleDrop = useCallback(
    (itemId: string, itemType: "microLine" | "inventory" | "step") => {
      // Find the original item
      const originalItem = steps.find((s) => s._id === itemId);

      if (originalItem) {
        // Create a new line item with a unique ID
        const newItem: LineItem = {
          id: uuidv4(),
          originalId: originalItem._id,
          name: originalItem.name,
          type: itemType,
          description: originalItem.description,
        };

        setLineItems((prev) => [...prev, newItem]);
      }
    },
    [steps]
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

  // Handle saving the micro line
  const handleSave = async () => {
    if (!lineName.trim()) {
      setError("نام میکرو لاین اجباری است");
      return;
    }

    if (lineItems.length === 0) {
      setError("میکرو لاین حداقل بتید یک لاین داشته باشد");
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
          order: index,
        }));

      const microLineData = {
        name: lineName,
        description: lineDescription,
        inventory: selectedInventory,
        steps: stepsData,
        ...(initialConfig?._id && { _id: initialConfig._id }),
      };

      // Send the data to the API
      const url = "/api/microLine";
      const method = initialConfig?._id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(microLineData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در ساخت ");
      }

      const savedLine = await response.json();

      setSuccess("میکرو لاین ساخته شد ");

      // Call the onSave callback if provided
      if (onSave) {
        onSave(savedLine);
      }
    } catch (err) {
      console.error("Error saving micro line:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  const isLoading = stepsLoading || inventoriesLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (stepsError || inventoriesError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p className="font-bold">Error:</p>
        <p>{stepsError || inventoriesError}</p>
      </div>
    );
  }
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-center">
            <FiAlertCircle className="mr-2" size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded flex items-center">
            <FiCheckCircle className="ml-2" size={18} />
            {success}
          </div>
        )}

        <div className="mb-6 space-y-4">
          <div>
            <label
              htmlFor="lineName"
              className=" text-sm font-medium text-gray-700 mb-1 flex items-center"
            >
              <FiTag className="ml-1" size={16} />
              <span>نام میکرو لاین*</span>
            </label>
            <input
              type="text"
              id="lineName"
              value={lineName}
              onChange={(e) => setLineName(e.target.value)}
              placeholder="نام میکرو لاین را وارد کنید"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="lineDescription"
              className=" text-sm font-medium text-gray-700 mb-1 flex items-center"
            >
              <FiFileText className="ml-1" size={16} />
              <span>توضیحات</span>
            </label>
            <textarea
              id="lineDescription"
              value={lineDescription}
              onChange={(e) => setLineDescription(e.target.value)}
              placeholder="توضیحات را وارد کنید (اختیاری)"
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="inventory"
              className=" text-sm font-medium text-gray-700 mb-1 flex items-center"
            >
              <FiPackage className="ml-1" size={16} />
              <span>انبار</span>
            </label>
            <select
              id="inventory"
              value={selectedInventory}
              onChange={(e) => setSelectedInventory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">انتخاب انبار (اختیاری)</option>
              {inventories
                .filter((inventory) => inventory.type === "holding")
                .map((inventory) => (
                  <option key={inventory._id} value={inventory._id}>
                    {inventory.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FiList className="ml-2" size={20} />
              <span>مراحل موجود</span>
            </h2>
            <div className="bg-white p-4 rounded-lg shadow-md h-[500px] overflow-y-auto">
              <div className="space-y-2">
                {steps.map((step) => (
                  <StepItem
                    key={step._id}
                    step={{
                      id: step._id,
                      name: step.name,
                      description: step.description,
                    }}
                    isInLine={false}
                  />
                ))}
              </div>
              {steps.length === 0 && (
                <p className="text-gray-500 text-center py-4 flex flex-col items-center">
                  <FiInfo size={24} className="mb-2" />
                  <span>هیچ مرحله‌ای موجود نیست</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FiLayers className="ml-2" size={20} />
              <span>میکرو لاین</span>
            </h2>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <LineArea
                items={lineItems}
                onDrop={handleDrop}
                onReorder={handleReorder}
                onRemove={handleRemove}
              />

              <button
                onClick={handleSave}
                disabled={
                  isSaving || !lineName.trim() || lineItems.length === 0
                }
                className="mt-4 w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSaving ? (
                  <>
                    <FiLoader className="animate-spin ml-2" size={18} />
                    <span>در حال ذخیره...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="ml-2" size={18} />
                    <span>ذخیره میکرو لاین</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
