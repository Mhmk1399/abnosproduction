"use client";
import { useState } from "react";
import { useLayerTracking } from "../hooks/useLayerTracking";
import WorkerInputForm from "./WorkerInputForm";

export default function TrackingModal({
  stepId,
  stepName,
  stepDescription,
  onClose,
}: {
  stepId: string;
  stepName: string;
  stepDescription: string;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"tracking" | "input">("tracking");
  const { layers, isLoading, error } = useLayerTracking(stepId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-t-xl text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{stepName}</h2>
            {stepDescription && (
              <p className="text-blue-100 mt-1">{stepDescription}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === "tracking"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("tracking")}
          >
            Layer Tracking
          </button>
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === "input"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("input")}
          >
            Worker Input
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === "tracking" ? (
            <div>
              <h3 className="text-lg font-medium mb-4">Layers in this Step</h3>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
                  <p>{error}</p>
                </div>
              )}

              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : layers.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Layer ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Batch
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dimensions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {layers.map((layer) => (
                        <tr key={layer._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {layer.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {layer.batchId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {layer.dimensions
                              ? `${layer.dimensions.width || "-"}x${
                                  layer.dimensions.height || "-"
                                }x${layer.dimensions.thickness || "-"}`
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                layer.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : layer.status === "in-progress"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : layer.status === "defective"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {layer.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {layer.currentStep?.startTime
                              ? new Date(
                                  layer.currentStep.startTime
                                ).toLocaleString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-gray-500">
                    No layers currently in this step
                  </p>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Process Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-700">Total Layers</p>
                    <p className="text-xl font-semibold">{layers.length}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <p className="text-sm text-yellow-700">
                      Average Processing Time
                    </p>
                    <p className="text-xl font-semibold">
                      {layers.length > 0 ? calculateAverageTime(layers) : "N/A"}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <p className="text-sm text-green-700">Completed Today</p>
                    <p className="text-xl font-semibold">
                      {calculateCompletedToday(layers)}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <p className="text-sm text-red-700">Defect Rate</p>
                    <p className="text-xl font-semibold">
                      {calculateDefectRate(layers)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <WorkerInputForm stepId={stepId} stepName={stepName} />
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions for statistics
function calculateAverageTime(layers: any[]): string {
  // Filter layers with complete process history
  const completedLayers = layers.filter((layer) =>
    layer.processHistory?.some(
      (history: any) => history.startTime && history.endTime
    )
  );

  if (completedLayers.length === 0) return "N/A";

  // Calculate average time in minutes
  let totalMinutes = 0;
  let count = 0;

  completedLayers.forEach((layer) => {
    layer.processHistory.forEach((history: any) => {
      if (history.startTime && history.endTime) {
        const start = new Date(history.startTime).getTime();
        const end = new Date(history.endTime).getTime();
        const minutes = (end - start) / (1000 * 60);
        totalMinutes += minutes;
        count++;
      }
    });
  });

  const average = totalMinutes / count;

  // Format the result
  if (average < 60) {
    return `${Math.round(average)} min`;
  } else {
    const hours = Math.floor(average / 60);
    const minutes = Math.round(average % 60);
    return `${hours}h ${minutes}m`;
  }
}

function calculateCompletedToday(layers: any[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return layers.filter((layer) => {
    // Check if any process history entry was completed today
    return layer.processHistory?.some((history: any) => {
      if (history.endTime && history.status === "completed") {
        const endTime = new Date(history.endTime);
        return endTime >= today;
      }
      return false;
    });
  }).length;
}

function calculateDefectRate(layers: any[]): number {
  if (layers.length === 0) return 0;

  const defectiveLayers = layers.filter(
    (layer) =>
      layer.status === "defective" ||
      layer.processHistory?.some(
        (history: any) => history.status === "defective"
      )
  );

  return Math.round((defectiveLayers.length / layers.length) * 100);
}
