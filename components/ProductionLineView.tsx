"use client";
import { useState, useEffect, useMemo } from "react";
import { useProductionLine } from "../hooks/useProductionLines";
import { FiChevronRight, FiAlertCircle, FiPackage, FiLayers, FiChevronDown, FiChevronUp } from "react-icons/fi";
import Link from "next/link";
import ProductionLineLayers from "./ProductionLineLayers";

interface ProductionLineViewProps {
  lineId: string;
  onStepClick?: (stepId: string, stepName: string, stepDescription: string) => void;
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
  const [expandedMicroLines, setExpandedMicroLines] = useState<Record<string, boolean>>({});

  // Always define lineSteps, even if it's empty
 // Update the lineSteps useMemo in ProductionLineView.tsx
const lineSteps = useMemo(() => {
  if (!line || !line.microLines) return [];
  
  const typedLine = line as unknown as ProductionLineData;
  return typedLine.microLines.flatMap(item => {
    // Check if microLine.steps exists and has the expected structure
    if (!item.microLine.steps || !Array.isArray(item.microLine.steps)) {
      return [];
    }
    
    return item.microLine.steps.map(step => {
      // Handle both possible structures of step data
      const stepId = typeof step.step === 'object' ? step.step._id : step.step;
      const stepName = typeof step.step === 'object' ? step.step.name : `Step ${step.order + 1}`;
      
      return {
        _id: stepId,
        name: stepName
      };
    });
  });
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
    setExpandedMicroLines(prev => ({
      ...prev,
      [microLineId]: !prev[microLineId]
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
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FiLayers className="text-blue-600 text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1 font-vazir">
                {typedLine.name}
              </h2>
            </div>
            {typedLine.description && (
              <p className="text-gray-600 font-vazir mt-2">{typedLine.description}</p>
            )}
            <div className="mt-2">
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-vazir">
                کد: {typedLine.code}
              </span>
            </div>
          </div>
          <Link
            href={`/configure/${typedLine._id}`}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-300 text-sm font-vazir flex items-center gap-1"
          >
            <span>ویرایش</span>
          </Link>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 font-vazir flex items-center gap-2">
            <FiLayers className="text-blue-600" />
            مراحل تولید
          </h3>
          
          {typedLine.microLines && typedLine.microLines.length > 0 ? (
            <div className="space-y-4">
              {typedLine.microLines.map((microLineItem, microIndex) => {
                const microLine = microLineItem.microLine;
                const isExpanded = expandedMicroLines[microLine._id];
                
                return (
                  <div key={microLine._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer"
                      onClick={() => toggleMicroLineExpansion(microLine._id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">{microIndex + 1}</span>
                        </div>
                        <h4 className="font-medium text-gray-800 font-vazir">
                          {microLine.name}
                        </h4>
                      </div>
                      <button className="text-gray-500 hover:text-gray-700 transition-colors">
                        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                    </div>
                    
                    {isExpanded && (
                      <div className="p-4">
                        {microLine.description && (
                          <p className="text-sm text-gray-600 mb-3 font-vazir border-b border-gray-100 pb-3">
                            {microLine.description}
                          </p>
                        )}
                        
                        {/* Display MicroLine Inventory (Holding) */}
                        {microLine.inventory && (
                          <div className="mb-4">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                  <FiPackage className="text-amber-600 text-lg" />
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-800 font-vazir text-sm">
                                    موجودی میانی: {microLine.inventory.name}
                                  </h5>
                                  <span className="text-xs text-gray-500 font-vazir">
                                    کد: {microLine.inventory.code}
                                  </span>
                                  {microLine.inventory.quantity !== undefined && (
                                    <div className="mt-1">
                                      <span className="inline-block bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded font-vazir">
                                        تعداد: {microLine.inventory.quantity}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {microLine.steps && microLine.steps.length > 0 ? (
                          <div className="space-y-2 mt-3">
                            {microLine.steps.map((stepItem, stepIndex) => {
                              const step = stepItem.step;
                              const isActive = activeStepId === step._id;
                              
                              return (
                                <button
                                  key={step._id}
                                  onClick={() => handleStepClick(
                                    step._id,
                                    step.name,
                                    step.description || ""
                                  )}
                                  className={`w-full text-right p-3 rounded-lg transition-colors duration-200 flex items-center justify-between ${
                                    isActive
                                      ? "bg-blue-50 border border-blue-200"
                                      : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                      <span className="text-gray-600 text-xs">{stepIndex + 1}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-medium text-gray-800 block font-vazir">
                                        {step.name}
                                      </span>
                                      {step.description && (
                                        <span className="text-sm text-gray-500 block mt-1 font-vazir">
                                          {step.description}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <FiChevronRight className={`text-lg ${
                                    isActive ? "text-blue-500" : "text-gray-400"
                                  }`} />
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-2 font-vazir">
                            بدون مرحله
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4 border border-gray-200 rounded-lg font-vazir">
              هیچ مرحله‌ای تعریف نشده است
            </p>
          )}
        </div>

        {/* Display Production Line Inventory (Finished) */}
        {typedLine.inventory && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 font-vazir flex items-center gap-2">
              <FiPackage className="text-green-600" />
              موجودی نهایی
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FiPackage className="text-green-600 text-xl" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 font-vazir">
                    {typedLine.inventory.name}
                  </h4>
                  {typedLine.inventory.description && (
                    <p className="text-sm text-gray-600 mt-1 font-vazir">
                      {typedLine.inventory.description}
                    </p>
                  )}
                  <div className="mt-1">
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-vazir">
                      کد: {typedLine.inventory.code}
                    </span>
                    {typedLine.inventory.type && (
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-vazir ml-2">
                        نوع: {typedLine.inventory.type === "finished" ? "محصول نهایی" : "میانی"}
                      </span>
                    )}
                  </div>
                  {typedLine.inventory.quantity !== undefined && (
                    <div className="mt-2">
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-vazir">
                        موجودی: {typedLine.inventory.quantity}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add ProductionLineLayers component */}
        {typedLine._id && (
          <ProductionLineLayers 
            lineId={typedLine._id} 
            steps={lineSteps} 
          />
        )}
      </div>
    </div>
  );
}
