"use client";
import React, { useState } from "react";
import { useProductionStep } from "@/hooks/useProductionStep";
import { Step } from "@/types/types";
import { FiEdit, FiTrash2, FiEye, FiRefreshCw } from "react-icons/fi";
import AddProductionStep from "./AddProductionStep";

const ProductionStepsView: React.FC = () => {
  const { steps, isLoading, error, mutate, deleteStep, getStep } =
    useProductionStep();
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleEdit = async (id: string) => {
    const step = await getStep(id);
    if (step) {
      setSelectedStep(step);
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    const step = steps.find((s) => s._id === id);
    if (step) {
      setSelectedStep(step);
      setIsDeleteModalOpen(true);
    }
  };

  const handleView = async (id: string) => {
    const step = await getStep(id);
    if (step) {
      setSelectedStep(step);
      setIsViewModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (selectedStep?._id) {
      const success = await deleteStep(selectedStep._id);
      if (success) {
        setIsDeleteModalOpen(false);
        setSelectedStep(null);
        await mutate();
      }
    }
  };

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
        خطا در دریافت مراحل: {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-24 space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800">لیست مراحل</h2>
          <p className="inline text-gray-500">تعداد کل: </p>
          <span className="ml-auto font-bold">{steps.length}</span>
        </div>

        <button
          onClick={() => mutate()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors shadow-sm"
        >
          <FiRefreshCw className="h-5 w-5" />
          <span>بروزرسانی</span>
        </button>
      </div>

      {steps.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-gray-600 text-lg">هیچ مرحله‌ای یافت نشد</p>
          <p className="text-gray-500 mt-2">
            برای شروع، مرحله جدیدی ایجاد کنید
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {step.name}
                  </h3>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                    {step.code}
                  </span>
                </div>

                <p className="text-gray-600 mt-2 line-clamp-2">
                  {step.description || "بدون توضیحات"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {step.requiresScan && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      نیاز به اسکن
                    </span>
                  )}
                  {step.handlesTreatments && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      مدیریت درمان
                    </span>
                  )}
                  {step.type && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {step.type}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {new Date(step.createdAt || Date.now()).toLocaleDateString(
                    "fa-IR"
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(step._id || "")}
                    className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <FiEye size={18} />
                  </button>
                  <button
                    onClick={() => handleEdit(step._id || "")}
                    className="p-1.5 bg-amber-50 text-amber-600 rounded-md hover:bg-amber-100 transition-colors"
                  >
                    <FiEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(step._id || "")}
                    className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">ویرایش مرحله</h2>
              <AddProductionStep
                stepToEdit={selectedStep}
                mode="edit"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">حذف مرحله</h2>
            <p className="mb-6">
              آیا از حذف مرحله "{selectedStep.name}" اطمینان دارید؟ این عمل قابل
              بازگشت نیست.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">جزئیات مرحله</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">نام مرحله</h3>
                <p className="mt-1 text-lg">{selectedStep.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">کد مرحله</h3>
                <p className="mt-1 text-lg">{selectedStep.code}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">توضیحات</h3>
                <p className="mt-1">
                  {selectedStep.description || "بدون توضیحات"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    نیاز به اسکن
                  </h3>
                  <p className="mt-1">
                    {selectedStep.requiresScan ? "بله" : "خیر"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    مدیریت درمان
                  </h3>
                  <p className="mt-1">
                    {selectedStep.handlesTreatments ? "بله" : "خیر"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">نوع</h3>
                  <p className="mt-1">{selectedStep.type || "نامشخص"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    تاریخ ایجاد
                  </h3>
                  <p className="mt-1">
                    {new Date(
                      selectedStep.createdAt || Date.now()
                    ).toLocaleDateString("fa-IR")}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionStepsView;
