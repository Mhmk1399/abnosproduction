"use client";
import React, { useState } from "react";
import { useProductionStep } from "@/hooks/useProductionStep";
import { Step } from "@/types/types";
import {
  FiEdit,
  FiTrash2,
  FiEye,
  FiRefreshCw,
  FiLayers,
  FiCheckSquare,
  FiSettings,
  FiTag,
  FiCalendar,
  FiInfo,
  FiCheckCircle,
  FiCamera,
  FiArchive,
  FiCircle,
  FiPlus,
  FiX,
} from "react-icons/fi";
import AddProductionStep from "./AddProductionStep";
import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

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
      <div className="flex justify-between items-center bg-white p-5 rounded-lg shadow-md mb-6">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-md ml-2">
            <FiLayers className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">لیست مراحل</h2>
            <div className="flex items-center mt-1">
              <p className="text-gray-500 text-sm">تعداد کل مراحل:</p>
              <span className="mr-1.5 bg-indigo-50 text-indigo-700 text-sm py-0.5 px-2.5 rounded-full font-medium">
                {steps.length}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => mutate()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 shadow-sm"
        >
          <FiRefreshCw className="h-5 w-5" />
          <span>بروزرسانی</span>
        </button>
      </div>

      {steps.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center shadow-sm">
          <div className="bg-indigo-50 p-4 rounded-full inline-flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-indigo-500"
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
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            هیچ مرحله‌ای یافت نشد
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            برای شروع، مرحله جدیدی ایجاد کنید. مراحل به شما کمک می‌کنند تا
            فرآیند تولید را مدیریت کنید.
          </p>
          <button
            onClick={() => {
              /* Add your create step action here */
            }}
            className="mt-6 inline-flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <FiPlus className="ml-1.5" />
            افزودن مرحله جدید
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step._id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200 flex flex-col"
            >
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    {step.type === "step" && (
                      <span className="bg-blue-100 p-1 rounded-md ml-2">
                        <FiLayers className="text-blue-600 text-sm" />
                      </span>
                    )}
                    {step.type === "shelf" && (
                      <span className="bg-green-100 p-1 rounded-md ml-2">
                        <FiArchive className="text-green-600 text-sm" />
                      </span>
                    )}
                    {!step.type && (
                      <span className="bg-gray-100 p-1 rounded-md ml-2">
                        <FiCircle className="text-gray-600 text-sm" />
                      </span>
                    )}
                    {step.name}
                  </h3>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full font-mono">
                    {step.code}
                  </span>
                </div>

                <p className="text-gray-600 mt-2 line-clamp-2 min-h-[40px]">
                  {step.description || "بدون توضیحات"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {step.requiresScan && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full flex items-center">
                      <FiCamera className="ml-1 text-blue-500" size={10} />
                      نیاز به اسکن
                    </span>
                  )}
                  {step.handlesTreatments &&
                    step.handlesTreatments.length > 0 && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full flex items-center">
                        <FiCheckCircle
                          className="ml-1 text-green-500"
                          size={10}
                        />
                        مدیریت درمان
                      </span>
                    )}
                  {step.type && (
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full flex items-center">
                      <FiTag className="ml-1 text-purple-500" size={10} />
                      {step.type === "step"
                        ? "تولید"
                        : step.type === "shelf"
                        ? "استقرار"
                        : step.type}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-5 py-3 flex justify-between items-center border-t border-gray-200">
                <div className="text-xs text-gray-500 flex items-center">
                  <FiCalendar className="ml-1 text-gray-400" size={12} />
                  {new Date(step.createdAt || Date.now()).toLocaleDateString(
                    "fa-IR"
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(step._id || "")}
                    className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors tooltip-container"
                    aria-label="مشاهده"
                  >
                    <FiEye size={18} />
                    <span className="tooltip">مشاهده</span>
                  </button>
                  <button
                    onClick={() => handleEdit(step._id || "")}
                    className="p-1.5 bg-amber-50 text-amber-600 rounded-md hover:bg-amber-100 transition-colors tooltip-container"
                    aria-label="ویرایش"
                  >
                    <FiEdit size={18} />
                    <span className="tooltip">ویرایش</span>
                  </button>
                  <button
                    onClick={() => handleDelete(step._id || "")}
                    className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors tooltip-container"
                    aria-label="حذف"
                  >
                    <FiTrash2 size={18} />
                    <span className="tooltip">حذف</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedStep && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
          <div className="relative bg-white rounded-xl max-w-3xl w-full mx-auto shadow-2xl border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-end mb-5 pb-3 border-b border-gray-200">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 bg-gray-100 p-1.5 rounded-full hover:bg-gray-200 transition-all duration-200"
                  aria-label="بستن"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <AddProductionStep stepToEdit={selectedStep} mode="edit" />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedStep && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-50/10 backdrop-blur-sm flex items-center justify-center">
          <div className="relative bg-white rounded-xl max-w-md w-full mx-auto p-6 shadow-2xl border border-gray-200">
            <div className="rounded-xl overflow-hidden">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="bg-red-100 p-2 rounded-lg ml-2">
                    <FaExclamationTriangle className="text-red-600 text-xl" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">حذف مرحله</h2>
                </div>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 bg-gray-100 p-1.5 rounded-full hover:bg-gray-200 transition-all duration-200"
                  aria-label="بستن"
                >
                  <svg
                    className="w-5 h-5"
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

              <div className=" p-4 rounded-lg mb-5">
                <p className="text-gray-700">
                  آیا از حذف مرحله{" "}
                  <strong className="text-red-700">
                    "{selectedStep.name}"
                  </strong>{" "}
                  اطمینان دارید؟
                </p>
                <p className="text-gray-600 text-sm mt-2 flex items-center">
                  <FaInfoCircle className="ml-1.5 text-red-500" />
                  این عمل قابل بازگشت نیست و تمام داده‌های مرتبط با این مرحله
                  حذف خواهند شد.
                </p>
              </div>

              <div className="flex justify-start gap-2">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                >
                  <FaTimes className="ml-1.5" />
                  <span>انصراف</span>
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors flex items-center shadow-sm"
                >
                  <FaTrash className="ml-1.5" />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedStep && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-50/10 backdrop-blur-sm flex items-center justify-center">
          <div className="relative bg-white rounded-xl max-w-md w-full mx-auto p-6 shadow-2xl border border-gray-200">
            <div className=" rounded-xl overflow-hidden">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200 p-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-2 rounded-lg shadow-sm ml-2">
                    <FiInfo className="text-white text-xl" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    جزئیات مرحله
                  </h2>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 bg-gray-100 p-1.5 rounded-full hover:bg-gray-200 transition-all duration-200"
                  aria-label="بستن"
                >
                  <svg
                    className="w-5 h-5"
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

              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-indigo-700 mb-2">
                      نام مرحله
                    </h3>
                    <p className="text-lg font-semibold">{selectedStep.name}</p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-700 mb-2">
                      کد مرحله
                    </h3>
                    <p className="text-lg font-semibold font-mono">
                      {selectedStep.code}
                    </p>
                  </div>
                </div>

                <div className="mt-5 bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    توضیحات
                  </h3>
                  <p className="text-gray-800 leading-relaxed">
                    {selectedStep.description || (
                      <span className="text-gray-400 italic">بدون توضیحات</span>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-5">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiCheckSquare className="ml-1.5 text-indigo-500" />
                      نیاز به اسکن
                    </h3>
                    <p
                      className={`font-medium ${
                        selectedStep.requiresScan
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {selectedStep.requiresScan ? "بله" : "خیر"}
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiSettings className="ml-1.5 text-indigo-500" />
                      مدیریت خدمات
                    </h3>
                    <p
                      className={`font-medium ${
                        selectedStep.handlesTreatments
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {selectedStep.handlesTreatments ? "بله" : "خیر"}
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiTag className="ml-1.5 text-indigo-500" />
                      نوع
                    </h3>
                    <p className="font-medium text-gray-800">
                      {selectedStep.type || (
                        <span className="text-gray-400 italic">نامشخص</span>
                      )}
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiCalendar className="ml-1.5 text-indigo-500" />
                      تاریخ ایجاد
                    </h3>
                    <p className="font-medium text-gray-800">
                      {new Date(
                        selectedStep.createdAt || Date.now()
                      ).toLocaleDateString("fa-IR")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionStepsView;
