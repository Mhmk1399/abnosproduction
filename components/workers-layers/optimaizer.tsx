"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useProductLayers } from "@/hooks/useProductLayers";
import { useProductionLines } from "@/hooks/useProductionLines";
import ProductionQueue from "../ProductionLine/ProductionQueue";
import ProductionHistory from "../ProductionLine/ProductionHistory";
import {
  FiRefreshCw,
  FiCheckSquare,
  FiArrowRight,
  FiFileText,
  FiChevronLeft,
  FiList,
  FiClock,
  FiActivity,
} from "react-icons/fi";
import { Step } from "@/types/types";

export default function OptimizerPage() {
  const router = useRouter();

  const { layers, isLoading, error, mutate, updateProductLayer } =
    useProductLayers();
  const { productionLines } = useProductionLines();
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [processingLayers, setProcessingLayers] = useState<string[]>([]);
  const [selectedProductionLine, setSelectedProductionLine] = useState<
    string | null
  >(null);
  const [selectedLayerForHistory, setSelectedLayerForHistory] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState<
    "unassigned" | "queue" | "history"
  >("unassigned");

  // Filter layers that need assignment (current step is null)
  const unassignedLayers = useMemo(() => {
    return layers
      .filter((layer) => {
        return layer.currentStep === null || layer.currentStep === undefined;
      })
      .sort((a, b) => {
        // Sort by production date (earlier dates first)
        return (
          new Date(a.productionDate).getTime() -
          new Date(b.productionDate).getTime()
        );
      });
  }, [layers]);

  // Set default production line if available
  useEffect(() => {
    if (productionLines.length > 0 && !selectedProductionLine) {
      setSelectedProductionLine(productionLines[0]._id);
    }
  }, [productionLines]);

  // Clear selection when available layers change
  useEffect(() => {
    setSelectedLayers([]);
  }, [unassignedLayers.length]);

  const handleSelectLayer = (id: string) => {
    setSelectedLayers((prev) => {
      if (prev.includes(id)) {
        return prev.filter((layerId) => layerId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleAssignSelectedToProductionLine = async () => {
    if (selectedLayers.length === 0) {
      alert("Please select at least one layer");
      return;
    }

    setProcessingLayers(selectedLayers);
    try {
      // Process each selected layer
      const results = await Promise.all(
        selectedLayers.map(async (layerId) => {
          // Get the layer data
          const layer = unassignedLayers.find((l) => l._id === layerId);
          if (!layer)
            return { layerId, success: false, error: "Layer not found" };

          // Get the production line for this layer
          const productionLineId =
            typeof layer.productionLine === "object"
              ? layer.productionLine._id
              : layer.productionLine;

          if (!productionLineId) {
            return {
              layerId,
              success: false,
              error: "No production line assigned to layer",
            };
          }

          // Get the first step of the production line
          const firstStepId = getFirstStep(productionLineId);
          if (!firstStepId) {
            return {
              layerId,
              success: false,
              error: "No steps found in the production line",
            };
          }

          // Update the layer with the first step
          const success = await updateProductLayer({
            _id: layerId,
            currentStep: firstStepId,
          });

          if (!success) {
            return { layerId, success: false, error: "Failed to update layer" };
          }

          // Create the step execution record
          try {
            const response = await fetch("/api/stepExecution", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                layer: layerId,
                step: firstStepId,
                productionLine: productionLineId,
                scannedAt: new Date().toISOString(),
                passed: false, // Initially not passed since it's just starting
                notes: "Assigned to production step via optimizer",
              }),
            });

            if (!response.ok) {
              console.error(
                "Failed to create step execution record for layer",
                layerId
              );
              // Continue anyway since the layer was updated successfully
            }
          } catch (err) {
            console.error(
              "Error creating step execution for layer",
              layerId,
              err
            );
            // Continue anyway since the layer was updated successfully
          }

          return { layerId, success: true };
        })
      );

      const failures = results.filter((r) => !r.success);

      if (failures.length > 0) {
        alert(
          `Failed to assign ${
            failures.length
          } layers to production steps: ${failures
            .map((f) => f.error)
            .join(", ")}`
        );
      } else {
        // Clear selection after successful assignment
        setSelectedLayers([]);
      }

      // Refresh the data
      await mutate();
    } catch (err) {
      console.error("Error in batch assignment:", err);
      alert("An error occurred during batch assignment");
    } finally {
      setProcessingLayers([]);
    }
  };

  const handleSelectAll = () => {
    if (selectedLayers.length === unassignedLayers.length) {
      // Deselect all
      setSelectedLayers([]);
    } else {
      // Select all
      setSelectedLayers(unassignedLayers.map((layer) => layer._id));
    }
  };

  const getFirstStep = (productionLineId: string) => {
    const productionLine = productionLines.find(
      (line) => line._id === productionLineId
    );
    if (
      !productionLine ||
      !productionLine.steps ||
      productionLine.steps.length === 0
    ) {
      return null;
    }

    const firstStep = productionLine.steps[0];
    // Fix the type checking to handle both object and string/array cases
    if (Array.isArray(firstStep.step)) {
      // If it's an array, take the first Step object
      const stepObj = firstStep.step[0];
      return typeof stepObj === "object" && stepObj !== null
        ? stepObj._id
        : stepObj;
    }
    return typeof firstStep.step === "object" && firstStep.step !== null
      ? (firstStep.step as Step)._id
      : (firstStep.step as string);
  };

  const handleAssignToProductionLine = async (layerId: string) => {
    if (!selectedProductionLine) {
      alert("Please select a production line first");
      return false;
    }

    setProcessingLayers((prev) => [...prev, layerId]);
    try {
      // Get the first step of the selected production line
      const firstStepId = getFirstStep(selectedProductionLine);
      if (!firstStepId) {
        alert("No steps found in the selected production line");
        return false;
      }

      // Update the layer with the production line and first step
      const success = await updateProductLayer({
        _id: layerId,
        productionLine: selectedProductionLine,
        currentStep: firstStepId,
      });

      if (!success) {
        alert("Failed to assign layer to production line");
        return false;
      }

      // Redirect to test page (you can change this URL as needed)
      router.push(`/test?layerId=${layerId}`);

      // Refresh the data
      await mutate();
      return true;
    } catch (err) {
      console.error("Error assigning to production line:", err);
      return false;
    } finally {
      setProcessingLayers((prev) => prev.filter((id) => id !== layerId));
    }
  };

  const handleGenerateTrfFile = async () => {
    if (selectedLayers.length === 0) {
      alert("Please select at least one layer");
      return;
    }

    try {
      const selectedLayersData = unassignedLayers.filter((layer) =>
        selectedLayers.includes(layer._id)
      );

      const response = await fetch("/api/trfGenrator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedLayers: selectedLayersData }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate TRF file");
      }

      const result = await response.json();
      alert(`TRF file generated successfully: ${result.fileName}`);

      // Provide download link
      window.open(result.downloadUrl, "_blank");
    } catch (err) {
      console.error("Error generating TRF file:", err);
      alert("Failed to generate TRF file");
    }
  };

  if (isLoading)
    return <div className="p-8 text-center">در حال بارگذاری ...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 md:p-6 mt-20">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">مدیریت تولید</h1>

      {/* Tabs */}
      <div className="mb-6 flex border-b">
        <button
          onClick={() => setActiveTab("unassigned")}
          className={`px-4 py-2 font-medium ${
            activeTab === "unassigned"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FiList className="inline mr-1" />
          لایه‌های تخصیص نیافته
        </button>
        <button
          onClick={() => setActiveTab("queue")}
          className={`px-4 py-2 font-medium ${
            activeTab === "queue"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FiActivity className="inline mr-1" />
          صف تولید
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium ${
            activeTab === "history"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          disabled={!selectedLayerForHistory}
        >
          <FiClock className="inline mr-1" />
          تاریخچه تولید
        </button>
      </div>

      {/* Unassigned Layers Tab */}
      {activeTab === "unassigned" && (
        <>
          <div className="mb-6 flex flex-wrap justify-between items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <span className="font-semibold text-gray-700">
                لایه‌های تخصیص نیافته: {unassignedLayers.length}
              </span>
              {unassignedLayers.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="mr-4 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm transition-colors flex items-center gap-1"
                >
                  <FiCheckSquare className="inline" />
                  {selectedLayers.length === unassignedLayers.length
                    ? "لغو انتخاب همه"
                    : "انتخاب همه"}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedLayers.length > 0 && (
                <>
                  <select
                    value={selectedProductionLine || ""}
                    onChange={(e) => setSelectedProductionLine(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="">انتخاب خط تولید</option>
                    {productionLines.map((line) => (
                      <option key={line._id} value={line._id}>
                        {line.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignSelectedToProductionLine}
                    disabled={
                      processingLayers.length > 0 || !selectedProductionLine
                    }
                    className={`px-4 py-2 rounded-md flex items-center gap-1.5 ${
                      processingLayers.length > 0 || !selectedProductionLine
                        ? "bg-gray-300 cursor-not-allowed text-gray-600"
                        : "bg-green-500 hover:bg-green-600 text-white transition-colors"
                    }`}
                  >
                    {processingLayers.length > 0 ? (
                      "در حال پردازش..."
                    ) : (
                      <>
                        <FiArrowRight className="inline" />
                        <span>تخصیص به خط تولید</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleGenerateTrfFile}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors flex items-center gap-1.5"
                  >
                    <FiFileText className="inline" />
                    <span>ایجاد فایل TRF</span>
                  </button>
                </>
              )}
              <button
                onClick={() => mutate()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-1.5"
              >
                <FiRefreshCw className="inline" />
                <span>بروزرسانی</span>
              </button>
            </div>
          </div>

          {unassignedLayers.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
              <p className="text-yellow-700 text-lg">
                در حال حاضر هیچ لایه‌ای نیاز به تخصیص ندارد.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ردیف
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        انتخاب
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        کد
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        کد تولید
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        مشتری
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ابعاد
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاریخ تولید
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {unassignedLayers.map((layer, index) => (
                      <tr
                        key={layer._id}
                        className={`border-b hover:bg-gray-50 transition-colors ${
                          selectedLayers.includes(layer._id) ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedLayers.includes(layer._id)}
                            onChange={() => handleSelectLayer(layer._id)}
                            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            disabled={processingLayers.includes(layer._id)}
                          />
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {layer.code}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {layer.productionCode}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {typeof layer.customer === "object"
                            ? layer.customer?.name
                            : "نامشخص"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 whitespace-nowrap">
                          {layer.width} × {layer.height}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {new Date(layer.productionDate).toLocaleDateString(
                            "fa-IR"
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedLayerForHistory(layer._id);
                                setActiveTab("history");
                              }}
                              className="text-blue-500 hover:text-blue-700 py-1 px-2 rounded-md hover:bg-blue-50 transition-colors"
                            >
                              <FiClock className="inline mr-1" />
                              تاریخچه
                            </button>
                            <button
                              onClick={() =>
                                handleAssignToProductionLine(layer._id)
                              }
                              disabled={
                                processingLayers.includes(layer._id) ||
                                !selectedProductionLine
                              }
                              className={`${
                                processingLayers.includes(layer._id) ||
                                !selectedProductionLine
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-green-500 hover:text-green-700"
                              } flex items-center gap-1 py-1 px-2 rounded-md hover:bg-green-50 transition-colors`}
                            >
                              {processingLayers.includes(layer._id) ? (
                                "در حال پردازش..."
                              ) : (
                                <>
                                  <span>تخصیص به خط تولید</span>
                                  <FiChevronLeft className="inline" />
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Production Queue Tab */}
      {activeTab === "queue" && selectedProductionLine && (
        <div className="mt-4">
          <ProductionQueue productionLineId={selectedProductionLine} />
        </div>
      )}

   
    

      {/* Production Line Selection (for Queue and History tabs) */}
      {activeTab !== "unassigned" && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="font-medium text-gray-700">انتخاب خط تولید:</div>
            <div className="flex flex-wrap gap-2">
              {productionLines.map((line) => (
                <button
                  key={line._id}
                  onClick={() => setSelectedProductionLine(line._id)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    selectedProductionLine === line._id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {line.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Production Statistics */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4 text-gray-800">آمار تولید</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Unassigned Layers */}
          <div className="bg-white rounded-lg shadow-sm p-4 border-t-4 border-yellow-500">
            <h3 className="font-bold text-lg mb-2">تخصیص نیافته</h3>
            <div className="text-3xl font-bold text-yellow-600">
              {unassignedLayers.length}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              لایه‌هایی که هنوز به خط تولید تخصیص داده نشده‌اند
            </div>
          </div>

          {/* In Production */}
          <div className="bg-white rounded-lg shadow-sm p-4 border-t-4 border-blue-500">
            <h3 className="font-bold text-lg mb-2">در حال تولید</h3>
            <div className="text-3xl font-bold text-blue-600">
              {
                layers.filter(
                  (layer) =>
                    layer.currentStep !== null &&
                    layer.currentStep !== undefined
                ).length
              }
            </div>
            <div className="text-sm text-gray-500 mt-2">
              لایه‌هایی که در مراحل مختلف تولید هستند
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-lg shadow-sm p-4 border-t-4 border-green-500">
            <h3 className="font-bold text-lg mb-2">تکمیل شده</h3>
            <div className="text-3xl font-bold text-green-600">
              {
                layers.filter((layer) => {
                  // Get the production line
                  const productionLine =
                    typeof layer.productionLine === "object"
                      ? layer.productionLine
                      : null;

                  if (
                    !productionLine ||
                    !productionLine.steps ||
                    productionLine.steps.length === 0
                  )
                    return false;

                  // Check if currentStep exists before trying to access it
                  if (!layer.currentStep) return false;

                  // Get the current step index
                  const currentStepId =
                    typeof layer.currentStep === "object"
                      ? layer.currentStep._id
                      : layer.currentStep;

                  // Layer is completed if it's at the last step
                  const currentStepIndex = productionLine.steps.findIndex(
                    (s) => {
                      const stepId =
                        typeof s.step === "object" && s.step !== null
                          ? (s.step as unknown as Step)._id
                          : (s.step as string);
                      return stepId === currentStepId;
                    }
                  );

                  // Layer is completed if it's at the last step
                  return currentStepIndex === productionLine.steps.length - 1;
                }).length
              }
            </div>
            <div className="text-sm text-gray-500 mt-2">
              لایه‌هایی که تمام مراحل تولید را تکمیل کرده‌اند
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
