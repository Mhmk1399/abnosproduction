"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductionHistory from "@/components/ProductionLine/ProductionHistory";
import { FiArrowLeft, FiInfo } from "react-icons/fi";

export default function ProductionHistoryPage() {
  const router = useRouter();

  const layerId = "682787cc0a37fe4240c754c7";

  console.log(layerId, "layerId");

  if (!layerId) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
          <p className="font-bold">No layer ID provided</p>
          <p>Please select a layer to view its production history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Production History</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-1.5"
        >
          <FiArrowLeft className="inline" />
          <span>Back</span>
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6 flex items-start">
        <FiInfo className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
        <div>
          <p className="text-blue-800 font-medium">Viewing production history</p>
          <p className="text-blue-600 text-sm">
            This page shows all steps and treatments applied to the selected layer during production.
          </p>
        </div>
      </div>

      {/* Production History Component */}
      <ProductionHistory layerId={layerId} />
    </div>
  );
}
