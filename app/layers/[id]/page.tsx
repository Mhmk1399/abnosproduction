"use client";
import { useParams } from "next/navigation";
import { useProductLayer } from "@/hooks/useProductLayers";
import { useState } from "react";
import {
  FiArrowLeft,
  FiAlertCircle,
  FiUser,
  FiCalendar,
  FiBox,
  FiInfo,
} from "react-icons/fi";
import Link from "next/link";
import { format, subDays } from "date-fns";
import { format as formatJalali } from "date-fns-jalali";
import Barcode from "react-barcode";

export default function LayerDetailsPage() {
  const params = useParams();
  const layerId = params.id as string;
  const { layer, isLoading, error } = useProductLayer(layerId);

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
      <div className="container mx-auto p-6 max-w-4xl" dir="rtl">
        <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            <div className="h-20 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl" dir="rtl">
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-lg">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="text-xl" />
            <p className="font-bold font-vazir">خطا:</p>
          </div>
          <p className="mt-2 pr-7 font-vazir">{error}</p>
          <div className="mt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <FiArrowLeft />
              <span className="font-vazir">بازگشت به صفحه اصلی</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!layer) {
    return (
      <div className="container mx-auto p-6 max-w-4xl" dir="rtl">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-5 rounded-lg">
          <div className="flex items-center gap-2">
            <FiInfo className="text-xl" />
            <p className="font-bold font-vazir">توجه:</p>
          </div>
          <p className="mt-2 pr-7 font-vazir">لایه مورد نظر یافت نشد</p>
          <div className="mt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <FiArrowLeft />
              <span className="font-vazir">بازگشت به صفحه اصلی</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl" dir="rtl">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <FiArrowLeft />
          <span className="font-vazir">بازگشت به صفحه اصلی</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2 font-vazir">
                {layer.code}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <FiUser className="text-blue-500" />
                <p className="font-vazir">
                  مشتری:{" "}
                  {typeof layer.customer === "object"
                    ? layer.customer.name
                    : "نامشخص"}
                </p>
              </div>
            </div>
            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-lg font-vazir">
              کد تولید: {layer.productionCode}
            </span>
          </div>

          {/* Barcode */}
          <div className="mb-6 flex justify-center">
            <div className="bg-white p-3 border border-gray-200 rounded-lg">
              <Barcode
                value={layer.productionCode}
                width={1.5}
                height={50}
                fontSize={14}
                margin={10}
                displayValue={true}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3 font-vazir">
                اطلاعات محصول
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiBox className="text-blue-500" />
                  <p className="font-vazir">
                    ابعاد: {layer.width} × {layer.height}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiCalendar className="text-blue-500" />
                  <p className="font-vazir">
                    تاریخ تولید: {formatDate(layer.productionDate)}
                  </p>
                </div>
                {layer.glass && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-xs">G</span>
                    </span>
                    <p className="font-vazir">
                      شیشه:{" "}
                      {typeof layer.glass === "object"
                        ? layer.glass.name
                        : layer.glass}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3 font-vazir">
                وضعیت تولید
              </h3>
              <div className="space-y-3">
                {layer.currentStep && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-xs">S</span>
                    </span>
                    <p className="font-vazir">
                      مرحله فعلی:{" "}
                      {typeof layer.currentStep === "object"
                        ? layer.currentStep.name
                        : "نامشخص"}
                    </p>
                  </div>
                )}
                {layer.currentline && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600 text-xs">L</span>
                    </span>
                    <p className="font-vazir">
                      خط تولید:{" "}
                      {typeof layer.currentline === "object"
                        ? layer.currentline.name
                        : "نامشخص"}
                    </p>
                  </div>
                )}

                {layer.currentInventory && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="text-amber-600 text-xs">I</span>
                    </span>
                    <p className="font-vazir">
                      موجودی فعلی:{" "}
                      {typeof layer.currentInventory === "object"
                        ? layer.currentInventory.name
                        : "نامشخص"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Production Notes */}
          {layer.productionNotes && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-700 mb-2 font-vazir">
                یادداشت‌های تولید
              </h3>
              <p className="text-gray-600 font-vazir">
                {layer.productionNotes}
              </p>
            </div>
          )}

          {/* Additional Information */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-700 mb-3 font-vazir">
              اطلاعات تکمیلی
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {layer.invoice && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-600 text-xs">F</span>
                  </span>
                  <p className="font-vazir">
                    فاکتور:{" "}
                    {typeof layer.invoice === "object"
                      ? layer.invoice.code
                      : layer.invoice}
                  </p>
                </div>
              )}
              {layer.productionLine && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-600 text-xs">P</span>
                  </span>
                  <p className="font-vazir">
                    خط تولید اصلی:{" "}
                    {typeof layer.currentline === "object"
                      ? layer.currentline.name
                      : "نامشخص"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
