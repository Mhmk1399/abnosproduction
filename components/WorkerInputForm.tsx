"use client";
import { useLayerProcessing } from "../hooks/useLayerProcessing";
import { Layer } from "./types/production";
import { useState, useEffect } from "react";

// Fake data for testing
const fakeLayer = {
  _id: "test-id-123456",
  code: "TEST-001",
  batchId: "BATCH-2023-001",
  status: "in-progress",
  dimensions: {
    width: 120,
    height: 80,
    thickness: 10,
  },
  customer: {
    name: "Test Customer Inc.",
  },
  glass: {
    name: "Tempered Glass",
  },
  productionCode: "PROD-TEST-001",
  currentStep: {
    stepId: "680cb6e4d5a9cadc24acd5b4",
    startTime: new Date().toISOString(),
  },
  processHistory: [],
};

const fakeStepsLayers = [
  {
    _id: "test-layer-1",
    code: "TEST-001",
    batchId: "BATCH-2023-001",
    status: "in-progress",
    currentStep: {
      startTime: new Date().toISOString(),
    },
  },
  {
    _id: "test-layer-2",
    code: "TEST-002",
    batchId: "BATCH-2023-001",
    status: "waiting",
    currentStep: {
      startTime: new Date(Date.now() - 3600000).toISOString(),
    },
  },
  {
    _id: "test-layer-3",
    code: "TEST-003",
    batchId: "BATCH-2023-002",
    status: "completed",
    currentStep: {
      startTime: new Date(Date.now() - 7200000).toISOString(),
    },
  },
];

// Add fake production line and steps data



export default function WorkerInputForm({
  stepId = "680cb6e4d5a9cadc24acd5b4",
  stepName,
  workerId = "W-12345",
}: {
  stepId?: string;
  stepName?: string;
  workerId?: string;
}) {
  const {
    layerId,
    setLayerId,
    currentLayer,
    isProcessComplete,
    setIsProcessComplete,
    isDefective,
    setIsDefective,
    notes,
    setNotes,
    recentLayers,
    error,
    success,
    isLoading,
    isLayersLoading,
    stepsLayers,
    inputRef,
    handleSubmit,
    handleProcessComplete,
    // New properties from the hook
    productionLine,
    allSteps,
    currentStepIndex,
  } = useLayerProcessing({ stepId, workerId });

  // State for fake data
  const [useFakeData, setUseFakeData] = useState(false);
  const [fakeCurrentLayer, setFakeCurrentLayer] = useState<any>(null);
  const [fakeRecentLayers, setFakeRecentLayers] = useState<any[]>([]);
  const [fakeError, setFakeError] = useState("");
  const [fakeSuccess, setFakeSuccess] = useState("");
  const [fakeIsLoading, setFakeIsLoading] = useState(false);
  const [fakeIsProcessComplete, setFakeIsProcessComplete] = useState(false);
  const [fakeIsDefective, setFakeIsDefective] = useState(false);
  const [fakeNotes, setFakeNotes] = useState("");
  // Add these new state variables
  const [fakeProductionLine, setFakeProductionLine] = useState<any>(null);
  const [fakeAllSteps, setFakeAllSteps] = useState<any[]>([]);
  const [fakeCurrentStepIndex, setFakeCurrentStepIndex] = useState<number>(-1);

  // Custom submit handler to check for test-id
  const customHandleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if the input is test-id
    if (layerId.toLowerCase() === "test-id") {
      setUseFakeData(true);
      setFakeIsLoading(true);

      // Simulate loading
      setTimeout(() => {
        setFakeCurrentLayer(fakeLayer);
        setFakeProductionLine(fakeProductionLine);
        setFakeAllSteps(fakeAllSteps);
        setFakeCurrentStepIndex(fakeCurrentStepIndex);
        setFakeIsLoading(false);
        setFakeError("");
      }, 800);

      return;
    }

    // If not test-id, use the real handler
    setUseFakeData(false);
    handleSubmit(e);
  };

  // Custom process complete handler for fake data
  const customHandleProcessComplete = () => {
    if (useFakeData) {
      setFakeIsLoading(true);

      // Simulate processing
      setTimeout(() => {
        // Add to fake recent layers
        setFakeRecentLayers([
          {
            ...fakeCurrentLayer,
            status: fakeIsDefective ? "defective" : "completed",
            processedAt: new Date(),
          },
          ...fakeRecentLayers,
        ]);

        setFakeSuccess(`Layer ${fakeCurrentLayer.code} processed successfully`);
        setFakeCurrentLayer(null);
        setFakeIsProcessComplete(false);
        setFakeIsDefective(false);
        setFakeNotes("");
        setFakeIsLoading(false);
        setLayerId("");

        // Clear success message after 3 seconds
        setTimeout(() => {
          setFakeSuccess("");
        }, 3000);
      }, 1000);

      return;
    }

    // If not using fake data, use the real handler
    handleProcessComplete();
  };

  // If no step is selected, show a message
  if (!stepId || !stepName) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          No Production Step Selected
        </h3>
        <p className="text-yellow-600">
          Please select a production step to continue
        </p>
      </div>
    );
  }

  // Determine which data to use
  const displayCurrentLayer = useFakeData ? fakeCurrentLayer : currentLayer;
  const displayRecentLayers = useFakeData ? fakeRecentLayers : recentLayers;
  const displayError = useFakeData ? fakeError : error;
  const displaySuccess = useFakeData ? fakeSuccess : success;
  const displayIsLoading = useFakeData ? fakeIsLoading : isLoading;
  const displayIsProcessComplete = useFakeData
    ? fakeIsProcessComplete
    : isProcessComplete;
  const displayIsDefective = useFakeData ? fakeIsDefective : isDefective;
  const displayNotes = useFakeData ? fakeNotes : notes;
  const displayStepsLayers = useFakeData ? fakeStepsLayers : stepsLayers;
  const displayIsLayersLoading = useFakeData ? false : isLayersLoading;

  // Add this new section to display production line and steps information
  const renderProductionInfo = () => {
    if (!displayCurrentLayer) return null;
    
    return (
      <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Production Information
        </h3>
        
        {/* Production Line Info */}
        {productionLine ? (
          <div className="mb-4">
            <p className="text-sm text-gray-500">Production Line</p>
            <p className="font-medium">{productionLine.name} ({productionLine.code})</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">No production line assigned</p>
        )}
        
        {/* Steps Progress */}
        {allSteps && allSteps.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Production Flow</p>
            <div className="relative">
              {/* Progress bar */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${((currentStepIndex + 1) / allSteps.length) * 100}%` }}
                ></div>
              </div>
              
              {/* Steps */}
              <div className="flex justify-between mt-2">
                {allSteps.map((step: { _id: string; name: string }, index: number) => (
                  <div 
                    key={step._id} 
                    className={`flex flex-col items-center ${
                      index <= displayCurrentStepIndex ? 'text-blue-600' : 'text-gray-400'
                    }`}
                    style={{ width: `${100 / displayAllSteps.length}%` }}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full mb-1 ${
                        index < displayCurrentStepIndex 
                          ? 'bg-blue-600' 
                          : index === displayCurrentStepIndex 
                            ? 'bg-blue-500 animate-pulse' 
                            : 'bg-gray-300'
                      }`}
                    ></div>
                    <span className="text-xs text-center">{step.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
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
        <form onSubmit={customHandleSubmit} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label
                htmlFor="layerId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Enter Layer ID{" "}
                {useFakeData && (
                  <span className="text-blue-500">(Using Test Data)</span>
                )}
              </label>
              <input
                ref={inputRef}
                type="text"
                id="layerId"
                value={layerId}
                onChange={(e) => setLayerId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Scan or type layer ID (or 'test-id' for demo)..."
                required
                disabled={displayIsLoading}
              />
            </div>
            <button
              type="submit"
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              disabled={displayIsLoading}
            >
              {displayIsLoading ? "Loading..." : "Check"}
            </button>
          </div>

          {displayError && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
              {displayError}
            </div>
          )}
        </form>

        {/* Current Layer Details */}
        {displayCurrentLayer && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Layer Details
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Layer ID</p>
                <p className="font-medium">{displayCurrentLayer.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Batch</p>
                <p className="font-medium">{displayCurrentLayer.batchId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dimensions</p>
                <p className="font-medium">
                  {displayCurrentLayer.dimensions
                    ? `${displayCurrentLayer.dimensions.width}x${displayCurrentLayer.dimensions.height}x${displayCurrentLayer.dimensions.thickness}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Status</p>
                <p className="font-medium">
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      displayCurrentLayer.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : displayCurrentLayer.status === "in-progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : displayCurrentLayer.status === "defective"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {displayCurrentLayer.status}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="processComplete"
                  type="checkbox"
                  checked={displayIsProcessComplete}
                  onChange={(e) =>
                    useFakeData
                      ? setFakeIsProcessComplete(e.target.checked)
                      : setIsProcessComplete(e.target.checked)
                  }
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
                  checked={displayIsDefective}
                  onChange={(e) =>
                    useFakeData
                      ? setFakeIsDefective(e.target.checked)
                      : setIsDefective(e.target.checked)
                  }
                  className="h-5 w-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                  disabled={!displayIsProcessComplete}
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
                  value={displayNotes}
                  onChange={(e) =>
                    useFakeData
                      ? setFakeNotes(e.target.value)
                      : setNotes(e.target.value)
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any notes about this process..."
                  disabled={!displayIsProcessComplete}
                />
              </div>

              <button
                onClick={customHandleProcessComplete}
                disabled={!displayIsProcessComplete || displayIsLoading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {displayIsLoading ? "Processing..." : "Complete & Continue"}
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {displaySuccess && (
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
            {displaySuccess}
          </div>
        )}

        {/* Layers in this step */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Layers in this Step
          </h3>
          {displayIsLayersLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading layers...</p>
            </div>
          ) : displayStepsLayers && displayStepsLayers.length > 0 ? (
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
                  {displayStepsLayers.map((layer: any) => (
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
            <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
              No layers currently in this step
            </p>
          )}
        </div>

        {/* Recently Processed Layers */}
        {displayRecentLayers && displayRecentLayers.length > 0 && (
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
                  {displayRecentLayers.map((layer, index) => (
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
                        {layer.processedAt
                          ? new Date(layer.processedAt).toLocaleTimeString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Test Mode Indicator */}
        {useFakeData && (
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Test Mode Active</span>
            </div>
            <p className="mt-1 ml-7">
              You're currently using test data. Enter any other ID to switch
              back to real data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
