"use client";
import React, { useState } from "react";
import { Step } from "@/hooks/useSteps";
import { FiEdit2, FiTrash2 } from "react-icons/fi"; // You'll need to install react-icons
import StepModal from "./StepModal";

interface StepCardProps {
  step: Step;
  onDelete: (id: string) => Promise<boolean>;
  onUpdate: () => void;
}

const StepCard: React.FC<StepCardProps> = ({ step, onDelete, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this step?")) {
      setIsDeleting(true);
      try {
        await onDelete(step._id);
        onUpdate();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{step.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{step.code}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
              title="Edit step"
            >
              <FiEdit2 size={18} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50"
              title="Delete step"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>
        {step.description && (
          <p className="text-gray-700 mt-2 text-sm">{step.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-3">
          Created: {new Date(step.createdAt).toLocaleDateString()}
        </p>
      </div>

      {isModalOpen && (
        <StepModal
          step={step}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            onUpdate();
          }}
        />
      )}
    </>
  );
};

export default StepCard;