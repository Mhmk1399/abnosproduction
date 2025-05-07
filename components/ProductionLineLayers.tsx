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
  const layersByStep = useMemo(() => {
    if (!layers || layers.length === 0) return {};

    return layers.reduce((acc: Record<string, any[]>, layer) => {
      // Check if currentStep is an object with _id or just an id string
      const stepId =
        typeof layer.currentStep === "object"
          ? layer.currentStep
          : layer.currentStep._id;

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

      <div className="space-y-8">
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
              className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
                <h4 className="font-medium text-gray-800 font-vazir flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shadow-sm">
                    <FiClock className="text-indigo-600" />
                  </div>
                  <span>{step.name}</span>
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-vazir ml-2">
                    {stepsLayers.length} لایه
                  </span>
                </h4>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {stepsLayers.map((layer) => (
                    <Link
                      href={`/layers/${layer._id}`}
                      key={layer._id}
                      className="group block border border-gray-200 rounded-xl p-5 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden"
                    >
                      {/* Decorative corner */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full opacity-50 pointer-events-none group-hover:bg-indigo-100 transition-colors"></div>

                      <div className="flex flex-col gap-3 relative">
                        {/* Header with code and production code */}
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-gray-800 font-vazir text-lg group-hover:text-indigo-700 transition-colors">
                            {layer.code}
                          </h5>
                          <span className="inline-flex items-center bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-vazir">
                            <FiTag className="mr-1 text-green-600" />
                            <span>کد تولید: {layer.productionCode}</span>
                          </span>
                        </div>

                        {/* Customer information */}
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="p-1.5 bg-blue-100 rounded-md">
                            <FiUser className="text-blue-600 text-sm" />
                          </div>
                          <p className="text-sm font-vazir">
                            مشتری:{" "}
                            <span className="font-medium">
                              {layer.customer?.name || "نامشخص"}
                            </span>
                          </p>
                        </div>

                        {/* Dimensions */}
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="p-1.5 bg-amber-100 rounded-md">
                            <FiMaximize2 className="text-amber-600 text-sm" />
                          </div>
                          <p className="text-sm font-vazir">
                            ابعاد:{" "}
                            <span className="font-medium">
                              {layer.width} × {layer.height}
                            </span>
                          </p>
                        </div>

                        {/* Production date - Persian format and 24h earlier */}
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="p-1.5 bg-purple-100 rounded-md">
                            <FiCalendar className="text-purple-600 text-sm" />
                          </div>
                          <p className="text-sm font-vazir">
                            تاریخ تولید:{" "}
                            <span className="font-medium">
                              {formatDate(layer.productionDate)}
                            </span>
                          </p>
                        </div>

                        {/* Barcode for production code */}
                        <div className="mt-2 flex justify-center bg-white p-2 rounded-lg border border-gray-200 group-hover:border-indigo-200 transition-colors">
                          <Barcode
                            value={layer.productionCode}
                            height={40}
                            width={1.5}
                            fontSize={12}
                            margin={5}
                            background="#FFFFFF"
                          />
                        </div>

                        {/* Tags at the bottom */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {/* Invoice number if available */}
                          {layer.invoice && (
                            <span className="inline-flex items-center bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-vazir">
                              <FiFileText className="mr-1 text-gray-600" />
                              <span>
                                فاکتور:{" "}
                                {typeof layer.invoice === "object"
                                  ? layer.invoice.code
                                  : layer.invoice}
                              </span>
                            </span>
                          )}

                          {/* Glass type if available */}
                          {layer.glass && (
                            <span className="inline-flex items-center bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-vazir">
                              <FiShield className="mr-1 text-blue-600" />
                              <span>
                                شیشه:{" "}
                                {typeof layer.glass === "object"
                                  ? layer.glass.name
                                  : layer.glass}
                              </span>
                            </span>
                          )}
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
