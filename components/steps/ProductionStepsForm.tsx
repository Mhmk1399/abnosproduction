"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  const [availableSteps, setAvailableSteps] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch treatments
        const treatmentsResponse = await fetch("/api/glassTreatments");
        const treatmentsData = await treatmentsResponse.json();
        if (treatmentsResponse.ok && treatmentsData) {
          const treatmentOptions = (
            Array.isArray(treatmentsData)
              ? treatmentsData
              : treatmentsData.data || []
          ).map((treatment: any) => ({
            label: treatment.name,
            value: treatment._id,
          }));
          setTreatments(treatmentOptions);
        }

        // Fetch available steps
        const stepsResponse = await fetch("/api/steps");
        const stepsData = await stepsResponse.json();
        if (stepsResponse.ok && stepsData.steps) {
          const stepOptions = stepsData.steps.map((step: any) => ({
            label: step.name,
            value: step._id,
          }));
          setAvailableSteps(stepOptions);
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };
    fetchOptions();
  }, []);

  const formConfig: FormConfig = useMemo(
    () => ({
      title: "افزودن مرحله جدید",
      description: "لطفا اطلاعات مرحله را وارد کنید",
      endpoint: "/api/steps",
      submitButtonText: "ثبت",
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
          name: "dependencies",
          label: "مرحله وابسته",
          type: "select",
          placeholder: "مرحله وابسته را انتخاب کنید (اختیاری)",
          options: availableSteps,
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
    }),
    [treatments, availableSteps, onSuccess]
  );

  return <DynamicForm config={formConfig} />;
};

export default ProductionStepsForm;
