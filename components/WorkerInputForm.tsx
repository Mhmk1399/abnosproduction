"use client";
import { useLayerProcessing } from "../hooks/useLayerProcessing";
import { Layer } from "./types/production";
import { useState, useEffect, useRef } from "react";
import { useProductLayers } from "../hooks/useProductLayers";
import { FiLayers, FiAlertCircle } from "react-icons/fi";

// Keep existing fake data...

export default function WorkerInputForm({
  stepId,
  stepName,
  workerId,
}: {
  stepId?: string;
  stepName?: string;
  workerId?: string;
}) {
  // Debug props
  console.log("WorkerInputForm props:", { stepId, stepName, workerId });

  // Add the missing debugRef
  const debugRef = useRef({
    layersCount: 0,
    filteredCount: 0,
    renderCount: 0
  });

  // Keep existing hook call and state variables...
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
    productionLine,
    allSteps,
    currentStepIndex,
  } = useLayerProcessing({ 
    stepId, 
    workerId: workerId || "default-worker" 
  });

  // State for fake data (keep existing)...
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

  // State for layers in the current step
  const [currentStepLayers, setCurrentStepLayers] = useState<any[]>([]);
  const [isCurrentStepLayersLoading, setIsCurrentStepLayersLoading] = useState(true);
  const [currentStepLayersError, setCurrentStepLayersError] = useState<string | null>(null);

  // Use the useProductLayers hook to get all product layers
  const { layers, isLoading: isProductLayersLoading, error: productLayersError } = useProductLayers();

  // Filter layers to show only those with currentStep matching stepId
  useEffect(() => {
    if (!stepId || isProductLayersLoading || !layers) {
      return;
    }

    try {
      console.log("StepId to match:", stepId);
      console.log("All layers:", layers);
      
      // Filter layers where currentStep._id matches stepId
      const filteredLayers = layers.filter(layer => {
        if (!layer.currentStep) {
          console.log(`Layer ${layer.code} has no currentStep`);
          return false;
        }
        
        // Extract the step ID based on the structure
        const currentStepId = typeof layer.currentStep === 'object' 
          ? layer.currentStep._id 
          : layer.currentStep;
        
        console.log(`Layer ${layer.code} has currentStep ID: ${currentStepId}`);
        
        const isMatch = currentStepId === stepId;
        console.log(`Is match with ${stepId}? ${isMatch}`);
        
        return isMatch;
      });
      
      console.log(`Found ${filteredLayers.length} layers in step ${stepId}:`, filteredLayers);
      setCurrentStepLayers(filteredLayers);
      setCurrentStepLayersError(null);
    } catch (err) {
      console.error("Error filtering layers:", err);
      setCurrentStepLayersError("Failed to filter layers for current step");
    } finally {
      setIsCurrentStepLayersLoading(false);
    }
  }, [stepId, layers, isProductLayersLoading]);

  // Custom submit handler (keep existing)...
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

  // Custom process complete handler (keep existing)...
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
    console.log("No step selected condition met:", { stepId, stepName });
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

  // Determine which data to use (keep existing)...
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

  // Debug info
  console.log("Render debug:", {
    currentStepLayersLength: currentStepLayers?.length,
    isCurrentStepLayersLoading,
    currentStepLayersError
  });

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
            <p className="font-medium">{workerId || "Not Set"}</p>
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
            {/* Keep existing layer details implementation... */}
          </div>
        )}

        {/* Success Message */}
        {displaySuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center">
            {/* Keep existing success message implementation... */}
          </div>
        )}

        {/* Debug Info */}
        <div className="mb-4 p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm">
          <p>Debug Info:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Total Layers: {debugRef.current.layersCount}</li>
            <li>Filtered Layers: {debugRef.current.filteredCount}</li>
            <li>Current Step Layers State Length: {currentStepLayers?.length || 0}</li>
            <li>Is Loading: {isCurrentStepLayersLoading ? 'Yes' : 'No'}</li>
            <li>Has Error: {currentStepLayersError ? 'Yes' : 'No'}</li>
          </ul>
        </div>

        {/* Layers in Current Step */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <FiLayers className="mr-2 text-blue-500" />
            Layers in Current Step ({stepName})
          </h3>
          
          {isCurrentStepLayersLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading layers...</p>
            </div>
          ) : currentStepLayersError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <div className="flex items-center">
                <FiAlertCircle className="mr-2" />
                <p>{currentStepLayersError}</p>
              </div>
            </div>
          ) : currentStepLayers && currentStepLayers.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Layer ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dimensions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Production Code
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentStepLayers.map((layer) => {
                    console.log("Rendering layer:", layer.code);
                    
                    // Extract customer name safely
                    const customerName = typeof layer.customer === 'object' 
                      ? layer.customer.name 
                      : 'Unknown Customer';
                    
                    // Format dimensions
                    const dimensions = layer.width && layer.height 
                      ? `${layer.width}x${layer.height}` 
                      : 'N/A';
                    
                    return (
                      <tr key={layer._id} className="hover:bg-gray-50">
                                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {layer.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dimensions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {layer.productionCode || 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <FiLayers className="mx-auto text-4xl text-gray-400 mb-3" />
              <p className="text-gray-600">No layers currently in this step</p>
              <p className="text-sm text-gray-500 mt-2">
                {debugRef.current.filteredCount > 0 ? 
                  "Layers were found but not rendered. Check console for details." : 
                  "No matching layers found for this step."}
              </p>
            </div>
          )}
        </div>

        {/* Layers in this step - Original implementation */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Layers in this Step (From stepsLayers)
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
