import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  FaBoxOpen,
  FaChevronDown,
  FaExclamationCircle,
  FaSave,
  FaSpinner,
  FaTag,
} from "react-icons/fa";

interface InventoryFormData {
  name: string;
  type: "holding" | "finished";
  description?: string;
  code?: string;
  _id?: string;
}

const AddInventoryForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InventoryFormData>();

  const onSubmit = async (data: InventoryFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create inventory");
      }

      toast.success("موجودی با موفقیت ثبت شد");

      reset();
      // Notify parent components if callbacks are provided
    } catch (err) {
      toast.success("خطا در ثبت موجودی");

      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg mt-20 border border-indigo-50">
      <div className="flex items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">افزودن موجودی جدید</h2>
        <div className="bg-indigo-100 p-2 rounded-lg mr-1">
          <FaBoxOpen className="text-indigo-600 text-xl" />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-center">
            <FaExclamationCircle className="mr-2 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            نام موجودی <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              {...register("name", { required: "نام موجودی الزامی است" })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm"
              placeholder="نام موجودی را وارد کنید"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaTag className="text-gray-400" />
            </div>
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <FaExclamationCircle className="mr-1" />
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            نوع <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              {...register("type", { required: "نوع الزامی است" })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm appearance-none"
            >
              <option value="">نوع موجودی را انتخاب کنید</option>
              <option value="holding">نگهداری</option>
              <option value="finished">تکمیل شده</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaChevronDown className="text-gray-400" />
            </div>
          </div>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <FaExclamationCircle className="mr-1" />
              {errors.type.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            توضیحات
          </label>
          <textarea
            {...register("description")}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm"
            rows={4}
            placeholder="توضیحات اضافی را وارد کنید (اختیاری)"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto flex items-center justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                در حال ذخیره...
                <FaSpinner className="animate-spin mr-2" />
              </>
            ) : (
              <>
                ذخیره موجودی
                <FaSave className="mr-2" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInventoryForm;
