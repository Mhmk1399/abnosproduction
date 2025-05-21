"use client";
import React, { useState, useEffect } from "react";
import { useProductionStep } from "@/hooks/useProductionStep";
import { Step } from "@/types/types";
import {
  FiPlus,
  FiX,
  FiSave,
  FiAlertCircle,
  FiType,
  FiCode,
  FiFileText,
  FiLock,
  FiList,
  FiInfo,
  FiTag,
} from "react-icons/fi";

interface AddProductionStepProps {
  stepToEdit?: Step | null;
  mode?: "create" | "edit";
}

const AddProductionStep: React.FC<AddProductionStepProps> = ({
  stepToEdit = null,
  mode = "create",
}) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    createStep,
    updateStep,
    mutate,
    treatments,
    loadingTreatments,
    fetchGlassTreatments,
  } = useProductionStep();

  // State to control whether to show the treatments dropdown
  const [showTreatmentsDropdown, setShowTreatmentsDropdown] = useState(
    Boolean(stepToEdit?.handlesTreatments?.length)
  );

  // Form state
  const [formData, setFormData] = useState<Partial<Step>>({
    name: stepToEdit?.name || "",
    code: stepToEdit?.code || "",
    description: stepToEdit?.description || "",
    requiresScan: Boolean(stepToEdit?.requiresScan) || false,
    handlesTreatments: stepToEdit?.handlesTreatments || [],
    type: stepToEdit?.type || "",
    password: "",
  });

  // Form validation state
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
  }>({});

  // Effect to fetch treatments when dropdown is shown
  useEffect(() => {
    // Only fetch treatments when the dropdown is shown and we haven't already loaded them
    if (showTreatmentsDropdown && treatments.length === 0) {
      fetchGlassTreatments();
    }
  }, [showTreatmentsDropdown]); // Remove fetchGlassTreatments and treatments from dependencies

  // Effect to set dropdown visibility based on stepToEdit
  useEffect(() => {
    // If stepToEdit has handlesTreatments with items, show the dropdown
    if (
      stepToEdit?.handlesTreatments &&
      stepToEdit.handlesTreatments.length > 0
    ) {
      setShowTreatmentsDropdown(true);
    }
  }, [stepToEdit]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;

      if (name === "handlesTreatmentsToggle") {
        setShowTreatmentsDropdown(checkbox.checked);
        if (!checkbox.checked) {
          // If unchecked, clear the treatments array
          setFormData({
            ...formData,
            handlesTreatments: [],
          });
        }
      } else {
        setFormData({
          ...formData,
          [name]: checkbox.checked,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };



  const validateForm = (): boolean => {
    const errors: { name?: string } = {};

    if (!formData.name || formData.name.trim() === "") {
      errors.name = "نام مرحله الزامی است";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let success = false;

      if (mode === "edit" && stepToEdit) {
        success = await updateStep({
          ...stepToEdit,
          ...formData,
        } as Step);
      } else {
        success = await createStep(formData as Step);
      }

      if (success) {
        resetForm();
        await mutate();
        setIsFormVisible(false);
      } else {
        throw new Error(
          `خطا در  ${mode === "edit" ? "ویرایش" : "ساختن"} مرحله`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      requiresScan: false,
      handlesTreatments: [],
      type: "",
      password: "",
    });
    setValidationErrors({});
    setShowTreatmentsDropdown(false);
  };

  const handleClose = () => {
    resetForm();
    setIsFormVisible(false);
    setError(null);
  };
  // const renderTreatmentsDropdown = () => {
  //   if (!showTreatmentsDropdown) return null;

  //   return (
  //     <div>
  //       <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
  //         <FiList className="text-gray-500" />
  //         <span>انتخاب خدمات‌ها</span>
  //       </label>
  //       {loadingTreatments ? (
  //         <div className="text-sm text-gray-500">
  //           در حال بارگذاری خدمات‌ها...
  //         </div>
  //       ) : (
  //         <select
  //           name="treatments"
  //           multiple
  //           value={(formData.handlesTreatments || []).map((t) =>
  //             typeof t === "string" ? t : t._id
  //           )}
  //           onChange={handleTreatmentChange}
  //           className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 transition-colors"
  //           size={Math.min(5, treatments.length)}
  //         >
  //           {treatments.map((treatment) => (
  //             <option key={treatment._id} value={treatment._id}>
  //               {treatment.name}
  //             </option>
  //           ))}
  //         </select>
  //       )}
  //       <p className="mt-1 text-xs text-gray-500">
  //         برای انتخاب چند خدمات، کلید Ctrl را نگه دارید و کلیک کنید
  //       </p>
  //     </div>
  //   );
  // };

  return (
    <div
      className={`max-w-5xl  ${
        mode === "edit" ? "max-h-120" : "h-full mt-20"
      }  mx-auto bg-white rounded-lg shadow-md overflow-auto`}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === "edit" ? "ویرایش مرحله" : "افزودن مرحله جدید"}
          </h2>
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              isFormVisible
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {isFormVisible ? (
              <>
                <FiX className="h-5 w-5" />
                <span>بستن فرم</span>
              </>
            ) : (
              <>
                <FiPlus className="h-5 w-5" />
                <span>
                  {mode === "edit" ? "ویرایش مرحله" : "افزودن مرحله جدید"}
                </span>
              </>
            )}
          </button>
        </div>

        {isFormVisible && (
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
              {error && (
                <div className="p-4 bg-red-50 border-r-4 border-red-500 text-red-700 rounded-lg flex items-center gap-2 animate-fadeIn">
                  <FiAlertCircle className="text-red-500 flex-shrink-0 text-lg" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <FiType className="text-indigo-500" />
                    <span>نام مرحله *</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 transition-colors"
                    placeholder="نام مرحله را وارد کنید"
                  />
                  {validationErrors.name && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1 bg-red-50 p-1.5 rounded-md">
                      <FiAlertCircle className="text-red-500" size={14} />
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <FiCode className="text-indigo-500" />
                    <span>کد مرحله</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code || ""}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="برای تولید خودکار خالی بگذارید"
                    disabled={mode === "edit"} // Cannot edit code in edit mode
                  />
                  {mode === "edit" && (
                    <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <FiLock className="text-gray-400" size={12} />
                      کد مرحله پس از ایجاد قابل ویرایش نیست
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <FiFileText className="text-indigo-500" />
                  <span>توضیحات</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 transition-colors"
                  placeholder="توضیحات مرحله را وارد کنید (اختیاری)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="requiresScan"
                      checked={Boolean(formData.requiresScan)}
                      onChange={handleInputChange}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-5 h-5"
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      نیاز به اسکن
                    </span>
                  </label>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="handlesTreatmentsToggle"
                      checked={showTreatmentsDropdown}
                      onChange={handleInputChange}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-5 h-5"
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      مدیریت خدمات
                    </span>
                  </label>
                </div>
              </div>

              {showTreatmentsDropdown && (
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 animate-fadeIn">
                  <label className="text-sm font-medium text-indigo-700 mb-3 flex items-center gap-1.5 pb-2 border-b border-indigo-100">
                    <FiList className="text-indigo-600" />
                    <span>انتخاب خدمات‌ها</span>
                  </label>
                  {loadingTreatments ? (
                    <div className="text-sm text-indigo-600 flex items-center gap-2 py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                      در حال بارگذاری خدمات‌ها...
                    </div>
                  ) : (
                    <select
                      name="treatments"
                      multiple
                      value={(formData.handlesTreatments || []).map((t) =>
                        typeof t === "string" ? t : t._id
                      )}
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions
                        ).map((option) => option.value);
                        setFormData({
                          ...formData,
                          handlesTreatments: selectedOptions,
                        });
                      }}
                      className="block w-full rounded-lg border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 transition-colors bg-white"
                      size={Math.min(5, treatments.length)}
                    >
                      {treatments.map((treatment) => (
                        <option key={treatment._id} value={treatment._id}>
                          {treatment.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="mt-2 text-xs text-indigo-600 flex items-center gap-1.5">
                    <FiInfo className="text-indigo-500" />
                    برای انتخاب چند خدمات، کلید Ctrl را نگه دارید و کلیک کنید
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <FiTag className="text-indigo-500" />
                  <span>نوع مرحله</span>
                </label>
                <select
                  name="type"
                  value={formData.type || ""}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 transition-colors"
                >
                  <option value="">انتخاب کنید</option>
                  <option value="step">تولید</option>
                  <option value="shelf">استقرار</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <FiLock className="text-indigo-500" />
                  <span>رمز عبور</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password || ""}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 transition-colors"
                  placeholder="رمز عبور را وارد کنید (اختیاری)"
                />
                <p className="mt-1 text-xs text-gray-500 flex items-center gap-1.5">
                  <FiInfo className="text-gray-400" size={12} />
                  رمز عبور برای محدود کردن دسترسی به این مرحله استفاده می‌شود
                </p>
              </div>

              <div className="flex justify-start gap-3 pt-4 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-sm"
                  onClick={handleClose}
                >
                  <FiX className="text-gray-500" />
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
                      <span>
                        {mode === "edit" ? "بروزرسانی مرحله" : "ذخیره مرحله"}
                      </span>
                      <FiSave className="text-white" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {!isFormVisible && (
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
                برای ایجاد مرحله جدید، روی دکمه
                <span className="font-medium">افزودن مرحله جدید</span> کلیک
                کنید.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AddProductionStep;
