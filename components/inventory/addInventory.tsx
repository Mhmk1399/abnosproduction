import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useProductionInventory } from "../../hooks/useProductionInventory";
import {
  FaBoxOpen,
  FaExclamationCircle,
  FaSave,
  FaSpinner,
  FaTag,
  FaMapMarkerAlt,
  FaWarehouse,
} from "react-icons/fa";

interface InventoryFormData {
  name: string;
  Capacity: number;
  location: string;
  description?: string;
}

const AddInventoryForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createInventory, error: apiError } = useProductionInventory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InventoryFormData>();

  const onSubmit = async (data: InventoryFormData) => {
    setIsSubmitting(true);

    try {
      const success = await createInventory(data);

      if (success) {
        toast.success("انبار با موفقیت ثبت شد");
        reset();
      } else {
        toast.error("خطا در ثبت انبار");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-20 border border-indigo-50">
      <div className="flex items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">افزودن انبار جدید</h2>
        <div className="bg-indigo-100 p-2 rounded-lg mr-1">
          <FaBoxOpen className="text-indigo-600 text-xl" />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {apiError && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-center">
            <FaExclamationCircle className="mr-2 text-red-500" />
            <span>{apiError}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            نام انبار<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              {...register("name", { required: "نام انبار الزامی است" })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm"
              placeholder="نام انبار را وارد کنید"
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
            ظرفیت <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              {...register("Capacity", {
                required: "ظرفیت الزامی است",
                min: { value: 1, message: "ظرفیت باید بزرگتر از صفر باشد" },
              })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm"
              placeholder="ظرفیت انبار را وارد کنید"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaWarehouse className="text-gray-400" />
            </div>
          </div>
          {errors.Capacity && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <FaExclamationCircle className="mr-1" />
              {errors.Capacity.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            موقعیت <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              {...register("location", { required: "موقعیت الزامی است" })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm"
              placeholder="موقعیت انبار را وارد کنید"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="text-gray-400" />
            </div>
          </div>
          {errors.location && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <FaExclamationCircle className="mr-1" />
              {errors.location.message}
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
                ذخیره انبار
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
