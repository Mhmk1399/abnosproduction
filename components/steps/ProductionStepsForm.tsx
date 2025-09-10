"use client";

import React, { useState, useEffect } from "react";
import DynamicForm from "@/components/dynamicForm";
import { FormField } from "@/types/typesofdynamics";
import toast from "react-hot-toast";

interface ProductionStepsFormProps {
  onSuccess: () => void;
}

const ProductionStepsForm: React.FC<ProductionStepsFormProps> = ({
  onSuccess,
}) => {
  const [treatments, setTreatments] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const response = await fetch("/api/glassTreatments");
        console.log(response);
        const data = await response.json();
        if (response.ok && data) {
          const treatmentOptions = (
            Array.isArray(data) ? data : data.data || []
          ).map((treatment: any) => ({
            label: treatment.name,
            value: treatment._id,
          }));
          setTreatments(treatmentOptions);
        }
      } catch (error) {
        console.error("Error fetching treatments:", error);
      }
    };
    fetchTreatments();
  }, []);

  const formFields: FormField[] = [
    {
      name: "name",
      label: "نام مرحله",
      type: "text",
      placeholder: "نام مرحله را وارد کنید",
      validation: [{ type: "required", message: "نام مرحله الزامی است" }],
    },
    {
      name: "code",
      label: "کد مرحله",
      type: "text",
      placeholder: "کد مرحله را وارد کنید (اختیاری)",
    },
    {
      name: "type",
      label: "نوع مرحله",
      type: "select",
      placeholder: "نوع مرحله را انتخاب کنید",
      options: [
        { label: "تولید", value: "step" },
        { label: "استقرار", value: "shelf" },
      ],
    },
    {
      name: "requiresScan",
      label: "نیاز به اسکن",
      type: "checkbox",
    },
    {
      name: "handlesTreatments",
      label: "خدمات مرتبط",
      type: "multiselect",
      placeholder: "خدمات مرتبط را انتخاب کنید",
      options: treatments,
    },
    {
      name: "password",
      label: "رمز عبور",
      type: "password",
      placeholder: "رمز عبور را وارد کنید (اختیاری)",
    },
    {
      name: "description",
      label: "توضیحات",
      type: "textarea",
      placeholder: "توضیحات مرحله را وارد کنید (اختیاری)",
      rows: 3,
    },
  ];

  const handleFormSuccess = (data: any) => {
    toast.success("مرحله با موفقیت ثبت شد");
    onSuccess();
  };

  const handleFormError = (error: Error) => {
    toast.error(error.message || "خطا در ثبت مرحله");
  };

  return (
    <DynamicForm
      title="افزودن مرحله جدید"
      subtitle="لطفا اطلاعات مرحله را وارد کنید"
      fields={formFields}
      endpoint="/api/steps"
      method="POST"
      submitButtonText="ذخیره مرحله"
      cancelButtonText="پاک کردن"
      onSuccess={handleFormSuccess}
      onError={handleFormError}
      resetAfterSubmit={true}
    />
  );
};

export default ProductionStepsForm;
