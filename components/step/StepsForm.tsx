"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Step } from "@/hooks/useSteps";
import {
  FiSave,
  FiAlertCircle,
  FiType,
  FiCode,
  FiFileText,
  FiLock,
} from "react-icons/fi";
interface StepFormData {
  name: string;
  code?: string;
  description?: string;
  password?: string;
}

interface StepFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
  stepToEdit?: Step | null;
  mode?: "create" | "edit";
}

const StepsForm: React.FC<StepFormProps> = ({
  onSuccess,
  stepToEdit = null,
  mode = "create",
  onClose,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StepFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (stepToEdit && mode === "edit") {
      setValue("name", stepToEdit.name);
      setValue("code", stepToEdit.code);
      setValue("description", stepToEdit.description || "");
      // Note: We don't set the password as it's hashed in the database
    }
  }, [stepToEdit, setValue, mode]);

  const onSubmit = async (data: StepFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let response;

      if (mode === "edit" && stepToEdit) {
        response = await fetch(`/api/steps/${stepToEdit._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      } else {
        response = await fetch("/api/steps", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to ${mode === "edit" ? "update" : "create"} step`
        );
      }

      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-8 rounded-lg "
      dir="rtl"
    >
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <FiAlertCircle className="text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
          <FiType className="text-gray-500" />
          <span>نام مرحله *</span>
        </label>
        <input
          type="text"
          {...register("name", { required: "نام مرحله الزامی است" })}
          className=" w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 transition-colors"
          placeholder="نام مرحله را وارد کنید"
        />
        {errors.name && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <FiAlertCircle className="text-red-500" size={14} />
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
          <FiCode className="text-gray-500" />
          <span>کد مرحله</span>
        </label>
        <input
          type="text"
          {...register("code")}
          className=" w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
          placeholder="برای تولید خودکار خالی بگذارید"
          disabled={mode === "edit"} // Cannot edit code in edit mode
        />
        {mode === "edit" && (
          <p className="mt-1 text-xs text-gray-500">
            کد مرحله پس از ایجاد قابل ویرایش نیست
          </p>
        )}
      </div>

      <div>
        <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
          <FiFileText className="text-gray-500" />
          <span>توضیحات</span>
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 transition-colors"
          placeholder="توضیحات مرحله را وارد کنید (اختیاری)"
        />
      </div>

      <div>
        <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
          <FiLock className="text-gray-500" />
          <span>رمز عبور</span>
        </label>
        <input
          type="password"
          {...register("password")}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 transition-colors"
          placeholder="رمز عبور را وارد کنید (اختیاری)"
        />
        <p className="mt-1 text-xs text-gray-500">
          رمز عبور برای محدود کردن دسترسی به این مرحله استفاده می‌شود
        </p>
      </div>

      <div className="flex justify-start gap-2 pt-2">
        <button
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center disabled:opacity-70"
          onClick={onClose}
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center items-center py-2.5 px-5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition-all duration-200 gap-1.5"
        >
          {isSubmitting ? (
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
              <span>در حال ذخیره...</span>
            </>
          ) : (
            <>
              <span>{mode === "edit" ? "بروزرسانی مرحله" : "ذخیره مرحله"}</span>
              <FiSave className="text-white" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default StepsForm;
