"use client";

import React, { useState, useEffect } from "react";
import DynamicForm from "@/components/dynamiccomponents/DynamicForm";
import { FormConfig } from "@/types/form";
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

  const formConfig: FormConfig = {
    title: "افزودن مرحله جدید",
    description: "لطفا اطلاعات مرحله را وارد کنید",
    endpoint: "/api/steps",
    method: "POST",
    fields: [
      {
        name: "name",
        label: "نام مرحله",
        type: "text",
        required: true,
        placeholder: "نام مرحله را وارد کنید",
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
        type: "select",
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
      },
    ],
    onSuccess: () => {
      toast.success("مرحله با موفقیت ثبت شد");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error || "خطا در ثبت مرحله");
    },
  };

  return <DynamicForm config={formConfig} />;
};

export default ProductionStepsForm;
