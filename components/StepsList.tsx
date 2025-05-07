"use client";
import React, { useState } from "react";
import { useSteps } from "@/hooks/useSteps";
import StepCard from "./StepCard";

const StepsList: React.FC = () => {
  const { steps, isLoading, error, fetchSteps, deleteStep } = useSteps();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-md text-red-700 mb-4">
        Error loading steps: {error}
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No steps found. Create your first step!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {steps.map((step) => (
        <StepCard
          key={step._id}
          step={step}
          onDelete={deleteStep}
          onUpdate={fetchSteps}
        />
      ))}
    </div>
  );
};

export default StepsList;