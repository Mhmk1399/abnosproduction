"use client";
import { useState, useEffect, useMemo } from "react";
import { useProductLayersByLine } from "../hooks/useProductLayers";
import { FiAlertCircle, FiLayers, FiClock, FiInfo } from "react-icons/fi";
import Link from "next/link";

interface ProductionLineLayersProps {
  lineId: string;
  steps: {
    _id: string;
    name: string;
  }[];
}

export default function ProductionLineLayers({
  lineId,
  steps,
}: ProductionLineLayersProps) {
  const { layers, isLoading, error } = useProductLayersByLine(lineId);
  
  // Use useMemo instead of useState + useEffect to group layers by step
  const layersByStep = useMemo(() => {
    if (!layers || layers.length === 0) return {};
    
    return layers.reduce((acc: Record<string, any[]>, layer) => {
      const stepId = layer.currentStep;
      if (!acc[stepId]) {
        acc[stepId] = [];
      }
      acc[stepId].push(layer);
      return acc;
    }, {});
  }, [layers]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse mt-4">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-lg mt-4">
        <div className="flex items-center gap-2">
          <FiAlertCircle className="text-xl" />
          <p className="font-bold font-vazir">خطا:</p>
        </div>
        <p className="mt-2 pr-7 font-vazir">{error}</p>
      </div>
    );
  }

  if (!layers || layers.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-5 rounded-lg mt-4">
        <div className="flex items-center gap-2">
          <FiInfo className="text-xl" />
          <p className="font-bold font-vazir">توجه:</p>
        </div>
        <p className="mt-2 pr-7 font-vazir">هیچ لایه‌ای در این خط تولید یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 font-vazir flex items-center gap-2">
        <FiLayers className="text-blue-600" />
        لایه‌های در حال تولید
      </h3>
      
      <div className="space-y-6">
        {steps.map((step) => {
          const stepsLayers = layersByStep[step._id] || [];
          
          if (stepsLayers.length === 0) {
            return null; // Don't show steps with no layers
          }
          
          return (
            <div key={step._id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4">
                <h4 className="font-medium text-gray-800 font-vazir flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FiClock className="text-blue-600" />
                  </span>
                  {step.name} ({stepsLayers.length})
                </h4>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stepsLayers.map((layer) => (
                    <Link 
                      href={`/layers/${layer._id}`} 
                      key={layer._id}
                      className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-800 font-vazir">
                            {layer.code}
                          </h5>
                          <p className="text-sm text-gray-600 mt-1 font-vazir">
                            مشتری: {layer.customer}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-vazir">
                              {layer.width} × {layer.height}
                            </span>
                            {layer.designNumber && (
                              <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-vazir">
                                طرح: {layer.designNumber}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-vazir">
                            کد تولید: {layer.productionCode}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
