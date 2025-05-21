"use client";

import { useState, useEffect } from "react";
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiFileText,
} from "react-icons/fi";
import { layerData } from "@/types/types";
import {
  ProductionHistoryProps,
  StepExecution,
  TreatmentApplication,
} from "@/types/types";
import { useProductLayer } from "@/hooks/useProductLayers";
import { useStepExecutions } from "@/hooks/useStepExecutions";

export default function ProductionHistory({ layerId }: ProductionHistoryProps) {
  const [history, setHistory] = useState<StepExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layer, setLayer] = useState<layerData | null>(null);
  const { layer: layerFromHook, isLoading: layerLoading } =
    useProductLayer(layerId);
  const { getStepExecutions } = useStepExecutions();

  // Load the layer history
  const loadHistory = async () => {
    try {
      setLoading(true);

      // Get the layer details
      if (layerFromHook) {
        setLayer(layerFromHook);
      }

      // Get the step executions for this layer
      const executions = await getStepExecutions(layerId);
      console.log(executions, "executions");
      
      // Sort by execution date (newest first)
      const sortedExecutions = executions.sort(
        (a: StepExecution, b: StepExecution) =>
          new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
      );

      setHistory(sortedExecutions);
      setError(null);
    } catch (err) {
      setError("Failed to load production history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load history on component mount
  useEffect(() => {
    if (layerId) {
      loadHistory();
    }
  }, [layerId, layerFromHook]);

  if (loading || layerLoading) {
    return <div className="p-4 text-center">Loading production history...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
        <FiAlertCircle className="inline mr-2" />
        {error}
      </div>
    );
  }

  if (!layer) {
    return <div className="p-4 text-center">Layer not found</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">
        Production History: {layer.productionCode}
      </h2>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Dimensions</div>
          <div className="font-medium">
            {layer.width} × {layer.height}
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Current Step</div>
          <div className="font-medium">
            {typeof layer.currentStep === "object"
              ? layer.currentStep.name
              : "Unknown"}
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Production Line</div>
          <div className="font-medium">
            {typeof layer.productionLine === "object"
              ? layer.productionLine.name
              : "Unknown"}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={loadHistory}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          Refresh History
        </button>
      </div>

      {/* Production History Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-gray-500 text-center p-4">
              No production history available
            </div>
          ) : (
            history.map((execution, index) => (
              <div key={execution._id} className="relative pl-10">
                {/* Timeline dot */}
                <div
                  className={`absolute left-2 top-2 w-5 h-5 rounded-full flex items-center justify-center ${
                    execution.passed
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {execution.passed ? (
                    <FiCheckCircle size={14} />
                  ) : (
                    <FiClock size={14} />
                  )}
                </div>

                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {typeof execution.step === "object"
                          ? execution.layer.currentStep.name
                          : "Unknown Step"}
                      </h3>
                      <div className="text-sm text-gray-500">
                        {new Date(execution.scannedAt).toLocaleString()}
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs ${
                        execution.passed
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {execution.passed ? "Completed" : "In Progress"}
                    </div>
                  </div>

                  {execution.notes && (
                    <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                      <FiFileText className="inline mr-1 text-gray-500" />
                      {execution.notes}
                    </div>
                  )}

                  {execution.treatmentsApplied &&
                    execution.treatmentsApplied.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-500 mb-1">
                          Treatments Applied:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {execution.treatmentsApplied.map(
                            (treatment: TreatmentApplication, i: number) => {
                              // Skip rendering if treatment or treatment.treatment is null/undefined
                              if (!treatment || !treatment.treatment) {
                                return null;
                              }

                              // Safely extract the treatment name
                              let treatmentName = "Unknown";
                              if (
                                typeof treatment.treatment === "object" &&
                                treatment.treatment !== null
                              ) {
                                treatmentName =
                                  treatment.treatment.name || "Unnamed";
                              } else if (
                                typeof treatment.treatment === "string"
                              ) {
                                treatmentName = `ID: ${treatment.treatment}`;
                              }

                              return (
                                <div
                                  key={i}
                                  className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                                >
                                  {treatmentName}
                                  {treatment.count > 1 &&
                                    ` (${treatment.count})`}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
