"use client";

import React, { useState } from "react";
import ProductionStepsForm from "./ProductionStepsForm";
import ProductionStepsTable from "./ProductionStepsTable";

export default function ProductionStepsManager() {
  const [activeTab, setActiveTab] = useState<"form" | "table">("form");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setActiveTab("table");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-black text-center">
        مدیریت مراحل تولید
      </h1>

      {/* Tabs */}
      <div className="flex border-b mb-6 text-black gap-2" dir="rtl">
        <button
          className={`px-4 py-2 ${
            activeTab === "form" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("form")}
        >
          ثبت مرحله جدید
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "table" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("table")}
        >
          مشاهده مراحل
        </button>
      </div>

      {activeTab === "form" ? (
        <ProductionStepsForm onSuccess={handleSuccess} />
      ) : (
        <ProductionStepsTable
          key={refreshKey}
          onEdit={() => {
            setActiveTab("form");
          }}
          onDelete={() => {
            setRefreshKey((prev) => prev + 1);
          }}
        />
      )}
    </div>
  );
}