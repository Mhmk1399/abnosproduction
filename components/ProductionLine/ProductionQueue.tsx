"use client";
import { useEffect, useState } from "react";
import ProductionHistory from "@/components/ProductionLine/ProductionHistory";
import {
  FiArrowLeft,
  FiInfo,
  FiClock,
  FiAlertCircle,
  FiList,
} from "react-icons/fi";
import { useProductLayersByLine } from "@/hooks/useProductLayers";

interface ProductionQueueProps {
  productionLineId: string;
}

export default function ProductionQueue({
  productionLineId,
}: ProductionQueueProps) {
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Use the hook to get layers for this production line
  const { layers, isLoading, error } = useProductLayersByLine(productionLineId);

  // Select the first layer by default if available
  useEffect(() => {
    if (layers.length > 0 && !selectedLayerId) {
      setSelectedLayerId(layers[0]._id);
    }
  }, [layers, selectedLayerId]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-blue-50 border border-blue-100 text-blue-700 p-6 rounded-lg shadow-sm flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
          <p className="font-medium">در حال بارگذاری صف تولید...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <FiAlertCircle
              className="text-red-500 mt-0.5 flex-shrink-0"
              size={20}
            />
            <div>
              <p className="font-bold mb-2">خطا در بارگذاری صف تولید</p>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showHistory && selectedLayerId) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 p-1.5 rounded-md">
                <FiClock size={20} />
              </span>
              تاریخچه تولید
            </h1>
            <button
              onClick={() => setShowHistory(false)}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <FiArrowLeft className="inline" />
              <span>بازگشت به صف</span>
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-5 rounded-lg mb-6 flex items-start">
            <FiInfo
              className="text-blue-500 mt-1 mr-2 flex-shrink-0"
              size={20}
            />
            <div>
              <p className="text-blue-800 font-medium mb-1">
                مشاهده تاریخچه تولید
              </p>
              <p className="text-blue-600 text-sm">
                این صفحه تمام مراحل و عملیات انجام شده روی لایه انتخاب شده در
                طول تولید را نمایش می‌دهد.
              </p>
            </div>
          </div>

          {/* Production History Component */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <ProductionHistory layerId={selectedLayerId} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-md">
              <FiList size={20} />
            </span>
            صف تولید
          </h1>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-5 rounded-lg mb-6 flex items-start">
          <FiInfo className="text-blue-500 mt-1 mr-2 flex-shrink-0" size={20} />
          <div>
            <p className="text-blue-800 font-medium mb-1">
              صف تولید برای خط انتخاب شده
            </p>
            <p className="text-blue-600 text-sm">
              برای مشاهده تاریخچه تولید، یک لایه را انتخاب کنید.
            </p>
          </div>
        </div>

        {layers.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-6 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <FiAlertCircle
                className="text-yellow-500 mt-0.5 flex-shrink-0"
                size={20}
              />
              <div>
                <p className="font-bold mb-2">
                  هیچ لایه‌ای در صف تولید وجود ندارد
                </p>
                <p className="text-yellow-600">
                  در حال حاضر هیچ لایه‌ای به این خط تولید اختصاص داده نشده است.
                </p>
              </div>
            </div>
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
                      کد تولید
                    </th>
                    <th className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ابعاد
                    </th>
                    <th className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      مرحله فعلی
                    </th>
                    <th className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {layers.map((layer, index) => (
                    <tr
                      key={layer._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedLayerId === layer._id ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                        {index + 1}
                      </td>
                      {/* <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                        {layer.code}
                      </td> */}
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {layer.productionCode}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap">
                        <span className="bg-gray-100 px-2 py-1 rounded-md">
                          {layer.width} × {layer.height}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {typeof layer.currentStep === "object" ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            {layer.currentStep?.name}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            نامشخص
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedLayerId(layer._id);
                              setShowHistory(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 py-1.5 px-3 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5 border border-blue-100"
                          >
                            <FiClock className="inline" size={14} />
                            مشاهده تاریخچه
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
      </div>
    </div>
  );
}
