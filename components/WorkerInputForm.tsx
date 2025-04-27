"use client";
import { useState, useRef, useEffect } from "react";
import { useLayerTracking } from "../hooks/useLayerTracking";

export default function WorkerInputForm({
  stepId,
  stepName,
  workerId = "W-12345",
}: {
  stepId: string;
  stepName: string;
  workerId?: string;
}) {
  const [layerId, setLayerId] = useState("");
  const [currentLayer, setCurrentLayer] = useState<any | null>(null);
  const [isProcessComplete, setIsProcessComplete] = useState(false);
  const [isDefective, setIsDefective] = useState(false);
  const [notes, setNotes] = useState("");
  const [recentLayers, setRecentLayers] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get real-time layer data for this step
  const { layers: stepsLayers } = useLayerTracking(stepId);

  // Focus the input field when the component mounts or after submission
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentLayer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Fetch the layer data from your API
      const response = await fetch(`/api/layers/${layerId}`);

      if (!response.ok) {
        throw new Error(`Layer ID ${layerId} not found`);
      }

      const layer = await response.json();

      // Check if this layer is already in this step or needs to be started
      const isInCurrentStep = layer.currentStep?.stepId === stepId;

      if (!isInCurrentStep) {
        // Start the layer in this step
        await fetch(`/api/layers/${layer._id}/process`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stepId,
            eventType: "start",
            workerId,
          }),
        });

        // Refetch the layer to get updated data
        const updatedResponse = await fetch(`/api/layers/${layerId}`);
        const updatedLayer = await updatedResponse.json();
        setCurrentLayer(updatedLayer);
      } else {
        setCurrentLayer(layer);
      }

      setIsProcessComplete(false);
      setIsDefective(false);
      setNotes("");
    } catch (err) {
      console.error("Error fetching layer:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setCurrentLayer(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessComplete = async () => {
    if (!currentLayer) return;

    setIsLoading(true);
    try {
      // Send the process completion to the API
      const response = await fetch(`/api/layers/${currentLayer._id}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stepId,
          eventType: isDefective ? "defect" : "complete",
          workerId,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update layer status");
      }

      // Add to recent layers
      setRecentLayers((prev) =>
        [
          {
            ...currentLayer,
            status: isDefective ? "defective" : "completed",
            processedAt: new Date(),
          },
          ...prev,
        ].slice(0, 5)
      );

      // Show success message
      setSuccess(`Layer ${currentLayer.code} processed successfully`);

      // Reset form for next entry
      setCurrentLayer(null);
      setLayerId("");
      setIsProcessComplete(false);
      setIsDefective(false);
      setNotes("");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Error completing process:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Worker Station</h2>
            <p className="text-blue-100">Step: {stepName}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-sm text-blue-100">Worker ID</p>
            <p className="font-medium">{workerId}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Layer ID Input Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label
                htmlFor="layerId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Enter Layer ID
              </label>
              <input
                ref={inputRef}
                type="text"
                id="layerId"
                value={layerId}
                onChange={(e) => setLayerId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Scan or type layer ID..."
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Check"}
            </button>
          </div>

          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}
        </form>

        {/* Current Layer Details */}
        {currentLayer && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Layer Details
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Layer ID</p>
                <p className="font-medium">{currentLayer.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Batch</p>
                <p className="font-medium">{currentLayer.batchId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dimensions</p>
                <p className="font-medium">
                  {currentLayer.dimensions
                    ? `${currentLayer.dimensions.width}x${currentLayer.dimensions.height}x${currentLayer.dimensions.thickness}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Status</p>
                <p className="font-medium">
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      currentLayer.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : currentLayer.status === "in-progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : currentLayer.status === "defective"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {currentLayer.status}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="processComplete"
                  type="checkbox"
                  checked={isProcessComplete}
                  onChange={(e) => setIsProcessComplete(e.target.checked)}
                  className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="processComplete" className="ml-2 text-gray-700">
                  Process complete
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="isDefective"
                  type="checkbox"
                  checked={isDefective}
                  onChange={(e) => setIsDefective(e.target.checked)}
                  className="h-5 w-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                  disabled={!isProcessComplete}
                />
                <label htmlFor="isDefective" className="ml-2 text-gray-700">
                  Mark as defective
                </label>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any notes about this process..."
                  disabled={!isProcessComplete}
                />
              </div>

              <button
                onClick={handleProcessComplete}
                disabled={!isProcessComplete || isLoading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Complete & Continue"}
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {success}
          </div>
        )}

        {/* Layers in this step */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Layers in this Step
          </h3>
          {stepsLayers.length > 0 ? (
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stepsLayers.map((layer:any) => (
                    <tr key={layer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {layer.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {layer.batchId}
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
                        {new Date(
                          layer.currentStep?.startTime
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
              No layers currently in this step
            </p>
          )}
        </div>

        {/* Recently Processed Layers */}
        {recentLayers.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Recently Processed
            </h3>
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentLayers.map((layer, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {layer.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {layer.batchId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            layer.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : layer.status === "in-progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {layer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(layer.processedAt).toLocaleTimeString()}
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
