"use client";

import React, { useState } from "react";
import LayerList from "./LayerList";
import LayerStatistics from "./LayerStatistics";

export default function LayerManager() {
  const [activeTab, setActiveTab] = useState<"list" | "statistics">("list");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-black text-center">
        مدیریت لایههای تولید
      </h1>

      {/* Tabs */}
      <div className="flex border-b mb-6 text-black gap-2" dir="rtl">
        <button
          className={`px-4 py-2 ${
            activeTab === "list" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("list")}
        >
          لیست لایهها
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "statistics" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("statistics")}
        >
          آمار و گزارشات
        </button>
      </div>

      {activeTab === "list" ? (
        <LayerList
          key={refreshKey}
          onDelete={() => {
            setRefreshKey((prev) => prev + 1);
          }}
        />
      ) : (
        <LayerStatistics />
      )}
    </div>
  );
}