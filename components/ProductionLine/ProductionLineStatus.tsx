"use client";
import React from "react";
import { useProductionLines } from "@/hooks/useProductionLines";
import {
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiPower,
  FiSettings,
  FiX,
} from "react-icons/fi";

export default function ProductionLineStatus() {
  const { productionLines, isLoading, error } = useProductionLines();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex items-center gap-2 text-red-600">
          <FiAlertCircle className="text-red-500" />
          <p className="font-medium">خطا در بارگذاری خطوط تولید</p>
        </div>
      </div>
    );
  }

  if (productionLines.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex items-center gap-2 text-yellow-600">
          <FiAlertCircle className="text-yellow-500" />
          <p className="font-medium">هیچ خط تولیدی یافت نشد</p>
        </div>
      </div>
    );
  }

  // Count active and inactive lines
  const activeLines = productionLines.filter((line) => line.active).length;
  const inactiveLines = productionLines.length - activeLines;

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
      dir="rtl"
    >
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <FiActivity />
          <span>وضعیت خطوط تولید</span>
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          نمای کلی از وضعیت خطوط تولید
        </p>
      </div>

      {/* Status Summary */}
      <div className="p-4 grid grid-cols-2 gap-4 border-b border-gray-100">
        <div className="bg-green-50 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600 font-medium">خطوط فعال</p>
            <p className="text-2xl font-bold text-green-700">{activeLines}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <FiPower className="text-green-600" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-red-600 font-medium">خطوط غیرفعال</p>
            <p className="text-2xl font-bold text-red-700">{inactiveLines}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <FiX className="text-red-600" />
          </div>
        </div>
      </div>

      {/* Production Lines List */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-3">وضعیت خطوط</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {productionLines.map((line) => (
            <div
              key={line._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    line.active ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <div>
                  <p className="font-medium text-gray-800">{line.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{line.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <FiSettings className="text-gray-400" />
                  <span>{line.steps?.length || 0} مرحله</span>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs ${
                    line.active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {line.active ? "فعال" : "غیرفعال"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Update */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <FiClock className="text-gray-400" />
          <span>آخرین بروزرسانی: همین الان</span>
        </div>
        <button className="text-blue-600 text-sm hover:text-blue-700 flex items-center gap-1">
          <FiActivity className="text-blue-500" />
          <span>بروزرسانی</span>
        </button>
      </div>
    </div>
  );
}
