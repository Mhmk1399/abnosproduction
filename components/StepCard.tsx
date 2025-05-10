"use client";
import { useState } from "react";
import { Step } from "@/hooks/useSteps";
import { FiAlertTriangle, FiEdit2, FiTrash2 } from "react-icons/fi"; // You'll need to install react-icons
import StepModal from "./StepModal";

interface StepCardProps {
  step: Step;
  onDelete: (id: string) => Promise<boolean>;
  onUpdate: () => void;
}

const StepCard: React.FC<StepCardProps> = ({ step, onDelete, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(step._id);
      onUpdate();
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
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
          Created: {new Date(step.createdAt).toLocaleDateString("fa-IR")}
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-50/10 backdrop-blur-sm flex items-center justify-center">
          <div className="relative bg-white rounded-xl max-w-md w-full mx-auto p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center mb-4 text-red-600">
              <h3 className="text-lg font-bold">تایید حذف</h3>
              <FiAlertTriangle size={24} className="mr-2" />
            </div>

            <p className="mb-6 text-gray-700">
              آیا از حذف مرحله "{step.name}" اطمینان دارید؟ این عمل قابل بازگشت
              نیست.
            </p>

            <div className="flex justify-start space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center disabled:opacity-70"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    در حال حذف...
                  </>
                ) : (
                  <>
                    تایید حذف
                    <FiTrash2 className="mr-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StepCard;
