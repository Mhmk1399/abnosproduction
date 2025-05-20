"use client";
import React from "react";
import { useProductionLines } from "@/hooks/useProductionLines";
import {
  FiBarChart2,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiPackage,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";

export default function ProductionLineMetrics() {
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
          <p className="font-medium">خطا در بارگذاری آمار تولید</p>
        </div>
      </div>
    );
  }

  // Generate some mock metrics for demonstration
  const totalSteps = productionLines.reduce(
    (sum, line) => sum + (line.steps?.length || 0),
    0
  );
  const totalActiveLines = productionLines.filter((line) => line.active).length;
  const efficiency = Math.min(95, Math.floor(Math.random() * 30) + 70); // Random between 70-95%
  const dailyCapacity = totalActiveLines * 50 + Math.floor(Math.random() * 100);

  // Mock trend data (up or down)
  const efficiencyTrend = Math.random() > 0.5;
  const capacityTrend = Math.random() > 0.5;

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
      dir="rtl"
    >
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-white">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <FiBarChart2 />
          <span>آمار تولید</span>
        </h2>
        <p className="text-purple-100 text-sm mt-1">
          شاخص‌های کلیدی عملکرد خطوط تولید
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-600 font-medium">کارایی تولید</p>
            <div
              className={`flex items-center gap-1 text-xs ${
                efficiencyTrend ? "text-green-600" : "text-red-600"
              }`}
            >
              {efficiencyTrend ? (
                <FiTrendingUp
                  className={
                    efficiencyTrend ? "text-green-500" : "text-red-500"
                  }
                />
              ) : (
                <FiTrendingDown
                  className={
                    efficiencyTrend ? "text-green-500" : "text-red-500"
                  }
                />
              )}
              <span>{efficiencyTrend ? "+2.5%" : "-1.3%"}</span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-blue-700">{efficiency}%</p>
            <div className="w-16 h-8 bg-blue-100 rounded-md relative overflow-hidden">
              <div
                className="absolute bottom-0 left-0 bg-blue-500 transition-all duration-500"
                style={{ width: "100%", height: `${efficiency}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-600 font-medium">ظرفیت روزانه</p>
            <div
              className={`flex items-center gap-1 text-xs ${
                capacityTrend ? "text-green-600" : "text-red-600"
              }`}
            >
              {capacityTrend ? (
                <FiTrendingUp
                  className={capacityTrend ? "text-green-500" : "text-red-500"}
                />
              ) : (
                <FiTrendingDown
                  className={capacityTrend ? "text-green-500" : "text-red-500"}
                />
              )}
              <span>{capacityTrend ? "+12" : "-8"}</span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-green-700">{dailyCapacity}</p>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <FiPackage className="text-green-500" />
              <span>واحد</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-amber-600 font-medium">خطوط فعال</p>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-amber-700">
              {totalActiveLines}/{productionLines.length}
            </p>
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <FiActivity className="text-amber-500" />
              <span>خط تولید</span>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-indigo-600 font-medium">کل مراحل</p>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-indigo-700">{totalSteps}</p>
            <div className="flex items-center gap-1 text-xs text-indigo-600">
              <FiClock className="text-indigo-500" />
              <span>مرحله</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="p-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-600 mb-3">وضعیت کلی</h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              efficiency > 80 ? "bg-green-500" : "bg-yellow-500"
            }`}
          ></div>
          <p className="text-sm text-gray-700">
            {efficiency > 80 ? (
              <span className="flex items-center gap-1">
                <FiCheckCircle className="text-green-500" />
                <span>سیستم در وضعیت مطلوب قرار دارد</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <FiAlertCircle className="text-yellow-500" />
                <span>نیاز به بهینه‌سازی خطوط تولید</span>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Last Update */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <FiClock className="text-gray-400" />
          <span>آخرین بروزرسانی: همین الان</span>
        </div>
        <button className="text-purple-600 text-sm hover:text-purple-700 flex items-center gap-1">
          <FiBarChart2 className="text-purple-500" />
          <span>گزارش کامل</span>
        </button>
      </div>
    </div>
  );
}
