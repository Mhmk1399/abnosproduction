"use client";
import { useState, useEffect } from "react";
import { ProductionStep } from "../types/production";

interface StepSelectorProps {
  onSelectStep: (step: ProductionStep) => void;
  currentStepId?: string;
}

export default function StepSelector({
  onSelectStep,
  currentStepId,
}: StepSelectorProps) {
  const [steps, setSteps] = useState<ProductionStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSteps = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/production/steps");
        if (!response.ok) {
          throw new Error("Failed to fetch production steps");
        }
        const data = await response.json();
        setSteps(data.steps || []);
      } catch (err) {
        console.error("Error fetching steps:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSteps();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-16">
        <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
        <p className="ml-2 text-sm text-gray-600">Loading steps...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center text-sm">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center text-sm">
        <p className="text-yellow-600">No production steps available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {steps.map((step) => (
        <button
          key={step.stepId._id}
          onClick={() => onSelectStep(step)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentStepId === step.stepId._id
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
        >
          {step.stepId.name}
        </button>
      ))}
    </div>
  );
}
