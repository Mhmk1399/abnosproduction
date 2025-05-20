"use client";
import React, { useEffect, useState } from "react";
import { useProductionLines } from "@/hooks/useProductionLines";
import {
  FiActivity,
  FiAlertCircle,
  FiBox,
  FiCheckCircle,
  FiClock,
  FiDatabase,
  FiLayers,
  FiPackage,
  FiPower,
  FiSettings,
  FiTool,
  FiTruck,
} from "react-icons/fi";
import { Step } from "@/types/types";

export default function ProductionLineVisualizer() {
  const { productionLines, isLoading, error } = useProductionLines();
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [expandedLines, setExpandedLines] = useState<Record<string, boolean>>(
    {}
  );
  useEffect(() => {
    // If we have production lines and none is selected, select the first one
    if (productionLines.length > 0 && !selectedLine) {
      setSelectedLine(productionLines[0]._id);
      setExpandedLines({ [productionLines[0]._id]: false });
    }
  }, [[productionLines, selectedLine]]);

  const toggleLineExpansion = (lineId: string) => {
    setExpandedLines((prev) => ({
      ...prev,
      [lineId]: !prev[lineId],
    }));
  };

  const selectLine = (lineId: string) => {
    setSelectedLine(lineId);
    setExpandedLines((prev) => ({
      ...prev,
      [lineId]: true,
    }));
  };

  // Get step icon based on type
  const getStepIcon = (type: string) => {
    switch (type) {
      case "production":
        return <FiTool className="text-blue-500" />;
      case "quality":
        return <FiCheckCircle className="text-green-500" />;
      case "packaging":
        return <FiBox className="text-amber-500" />;
      case "shipping":
        return <FiTruck className="text-purple-500" />;
      default:
        return <FiSettings className="text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  if (productionLines.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
        <p className="font-bold">No production lines found</p>
        <p>Create a production line to see it visualized here.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">خطوط تولید</h1>

      {/* Production Lines Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {productionLines.map((line) => (
          <button
            key={line._id}
            onClick={() => selectLine(line._id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedLine === line._id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {line.name}
          </button>
        ))}
      </div>

      {/* Production Lines Visualization */}
      <div className="space-y-8">
        {productionLines.map((line) => (
          <div
            key={line._id}
            className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${
              selectedLine === line._id
                ? "opacity-100 border-2 border-blue-500"
                : "opacity-60"
            }`}
          >
            {/* Production Line Header */}
            <div
              className="bg-blue-500 to-gray-900 text-white p-4 cursor-pointer"
              onClick={() => toggleLineExpansion(line._id)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <FiLayers className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{line.name}</h2>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <span className="font-mono">{line.code}</span>
                      <span>•</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          line.active
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {line.active ? "فعال" : "غیرفعال"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      line.active ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm">
                    {line.active ? "در حال کار" : "متوقف شده"}
                  </span>
                </div>
              </div>
            </div>

            {/* Production Line Details */}
            {expandedLines[line._id] && (
              <div className="p-6">
                {line.description && (
                  <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-gray-700">{line.description}</p>
                  </div>
                )}

                {/* Factory Line Visualization */}
                <div className="relative py-8">
                  {/* Conveyor Belt */}
                  <div className="absolute top-1/2 left-0 right-0 h-4 bg-gray-900 transform -translate-y-1/2 z-0"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-400 transform -translate-y-1/2 z-0"></div>

                  {/* Steps and Inventory */}
                  <div className="relative z-10 flex justify-between items-center">
                    {line.steps && line.steps.length > 0 ? (
                      <>
                        {/* Starting Point */}
                        {/* <div className="flex flex-col items-center">
                          <div className="w-4 h-4  rounded-full bg-gray-700 flex items-center justify-center mb-2 shadow-lg">
                            <FiPower className="text-white text-2xl" />
                          </div>
                          <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm">
                            شروع
                          </span>
                        </div> */}

                        {/* Production Steps */}
                        {line.steps.map((stepItem, index) => {
                          const step = stepItem.step
                            ? (stepItem.step as unknown as Step)
                            : (stepItem as unknown as Step);
                          return (
                            <div
                              key={index}
                              className="flex flex-col items-center mx-4"
                            >
                              <div className="relative">
                                <div className="w-20 h-20 rounded-lg bg-white border-2 border-blue-500 flex items-center justify-center mb-2 shadow-lg">
                                  {getStepIcon(step.type)}
                                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                                    {index + 1}
                                  </div>
                                </div>
                              </div>
                              <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-md max-w-[150px]">
                                <h3 className="font-bold text-gray-800 text-center">
                                  {step.name}
                                </h3>
                                {step.requiresScan && (
                                  <div className="flex items-center justify-center gap-1 text-xs text-blue-600 mt-1">
                                    <FiActivity className="text-blue-500" />
                                    <span>نیاز به اسکن</span>
                                  </div>
                                )}
                                {step.handlesTreatments &&
                                  step.handlesTreatments.length > 0 && (
                                    <div className="flex items-center justify-center gap-1 text-xs text-green-600 mt-1">
                                      <FiSettings className="text-green-500" />
                                      <span>
                                        {step.handlesTreatments.length} خدمات
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Inventory (if exists) */}
                        {line.inventory && (
                          <div className="flex flex-col items-center mx-4">
                            <div className="w-20 h-20 rounded-lg bg-amber-100 border-2 border-amber-500 flex items-center justify-center mb-2 shadow-lg">
                              <FiDatabase className="text-amber-600 text-2xl" />
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-md max-w-[150px]">
                              <h3 className="font-bold text-gray-800 text-center">
                                {typeof line.inventory === "object"
                                  ? line.inventory.name
                                  : "انبار"}
                              </h3>
                              <div className="flex items-center justify-center gap-1 text-xs text-amber-600 mt-1">
                                <FiPackage className="text-amber-500" />
                                <span>انبار نهایی</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* End Point */}
                        {/* <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mb-2 shadow-lg">
                            <FiCheckCircle className="text-white text-2xl" />
                          </div>
                          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                            پایان
                          </span>
                        </div> */}
                      </>
                    ) : (
                      <div className="w-full py-10 flex items-center justify-center">
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg flex items-center gap-2">
                          <FiAlertCircle className="text-yellow-500" />
                          <span>
                            هیچ مرحله‌ای برای این خط تولید تعریف نشده است
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Production Line Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <FiClock className="text-blue-500" />
                      <h3 className="font-bold text-blue-800">زمان تولید</h3>
                    </div>
                    <p className="text-blue-600 mt-2">
                      {line.steps?.length || 0} مرحله • تخمین زمان:{" "}
                      {(line.steps?.length || 0) * 15} دقیقه
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <FiActivity className="text-green-500" />
                      <h3 className="font-bold text-green-800">وضعیت فعلی</h3>
                    </div>
                    <p className="text-green-600 mt-2">
                      {line.active ? "در حال کار" : "متوقف شده"} • آخرین
                      بروزرسانی: امروز
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <FiBox className="text-purple-500" />
                      <h3 className="font-bold text-purple-800">محصولات</h3>
                    </div>
                    <p className="text-purple-600 mt-2">
                      ظرفیت روزانه: {Math.floor(Math.random() * 100) + 50} واحد
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
