"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useProductLayers } from "@/hooks/useProductLayers";
import { useProductionLines } from "@/hooks/useProductionLines";
import ProductionQueue from "../ProductionLine/ProductionQueue";
import {
  FiRefreshCw,
  FiCheckSquare,
  FiArrowRight,
  FiFileText,
  FiChevronLeft,
  FiList,
  FiClock,
  FiActivity,
  FiLayers,
  FiInfo,
  FiCalendar,
  FiTarget,
  FiBarChart2,
  FiAlertCircle,
  FiCheckCircle,
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
      alert("لطفا حداقل یک لایه را انتخاب کنید");
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
              error: "هیچ خط تولیدی به لایه اختصاص داده نشده است",
            };
          }

          // Get the first step of the production line
          const firstStepId = getFirstStep(productionLineId);
          if (!firstStepId) {
            return {
              layerId,
              success: false,
              error: "هیچ مرحله ای در خط تولید یافت نشد",
            };
          }

          // Update the layer with the first step
          const success = await updateProductLayer({
            _id: layerId,
            currentStep: firstStepId,
          });

          if (!success) {
            return { layerId, success: false, error: "لایه به روز نشد" };
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
              console.log(
                "Failed to create step execution record for layer",
                layerId
              );
              // Continue anyway since the layer was updated successfully
            }
          } catch (err) {
            console.log(
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
      console.log("Error in batch assignment:", err);
      alert("در حین تخصیص دسته ای خطایی رخ داد");
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
        alert("هیچ مرحله ای در خط تولید انتخاب شده یافت نشد");
        return false;
      }

      // Update the layer with the production line and first step
      const success = await updateProductLayer({
        _id: layerId,
        productionLine: selectedProductionLine,
        currentStep: firstStepId,
      });

      if (!success) {
        alert("تخصیص لایه به خط تولید ناموفق بود");
        return false;
      }

      // Redirect to test page (you can change this URL as needed)
      router.push(`/test?layerId=${layerId}`);

      // Refresh the data
      await mutate();
      return true;
    } catch (err) {
      console.log("Error assigning to production line:", err);
      return false;
    } finally {
      setProcessingLayers((prev) => prev.filter((id) => id !== layerId));
    }
  };

  const handleGenerateTrfFile = async () => {
    if (selectedLayers.length === 0) {
      alert("لطفا حداقل یک لایه را انتخاب کنید");
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
      alert(`فایل TRF با موفقیت تولید شد: ${result.fileName}`);

      // Provide download link
      window.open(result.downloadUrl, "_blank");
    } catch (err) {
      console.log("Error generating TRF file:", err);
      alert("فایل TRF تولید نشد");
    }
  };

  if (isLoading)
    return <div className="p-8 text-center">در حال بارگذاری ...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-5 md:p-6 mt-20">
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
          <span className="bg-blue-500 text-white p-1.5 rounded-md">
            <FiLayers size={20} />
          </span>
          مدیریت تولید
        </h1>

        {/* Tabs */}
        <div className="mb-8 flex border-b">
          <button
            onClick={() => setActiveTab("unassigned")}
            className={`px-5 py-3 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
              activeTab === "unassigned"
                ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FiList className="inline" size={18} />
            لایه‌های تخصیص نیافته
          </button>
          <button
            onClick={() => setActiveTab("queue")}
            className={`px-5 py-3 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
              activeTab === "queue"
                ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FiActivity className="inline" size={18} />
            صف تولید
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-5 py-3 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
              activeTab === "history"
                ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            } ${!selectedLayerForHistory ? "opacity-60" : ""}`}
            disabled={!selectedLayerForHistory}
          >
            <FiClock className="inline" size={18} />
            تاریخچه تولید
          </button>
        </div>

        {/* Unassigned Layers Tab */}
        {activeTab === "unassigned" && (
          <>
            <div className="mb-6 flex flex-wrap justify-between items-center gap-4 bg-gray-50 p-5 rounded-lg border border-gray-100">
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                  <span className="bg-yellow-100 text-yellow-700 p-1.5 rounded-md">
                    <FiLayers size={16} />
                  </span>
                  لایه‌های تخصیص نیافته:
                  <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-full text-sm">
                    {unassignedLayers.length}
                  </span>
                </span>
                {unassignedLayers.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="mr-4 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-md text-sm transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <FiCheckSquare
                      className={
                        selectedLayers.length === unassignedLayers.length
                          ? "text-blue-500"
                          : "text-gray-500"
                      }
                    />
                    {selectedLayers.length === unassignedLayers.length
                      ? "لغو انتخاب همه"
                      : "انتخاب همه"}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {selectedLayers.length > 0 && (
                  <>
                    <select
                      value={selectedProductionLine || ""}
                      onChange={(e) =>
                        setSelectedProductionLine(e.target.value)
                      }
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-sm"
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
                      className={`px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm text-sm font-medium transition-all duration-200 ${
                        processingLayers.length > 0 || !selectedProductionLine
                          ? "bg-gray-200 cursor-not-allowed text-gray-500"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      {processingLayers.length > 0 ? (
                        <>
                          <span className="inline-block h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                          <span>در حال پردازش...</span>
                        </>
                      ) : (
                        <>
                          <FiArrowRight className="inline" />
                          <span>تخصیص به خط تولید</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleGenerateTrfFile}
                      className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm text-sm font-medium"
                    >
                      <FiFileText className="inline" />
                      <span>ایجاد فایل TRF</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => mutate()}
                  className="flex items-center px-4 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-200 shadow-sm text-sm font-medium gap-2"
                >
                  <FiRefreshCw className="inline" />
                  <span>بروزرسانی</span>
                </button>
              </div>
            </div>

            {unassignedLayers.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-lg text-center shadow-sm">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
                  <FiInfo className="text-yellow-600" size={24} />
                </div>
                <p className="text-yellow-700 text-lg font-medium mb-2">
                  در حال حاضر هیچ لایه‌ای نیاز به تخصیص ندارد
                </p>
                <p className="text-yellow-600 text-sm">
                  لایه‌های جدید پس از ایجاد در این بخش نمایش داده می‌شوند
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ردیف
                        </th>
                        <th className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          انتخاب
                        </th>
                        <th className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          کد
                        </th>
                        <th className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          کد تولید
                        </th>
                        <th className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          مشتری
                        </th>
                        <th className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ابعاد
                        </th>
                        <th className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          تاریخ تولید
                        </th>
                        <th className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          عملیات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {unassignedLayers.map((layer, index) => (
                        <tr
                          key={layer._id}
                          className={`hover:bg-gray-50 transition-colors ${
                            selectedLayers.includes(layer._id)
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                            {index + 1}
                          </td>
                          <td className="py-4 px-4">
                            <input
                              type="checkbox"
                              checked={selectedLayers.includes(layer._id)}
                              onChange={() => handleSelectLayer(layer._id)}
                              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                              disabled={processingLayers.includes(layer._id)}
                            />
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                            {layer.code}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {layer.productionCode}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {typeof layer.customer === "object"
                              ? layer.customer?.name
                              : "نامشخص"}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap">
                            <span className="bg-gray-100 px-2 py-1 rounded-md">
                              {layer.width} × {layer.height}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            <div className="flex items-center gap-1.5">
                              <FiCalendar className="text-gray-400" size={14} />
                              {new Date(
                                layer.productionDate
                              ).toLocaleDateString("fa-IR")}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedLayerForHistory(layer._id);
                                  setActiveTab("history");
                                }}
                                className="text-blue-500 hover:text-blue-700 py-1.5 px-3 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5 border border-blue-100"
                              >
                                <FiClock className="inline" size={14} />
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
                                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md transition-colors border ${
                                  processingLayers.includes(layer._id) ||
                                  !selectedProductionLine
                                    ? "text-gray-400 cursor-not-allowed bg-gray-50 border-gray-200"
                                    : "text-green-600 hover:text-green-700 hover:bg-green-50 border-green-100"
                                }`}
                              >
                                {processingLayers.includes(layer._id) ? (
                                  <>
                                    <span className="inline-block h-3 w-3 border-2 border-t-transparent border-gray-400 rounded-full animate-spin mr-1"></span>
                                    <span>در حال پردازش...</span>
                                  </>
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
        {/* Production Line Selection (for Queue and History tabs) */}
        {activeTab !== "unassigned" && (
          <div className=" bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-center gap-4">
              <div className="font-medium text-gray-700 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 p-1.5 rounded-md">
                  <FiTarget size={16} />
                </span>
                انتخاب خط تولید:
              </div>
              <div className="flex flex-wrap gap-2">
                {productionLines.map((line) => (
                  <button
                    key={line._id}
                    onClick={() => setSelectedProductionLine(line._id)}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                      selectedProductionLine === line._id
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                    }`}
                  >
                    {line.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Production Queue Tab */}
        {activeTab === "queue" && selectedProductionLine && (
          <div className="mt-4">
            <ProductionQueue productionLineId={selectedProductionLine} />
          </div>
        )}

        {/* Production Statistics */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-md">
              <FiBarChart2 size={18} />
            </span>
            آمار تولید
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Unassigned Layers */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-yellow-500 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-800">
                  تخصیص نیافته
                </h3>
                <span className="bg-yellow-100 p-2 rounded-full">
                  <FiAlertCircle className="text-yellow-500" size={20} />
                </span>
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {unassignedLayers.length}
              </div>
              <div className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                <FiInfo size={14} />
                لایه‌هایی که هنوز به خط تولید تخصیص داده نشده‌اند
              </div>
            </div>

            {/* In Production */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-500 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-800">
                  در حال تولید
                </h3>
                <span className="bg-blue-100 p-2 rounded-full">
                  <FiActivity className="text-blue-500" size={20} />
                </span>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {
                  layers.filter(
                    (layer) =>
                      layer.currentStep !== null &&
                      layer.currentStep !== undefined
                  ).length
                }
              </div>
              <div className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                <FiInfo size={14} />
                لایه‌هایی که در مراحل مختلف تولید هستند
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-green-500 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-800">تکمیل شده</h3>
                <span className="bg-green-100 p-2 rounded-full">
                  <FiCheckCircle className="text-green-500" size={20} />
                </span>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
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
              <div className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                <FiInfo size={14} />
                لایه‌هایی که تمام مراحل تولید را تکمیل کرده‌اند
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
