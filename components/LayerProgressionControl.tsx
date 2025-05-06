"use client";
import { useState, useEffect } from "react";
import { FiCheck, FiArrowRight, FiLoader, FiAlertTriangle } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface Step {
  _id: string;
  name: string;
  code: string;
  description?: string;
}

interface MicroLine {
  _id: string;
  name: string;
  code: string;
  steps: { step: Step; order: number }[];
}

interface ProductionLine {
  _id: string;
  name: string;
  microLines: { microLine: MicroLine; order: number }[];
}

interface LayerProgressionControlProps {
  layerId: string;
  currentStepId: string;
  currentMicroLineId?: string;
  productionLineId: string;
  onProgressionComplete?: () => void;
}

export default function LayerProgressionControl({
  layerId,
  currentStepId,
  currentMicroLineId,
  productionLineId,
  onProgressionComplete,
}: LayerProgressionControlProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [productionLine, setProductionLine] = useState<ProductionLine | null>(null);
  const [nextStep, setNextStep] = useState<{ stepId: string; microLineId: string; isNewMicroLine: boolean } | null>(null);
  const router = useRouter();

  // Fetch production line data to determine next steps
  useEffect(() => {
    const fetchProductionLineData = async () => {
      try {
        console.log("Fetching production line data for ID:", productionLineId);
        const response = await fetch(`/api/production-lines/${productionLineId}`);
        console.log("Response status:", response.status);
        if (!response.ok) throw new Error("Failed to fetch production line data");
        const data = await response.json();
        console.log("Production line data:", data);
        setProductionLine(data);
        
        // Determine next step
        determineNextStep(data, currentStepId, currentMicroLineId);
      } catch (err) {
        console.error("Error fetching production line:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    fetchProductionLineData();
  }, [productionLineId, currentStepId, currentMicroLineId]);

  // Determine the next step based on current position
  const determineNextStep = (
    prodLine: ProductionLine,
    stepId: string,
    microLineId?: string
  ) => {
    if (!prodLine || !prodLine.microLines || prodLine.microLines.length === 0) {
      setError("Invalid production line structure");
      return;
    }

    // Sort microlines by order
    const sortedMicroLines = [...prodLine.microLines].sort((a, b) => a.order - b.order);
    
    let currentMicroLineIndex = -1;
    let currentStepIndex = -1;

    // Find current position
    for (let i = 0; i < sortedMicroLines.length; i++) {
      const microLineItem = sortedMicroLines[i];
      const sortedSteps = [...microLineItem.microLine.steps].sort((a, b) => a.order - b.order);
      
      for (let j = 0; j < sortedSteps.length; j++) {
        if (sortedSteps[j].step._id === stepId) {
          currentMicroLineIndex = i;
          currentStepIndex = j;
          break;
        }
      }
      
      if (currentMicroLineIndex !== -1) break;
    }

    if (currentMicroLineIndex === -1 || currentStepIndex === -1) {
      setError("Current step not found in production line");
      return;
    }

    const currentMicroLine = sortedMicroLines[currentMicroLineIndex].microLine;
    const sortedSteps = [...currentMicroLine.steps].sort((a, b) => a.order - b.order);

    // Check if there's a next step in the current microline
    if (currentStepIndex < sortedSteps.length - 1) {
      setNextStep({
        stepId: sortedSteps[currentStepIndex + 1].step._id,
        microLineId: currentMicroLine._id,
        isNewMicroLine: false
      });
      return;
    }

    // Check if there's a next microline
    if (currentMicroLineIndex < sortedMicroLines.length - 1) {
      const nextMicroLine = sortedMicroLines[currentMicroLineIndex + 1].microLine;
      const nextMicroLineSteps = [...nextMicroLine.steps].sort((a, b) => a.order - b.order);
      
      if (nextMicroLineSteps.length > 0) {
        setNextStep({
          stepId: nextMicroLineSteps[0].step._id,
          microLineId: nextMicroLine._id,
          isNewMicroLine: true
        });
        return;
      }
    }

    // If we reach here, the layer is at the final step of the final microline
    setNextStep(null);
  };

  // Handle completing the current step
  const handleCompleteStep = async () => {
    if (!nextStep) {
      setSuccess("This layer has completed all steps in the production line!");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/layers/${layerId}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nextStepId: nextStep.stepId,
          nextMicroLineId: nextStep.microLineId,
          isNewMicroLine: nextStep.isNewMicroLine
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to progress layer");
      }

      setSuccess(nextStep.isNewMicroLine 
        ? "Layer moved to the next microline successfully!" 
        : "Step completed successfully!");
      
      // Refresh data
      if (onProgressionComplete) {
        onProgressionComplete();
      } else {
        // Refresh the page after a short delay
        setTimeout(() => {
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Get current and next step/microline names for display
  const getCurrentStepName = () => {
    if (!productionLine) return "Loading...";
    
    for (const microLineItem of productionLine.microLines) {
      for (const stepItem of microLineItem.microLine.steps) {
        if (stepItem.step._id === currentStepId) {
          return stepItem.step.name;
        }
      }
    }
    
    return "Unknown Step";
  };

  const getNextStepInfo = () => {
    if (!productionLine || !nextStep) return "Final Step";
    
    for (const microLineItem of productionLine.microLines) {
      if (microLineItem.microLine._id === nextStep.microLineId) {
        for (const stepItem of microLineItem.microLine.steps) {
          if (stepItem.step._id === nextStep.stepId) {
            return `${stepItem.step.name} ${nextStep.isNewMicroLine ? `(in ${microLineItem.microLine.name})` : ""}`;
          }
        }
      }
    }
    
    return "Next Step";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 font-vazir">
        مدیریت پیشرفت لایه
      </h3>
      
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div className="w-32 text-gray-600 font-vazir">مرحله فعلی:</div>
          <div className="font-medium text-gray-800 font-vazir">{getCurrentStepName()}</div>
        </div>
        
        {nextStep && (
          <div className="flex items-center">
            <div className="w-32 text-gray-600 font-vazir">مرحله بعدی:</div>
            <div className="font-medium text-blue-600 font-vazir">{getNextStepInfo()}</div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4 flex items-center gap-2">
          <FiAlertTriangle className="text-red-500" />
          <p className="font-vazir">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md mb-4 flex items-center gap-2">
          <FiCheck className="text-green-500" />
          <p className="font-vazir">{success}</p>
        </div>
      )}
      
      <button
        onClick={handleCompleteStep}
        disabled={isLoading || (!nextStep && !success)}
        className={`w-full py-2.5 px-4 rounded-md flex items-center justify-center gap-2 font-vazir ${
          !nextStep && !success
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isLoading ? (
          <>
            <FiLoader className="animate-spin" />
            <span>در حال پردازش...</span>
          </>
        ) : !nextStep ? (
          <>
            <FiCheck />
            <span>تمام مراحل تکمیل شده است</span>
          </>
        ) : (
          <>
            <FiArrowRight />
            <span>تکمیل مرحله و انتقال به مرحله بعد</span>
          </>
        )}
      </button>
    </div>
  );
}