"use client";
import React from "react";
import ProductionLineVisualizer from "./ProductionLineVisualizer";
import ProductionLineStatus from "./ProductionLineStatus";
import ProductionLineMetrics from "./ProductionLineMetrics";
import { FiPlus, FiRefreshCw, FiSettings } from "react-icons/fi";
import Link from "next/link";

export default function ProductionLineDashboard() {
  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">داشبورد خطوط تولید</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <FiRefreshCw className="text-gray-600" />
            <span>بروزرسانی</span>
          </button>
          <Link 
            href="/production-lines/create" 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus />
            <span>خط تولید جدید</span>
          </Link>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ProductionLineMetrics />
        </div>
        <div>
          <ProductionLineStatus />
        </div>
      </div>

      {/* Main Visualizer */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FiSettings className="text-gray-600" />
            <span>نمای خطوط تولید</span>
          </h2>
          <div className="flex items-center gap-2">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="all">همه خطوط</option>
              <option value="active">خطوط فعال</option>
              <option value="inactive">خطوط غیرفعال</option>
            </select>
          </div>
        </div>
        
        <ProductionLineVisualizer />
      </div>
    </div>
  );
}
