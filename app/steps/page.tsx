"use client";
import React, { useState } from "react";
import StepsList from "@/components/StepsList";
import StepsForm from "@/components/forms/StepsForm";
import { useSteps } from "@/hooks/useSteps";

export default function StepsPage() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const { fetchSteps } = useSteps();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Steps Management</h1>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          {isFormVisible ? "Hide Form" : "Add New Step"}
        </button>
      </div>

      {isFormVisible && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Step</h2>
          <StepsForm onSuccess={() => {
            fetchSteps();
            setIsFormVisible(false);
            
          }} />
        </div>
      )}

      <StepsList />
    </div>
  );
}
