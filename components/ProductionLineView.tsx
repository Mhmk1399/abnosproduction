"use client";
import { useState, useEffect, useMemo } from "react";
import { useProductionLine } from "../hooks/useProductionLines";
import {
  FiChevronRight,
  FiAlertCircle,
  FiPackage,
  FiLayers,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiDatabase,
} from "react-icons/fi";
import Link from "next/link";
import ProductionLineLayers from "./ProductionLineLayers";

interface ProductionLineViewProps {
  lineId: string;
  onStepClick?: (
    stepId: string,
    stepName: string,
    stepDescription: string
  ) => void;
}

interface MicroLineStep {
  step: {
    _id: string;
    name: string;
    description: string;
  };
  order: number;
}

interface MicroLine {
  _id: string;
  name: string;
  code: string;
  description: string;
  steps: MicroLineStep[];
  inventory?: {
    _id: string;
    name: string;
    type: string;
    code: string;
    description?: string;
    quantity?: number;
  } | null;
}

interface MicroLineItem {
  microLine: MicroLine;
  order: number;
}

interface ProductionLineData {
  _id: string;
  name: string;
  code: string;
  description: string;
  microLines: MicroLineItem[];
  inventory: {
    _id: string;
    name: string;
    type: string;
    code: string;
    description?: string;
    quantity?: number;
  } | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProductionLineView({
  lineId,
  onStepClick,
}: ProductionLineViewProps) {
  const { line, isLoading, error } = useProductionLine(lineId);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [expandedMicroLines, setExpandedMicroLines] = useState<
    Record<string, boolean>
  >({});

  // Always define lineSteps, even if it's empty
  const lineSteps = useMemo(() => {
    if (!line || !line.microLines) return [];

    const typedLine = line as unknown as ProductionLineData;
    return typedLine.microLines.flatMap((item) =>
      (item.microLine.steps || []).map((step) => ({
        _id: step.step._id,
        name: step.step.name,
      }))
    );
  }, [line]);

  // Initialize expanded state for all microLines when data is loaded
  useEffect(() => {
    if (line && line.microLines) {
      const initialExpandState: Record<string, boolean> = {};
      line.microLines.forEach((item) => {
        initialExpandState[item.microLine._id] = true; // Start expanded
      });
      setExpandedMicroLines(initialExpandState);
    }
  }, [line]);

  // Function to handle step click
  const handleStepClick = (
    stepId: string,
    stepName: string,
    stepDescription: string
  ) => {
    setActiveStepId(stepId);
    if (onStepClick) {
      onStepClick(stepId, stepName, stepDescription);
    }
  };

  // Function to toggle microLine expansion
  const toggleMicroLineExpansion = (microLineId: string) => {
    setExpandedMicroLines((prev) => ({
      ...prev,
      [microLineId]: !prev[microLineId],
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-lg">
        <div className="flex items-center gap-2">
          <FiAlertCircle className="text-xl" />
          <p className="font-bold">Error:</p>
        </div>
        <p className="mt-2 pr-7">{error}</p>
      </div>
    );
  }

  if (!line) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-5 rounded-lg">
        <div className="flex items-center gap-2">
          <FiAlertCircle className="text-xl" />
          <p className="font-bold">Notice:</p>
        </div>
        <p className="mt-2 pr-7">Production line not found</p>
      </div>
    );
  }

  const typedLine = line as unknown as ProductionLineData;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
                <FiLayers className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 font-vazir">
                  {typedLine.name}
                </h2>
                {typedLine.description && (
                  <p className="text-gray-600 font-vazir mt-1 max-w-2xl line-clamp-2">
                    {typedLine.description}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full font-vazir">
                    <span className="text-gray-500 mr-1">کد:</span>{" "}
                    {typedLine.code}
                  </span>
                  {typedLine.active !== undefined && (
                    <span
                      className={`inline-flex items-center text-xs px-3 py-1.5 rounded-full font-vazir ${
                        typedLine.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {typedLine.active ? "فعال" : "غیرفعال"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/configure/${typedLine._id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm font-vazir flex items-center gap-2 shadow-sm"
            >
              <span>ویرایش</span>
              <FiChevronLeft className="text-sm" />
            </Link>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 font-vazir flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <FiLayers className="text-blue-600 text-lg" />
            </div>
            <span>مراحل تولید</span>
          </h3>

          {typedLine.microLines && typedLine.microLines.length > 0 ? (
            <div className="space-y-4">
              {typedLine.microLines.map((microLineItem, microIndex) => {
                const microLine = microLineItem.microLine;
                const isExpanded = expandedMicroLines[microLine._id];

                return (
                  <div
                    key={microLine._id}
                    className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-blue-200 hover:shadow-md"
                  >
                    <div
                      className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${
                        isExpanded
                          ? "bg-blue-50"
                          : "bg-gray-50 hover:bg-blue-50/50"
                      }`}
                      onClick={() => toggleMicroLineExpansion(microLine._id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center ${
                            isExpanded
                              ? "bg-blue-200 text-blue-700"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          <span className="font-medium">{microIndex + 1}</span>
                        </div>
                        <h4 className="font-medium text-gray-800 font-vazir">
                          {microLine.name}
                        </h4>
                        {microLine.steps && microLine.steps.length > 0 && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-vazir">
                            {microLine.steps.length} مرحله
                          </span>
                        )}
                      </div>
                      <button
                        className={`p-2 rounded-full transition-colors ${
                          isExpanded
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-500 hover:bg-gray-200"
                        }`}
                        aria-label={isExpanded ? "بستن" : "باز کردن"}
                      >
                        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="p-5 border-t border-gray-200 bg-white">
                        {microLine.description && (
                          <div className="text-sm text-gray-600 mb-4 font-vazir border-r-2 border-blue-200 pr-3 py-1">
                            {microLine.description}
                          </div>
                        )}

                        {/* Display MicroLine Inventory (Holding) */}
                        {microLine.inventory && (
                          <div className="mb-5">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 transition-all hover:shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                  <FiPackage className="text-amber-600 text-lg" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-800 font-vazir">
                                    موجودی میانی: {microLine.inventory.name}
                                  </h5>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="inline-flex items-center text-xs bg-white text-gray-600 px-2.5 py-1 rounded-full font-vazir border border-gray-200">
                                      <span className="text-gray-500 ml-1">
                                        کد:
                                      </span>{" "}
                                      {microLine.inventory.code}
                                    </span>
                                    {microLine.inventory.quantity !==
                                      undefined && (
                                      <span className="inline-flex items-center text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-vazir">
                                        <span className="text-amber-600 ml-1">
                                          تعداد:
                                        </span>{" "}
                                        {microLine.inventory.quantity}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Steps Section */}
                        <div className="mt-4">
                          <h6 className="text-sm font-medium text-gray-700 mb-3 font-vazir flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            مراحل فرآیند
                          </h6>

                          {microLine.steps && microLine.steps.length > 0 ? (
                            <div className="space-y-2.5">
                              {microLine.steps.map((stepItem, stepIndex) => {
                                const step = stepItem.step;
                                const isActive = activeStepId === step._id;

                                return (
                                  <button
                                    key={step._id}
                                    onClick={() =>
                                      handleStepClick(
                                        step._id,
                                        step.name,
                                        step.description || ""
                                      )
                                    }
                                    className={`w-full text-right p-3.5 rounded-lg transition-all duration-200 flex items-center justify-between ${
                                      isActive
                                        ? "bg-blue-50 border border-blue-300 shadow-sm"
                                        : "bg-gray-50 border border-gray-200 hover:bg-blue-50/50 hover:border-blue-200"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                          isActive
                                            ? "bg-blue-200 text-blue-700"
                                            : "bg-gray-200 text-gray-600"
                                        }`}
                                      >
                                        <span className="text-xs font-medium">
                                          {stepIndex + 1}
                                        </span>
                                      </div>
                                      <div className="text-right">
                                        <span
                                          className={`font-medium block font-vazir ${
                                            isActive
                                              ? "text-blue-700"
                                              : "text-gray-800"
                                          }`}
                                        >
                                          {step.name}
                                        </span>
                                        {step.description && (
                                          <span className="text-sm text-gray-500 block mt-1 font-vazir line-clamp-1">
                                            {step.description}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <FiChevronRight
                                      className={`text-lg transition-transform duration-200 ${
                                        isActive
                                          ? "text-blue-500 transform translate-x-[-2px]"
                                          : "text-gray-400"
                                      }`}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-lg font-vazir bg-gray-50">
                              <p className="flex flex-col items-center justify-center gap-2">
                                <FiAlertCircle className="text-gray-400 text-xl" />
                                <span>بدون مرحله</span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8 border border-dashed border-gray-300 rounded-lg font-vazir bg-gray-50">
              <p className="flex flex-col items-center justify-center gap-3">
                <FiLayers className="text-gray-400 text-3xl" />
                <span>هیچ مرحله‌ای تعریف نشده است</span>
              </p>
            </div>
          )}
        </div>

        {/* Display Production Line Inventory (Finished) */}
        {typedLine.inventory && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 font-vazir flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-md">
                <FiPackage className="text-green-600 text-lg" />
              </div>
              <span>موجودی نهایی</span>
            </h3>

            <div className="bg-white border border-green-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full opacity-50 pointer-events-none"></div>

              <div className="flex items-start gap-4 relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-sm flex-shrink-0">
                  <FiPackage className="text-green-600 text-2xl" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="font-bold text-gray-800 font-vazir text-lg">
                      {typedLine.inventory.name}
                    </h4>

                    {typedLine.inventory.type && (
                      <span className="inline-flex items-center bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-vazir">
                        {typedLine.inventory.type === "finished"
                          ? "محصول نهایی"
                          : "میانی"}
                      </span>
                    )}
                  </div>

                  {typedLine.inventory.description && (
                    <div className="text-gray-600 mt-1 font-vazir bg-green-50/50 p-2 rounded-lg border-r-2 border-green-300">
                      {typedLine.inventory.description}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="inline-flex items-center bg-white border border-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg font-vazir shadow-sm">
                      <span className="text-gray-500 ml-1.5 text-xs">کد:</span>
                      <span className="font-medium">
                        {typedLine.inventory.code}
                      </span>
                    </div>

                    {typedLine.inventory.quantity !== undefined && (
                      <div className="inline-flex items-center bg-green-100 text-green-700 text-sm px-3 py-1.5 rounded-lg font-vazir shadow-sm">
                        <FiDatabase className="text-green-600 mr-1 text-xs" />
                        <span className="text-green-600 ml-1.5 text-xs">
                          موجودی:
                        </span>
                        <span className="font-medium">
                          {typedLine.inventory.quantity}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add ProductionLineLayers component */}
        {typedLine._id && (
          <ProductionLineLayers lineId={typedLine._id} steps={lineSteps} />
        )}
      </div>
    </div>
  );
}
