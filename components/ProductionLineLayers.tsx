"use client";
import { useMemo } from "react";
import { useProductLayersByLine } from "../hooks/useProductLayers";
import {
  FiAlertCircle,
  FiLayers,
  FiClock,
  FiInfo,
  FiUser,
  FiCalendar,
  FiTag,
  FiFileText,
  FiMaximize2,
  FiShield,
  FiBox,
} from "react-icons/fi";
import Link from "next/link";
import { subDays } from "date-fns";
import { format as formatJalali } from "date-fns-jalali";
import Barcode from "react-barcode";

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

  // Use useMemo to group layers by step
  // Use useMemo to group layers by step
  const layersByStep = useMemo(() => {
    if (!layers || layers.length === 0) return {};

    return layers.reduce((acc: Record<string, any[]>, layer) => {
      // Check if currentStep is an object with _id or just an id string
      const stepId =
        typeof layer.currentStep === "object"
          ? layer.currentStep._id
          : layer.currentStep;

      if (!acc[stepId]) {
        acc[stepId] = [];
      }
      acc[stepId].push(layer);
      return acc;
    }, {});
  }, [layers]);

  // Format date function - converts to Persian and subtracts 24 hours
  const formatDate = (dateString: string) => {
    try {
      // Parse the date, subtract 24 hours (1 day), and format to Persian
      const date = new Date(dateString);
      const adjustedDate = subDays(date, 1); // Subtract 1 day (24 hours)

      // Format to Persian date (Jalali calendar)
      return formatJalali(adjustedDate, "yyyy/MM/dd");
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 animate-pulse mt-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="h-40 bg-gray-200 rounded-lg"></div>
            <div className="h-40 bg-gray-200 rounded-lg"></div>
            <div className="h-40 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-lg mt-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-100 rounded-full">
            <FiAlertCircle className="text-red-600" />
          </div>
          <p className="font-bold font-vazir">خطا:</p>
        </div>
        <p className="mt-2 pr-7 font-vazir">{error}</p>
      </div>
    );
  }

  if (!layers || layers.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-6 rounded-lg mt-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-yellow-100 rounded-full">
            <FiInfo className="text-yellow-600" />
          </div>
          <p className="font-bold font-vazir">توجه:</p>
        </div>
        <p className="mt-2 pr-7 font-vazir">
          هیچ لایه‌ای در این خط تولید یافت نشد
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm p-6 ">
      <h3 className="text-lg font-semibold text-gray-800 mb-5 font-vazir flex items-center gap-2">
        <div className="p-1.5 bg-indigo-100 rounded-md">
          <FiLayers className="text-indigo-600 text-lg" />
        </div>
        <span>لایه‌های در حال تولید</span>
      </h3>

      <div className="space-y-6">
        {steps.map((step) => {
          // Get the step ID
          const stepId = step._id;
          const stepsLayers = layersByStep[stepId] || [];

          if (stepsLayers.length === 0) {
            return null; // Don't show steps with no layers
          }

          return (
            <div
              key={stepId}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="bg-gray-50 p-4">
                <h4 className="font-medium text-gray-800 font-vazir flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FiClock className="text-blue-600" />
                  </span>
                  {step.name} ({stepsLayers.length})
                </h4>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stepsLayers.map((layer) => (
                    <Link
                      href={`/layers/${layer._id}`}
                      key={layer._id}
                      className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col gap-2">
                        {/* Header with code and production code */}
                        <div className="flex justify-between items-start">
                          <h5 className="font-medium text-gray-800 font-vazir">
                            {layer.code}
                          </h5>
                          <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-vazir">
                            کد تولید: {layer.productionCode}
                          </span>
                        </div>

                        {/* Customer information */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiUser className="text-blue-500" />
                          <p className="text-sm font-vazir">
                            مشتری:{" "}
                            {typeof layer.customer === "object"
                              ? layer.customer.name
                              : "نامشخص"}
                          </p>
                        </div>

                        {/* Glass information if available */}
                        {layer.glass && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FiBox className="text-blue-500" />
                            <p className="text-sm font-vazir">
                              شیشه:{" "}
                              {typeof layer.glass === "object"
                                ? layer.glass.name
                                : layer.glass}
                              {typeof layer.glass === "object" &&
                                layer.glass.thickness &&
                                ` (${layer.glass.thickness}mm)`}
                            </p>
                          </div>
                        )}

                        {/* Dimensions */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiBox className="text-blue-500" />
                          <p className="text-sm font-vazir">
                            ابعاد: {layer.width} × {layer.height}
                          </p>
                        </div>

                        {/* Production date - Persian format and 24h earlier */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiCalendar className="text-blue-500" />
                          <p className="text-sm font-vazir">
                            تاریخ تولید: {formatDate(layer.productionDate)}
                          </p>
                        </div>

                        {/* Barcode for production code */}
                        <div className="mt-3 flex justify-center">
                          <Barcode value={layer.productionCode} />
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
