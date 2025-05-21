"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductionHistory from "@/components/ProductionLine/ProductionHistory";
import { FiArrowLeft, FiInfo, FiClock } from "react-icons/fi";
import { useProductLayersByLine } from "@/hooks/useProductLayers";

interface ProductionQueueProps {
  productionLineId: string;
}

export default function ProductionQueue({
  productionLineId,
}: ProductionQueueProps) {
  const router = useRouter();
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
        <div className="bg-blue-50 border border-blue-100 text-blue-700 p-4 rounded-lg">
          <p className="font-bold">Loading production queue...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-bold">Error loading production queue</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (showHistory && selectedLayerId) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Production History
          </h1>
          <button
            onClick={() => setShowHistory(false)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-1.5"
          >
            <FiArrowLeft className="inline" />
            <span>Back to Queue</span>
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6 flex items-start">
          <FiInfo className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
          <div>
            <p className="text-blue-800 font-medium">
              Viewing production history
            </p>
            <p className="text-blue-600 text-sm">
              This page shows all steps and treatments applied to the selected
              layer during production.
            </p>
          </div>
        </div>

        {/* Production History Component */}
        <ProductionHistory layerId={selectedLayerId} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Production Queue</h1>
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
          <p className="text-blue-800 font-medium">
            Production Queue for Selected Line
          </p>
          <p className="text-blue-600 text-sm">
            Select a layer to view its production history.
          </p>
        </div>
      </div>

      {layers.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
          <p className="font-bold">No layers in production queue</p>
          <p>There are no layers currently assigned to this production line.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Production Code
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dimensions
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Step
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {layers.map((layer) => (
                  <tr
                    key={layer._id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedLayerId === layer._id ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {layer.code}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {layer.productionCode}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 whitespace-nowrap">
                      {layer.width} × {layer.height}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {typeof layer.currentStep === "object"
                        ? layer.currentStep?.name
                        : "Unknown"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedLayerId(layer._id);
                            setShowHistory(true);
                          }}
                          className="text-blue-500 hover:text-blue-700 py-1 px-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1"
                        >
                          <FiClock className="inline" />
                          View History
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
  );
}
