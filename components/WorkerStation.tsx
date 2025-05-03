"use client";
import { useState, useEffect } from "react";
import WorkerInputForm from "./WorkerInputForm";
import { ProductionStep } from "./types/production";

interface WorkerStationProps {
  step?: ProductionStep;
  workerId?: string;
}

export default function WorkerStation({
  step,
  workerId = "W-12345",
}: WorkerStationProps) {
  const [stepData, setStepData] = useState<ProductionStep | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (step) {
      setStepData(step);
      return;
    }

    // If no step is provided, we could fetch available steps
    // or show a step selector
    const fetchSteps = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/production/steps");
        if (!response.ok) {
          throw new Error("Failed to fetch production steps");
        }
        const data = await response.json();
        if (data.steps && data.steps.length > 0) {
          setStepData(data.steps[0]); // Default to first step
        }
      } catch (err) {
        console.error("Error fetching steps:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSteps();
  }, [step]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="ml-3 text-lg text-gray-700">Loading worker station...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-red-800 mb-2">
          Error Loading Worker Station
        </h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!stepData) {
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

  return (
    <WorkerInputForm
      stepId={stepData.stepId._id}
      stepName={stepData.stepId.name}
      workerId={workerId}
    />
  );
}
