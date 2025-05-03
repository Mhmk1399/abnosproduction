"use client";
import { useState } from "react";
import StepSelector from "../../components/StepSelector";
import WorkerStation from "../../components/WorkerStation";
import { ProductionStep } from "../../components/types/production";

export default function WorkerPage() {
  const [selectedStep, setSelectedStep] = useState<ProductionStep | null>(null);
  const [workerId, setWorkerId] = useState("W-12345"); // This could come from authentication

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Worker Dashboard</h1>

      <StepSelector
        onSelectStep={setSelectedStep}
        currentStepId={selectedStep?.stepId._id}
      />

      {selectedStep ? (
        <WorkerStation step={selectedStep} workerId={workerId} />
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-blue-800 mb-2">
            Select a Production Step
          </h3>
          <p className="text-blue-600">
            Please select a production step from above to begin working
          </p>
        </div>
      )}
    </div>
  );
}
