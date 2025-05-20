"use client";
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
        خطا در دریافت مراحل {error}
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        مرحله ای وجود ندارد ...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div>
          {" "}
          <h2 className="text-xl font-bold text-gray-800">لیست مراحل</h2>
          <p className="inline text-gray-500">تعداد کل : </p>
          <span className="ml-auto font-bold">{steps.length}</span>
        </div>

        <button
          onClick={fetchSteps}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
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
            <StepCard
              key={step._id}
              step={step}
              onDelete={deleteStep}
              onUpdate={fetchSteps}
            />
          ))}
        </div>
      )}

      {steps.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-500 mt-0.5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-blue-800 font-medium">راهنما</p>
            <p className="text-blue-600 text-sm mt-1">
              برای ویرایش یا حذف هر مرحله، روی آیکون‌های مربوطه در کارت مرحله
              کلیک کنید.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepsList;
