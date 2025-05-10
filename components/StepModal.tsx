"use client";
import React from "react";
import { Step } from "@/hooks/useSteps";
import StepsForm from "./forms/StepsForm";

interface StepModalProps {
  step: Step;
  onClose: () => void;
  onSuccess: () => void;
}

const StepModal: React.FC<StepModalProps> = ({ step, onClose, onSuccess }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-50/10 backdrop-blur-sm flex items-center justify-center">
      <div className="relative bg-white rounded-xl max-w-md w-full mx-auto p-6 shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">ویرایش مرحله</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <StepsForm stepToEdit={step} mode="edit" onSuccess={onSuccess} onClose={onClose} />
      </div>
    </div>
  );
};

export default StepModal;
