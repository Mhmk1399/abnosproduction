"use client";

import { useState } from "react";
import { useOptimizationLayers } from "@/hooks/useOptimizationLayers";
import {
  FiRefreshCw,
  FiCheckSquare,
  FiArrowRight,
  FiFileText,
  FiChevronLeft,
} from "react-icons/fi";

export default function OptimizerPage() {
  const {
    productLayers,
    loading,
    error,
    refreshLayers,
    moveToNextStep,
    moveMultipleToNextStep,
  } = useOptimizationLayers();

  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [processingLayers, setProcessingLayers] = useState<string[]>([]);

  const handleSelectLayer = (id: string) => {
    setSelectedLayers((prev) => {
      if (prev.includes(id)) {
        return prev.filter((layerId) => layerId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedLayers.length === productLayers.length) {
      // Deselect all
      setSelectedLayers([]);
    } else {
      // Select all
      setSelectedLayers(productLayers.map((layer) => layer._id));
    }
  };

  const handleMoveToNextStep = async (layerId: string) => {
    setProcessingLayers((prev) => [...prev, layerId]);
    try {
      const success = await moveToNextStep(layerId);
      if (!success) {
        alert("Failed to move layer to next step");
      }
    } finally {
      setProcessingLayers((prev) => prev.filter((id) => id !== layerId));
    }
  };

  const handleMoveSelectedToNextStep = async () => {
    if (selectedLayers.length === 0) {
      alert("Please select at least one layer");
      return;
    }

    setProcessingLayers(selectedLayers);
    try {
      const results = await moveMultipleToNextStep(selectedLayers);
      const failures = results.filter((r) => !r.success);

      if (failures.length > 0) {
        alert(`Failed to move ${failures.length} layers to next step`);
      } else {
        // Clear selection after successful move
        setSelectedLayers([]);
      }
    } finally {
      setProcessingLayers([]);
    }
  };

  const handleGenerateTrfFile = async () => {
    if (selectedLayers.length === 0) {
      alert("Please select at least one layer");
      return;
    }

    try {
      const selectedLayersData = productLayers.filter((layer) =>
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

  if (loading)
    return <div className="p-8 text-center">در حال بارگذاری ...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 md:p-6 mt-20">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">بهینه‌سازی</h1>

      <div className="mb-6 flex flex-wrap justify-between items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <span className="font-semibold text-gray-700">
            لایه‌های نیازمند بهینه‌سازی: {productLayers.length}
          </span>
          {productLayers.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="mr-4 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm transition-colors flex items-center gap-1"
            >
              <FiCheckSquare className="inline" />
              {selectedLayers.length === productLayers.length
                ? "لغو انتخاب همه"
                : "انتخاب همه"}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedLayers.length > 0 && (
            <>
              <button
                onClick={handleMoveSelectedToNextStep}
                disabled={processingLayers.length > 0}
                className={`px-4 py-2 rounded-md flex items-center gap-1.5 ${
                  processingLayers.length > 0
                    ? "bg-gray-300 cursor-not-allowed text-gray-600"
                    : "bg-green-500 hover:bg-green-600 text-white transition-colors"
                }`}
              >
                {processingLayers.length > 0 ? (
                  "در حال پردازش..."
                ) : (
                  <>
                    <FiArrowRight className="inline" />
                    <span>انتقال به مرحله بعد</span>
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
            onClick={refreshLayers}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-1.5"
          >
            <FiRefreshCw className="inline" />
            <span>بروزرسانی</span>
          </button>
        </div>
      </div>

      {productLayers.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
          <p className="text-yellow-700 text-lg">
            در حال حاضر هیچ لایه‌ای نیاز به بهینه‌سازی ندارد.
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
                    مرحله فعلی
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productLayers.map((layer, index) => (
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
                      {layer.customer?.name || "نامشخص"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 whitespace-nowrap">
                      {layer.width} × {layer.height}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(layer.productionDate).toLocaleDateString(
                        "fa-IR"
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {layer.currentStep?.name || "نامشخص"}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleMoveToNextStep(layer._id)}
                        disabled={processingLayers.includes(layer._id)}
                        className={`${
                          processingLayers.includes(layer._id)
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-green-500 hover:text-green-700"
                        } flex items-center gap-1 py-1 px-2 rounded-md hover:bg-green-50 transition-colors`}
                      >
                        {processingLayers.includes(layer._id) ? (
                          "در حال پردازش..."
                        ) : (
                          <>
                            <span>انتقال به مرحله بعد</span>
                            <FiChevronLeft className="inline" />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
