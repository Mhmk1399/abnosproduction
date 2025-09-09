"use client";

import React from "react";
import DynamicForm from "@/components/dynamicForm";
import { FormField } from "@/types/typesofdynamics";
import { SHAPES } from "@/lib/shapes";
import toast from "react-hot-toast";

interface ProductionInventoryFormProps {
  onSuccess: () => void;
}

const ProductionInventoryForm: React.FC<ProductionInventoryFormProps> = ({
  onSuccess,
}) => {
  const formFields: FormField[] = [
    {
      name: "name",
      label: "نام انبار",
      type: "text",
      placeholder: "نام انبار را وارد کنید",
      validation: [{ type: "required", message: "نام انبار الزامی است" }],
    },
    {
      name: "Capacity",
      label: "ظرفیت",
      type: "number",
      placeholder: "ظرفیت انبار را وارد کنید",
      validation: [{ type: "required", message: "ظرفیت الزامی است" }],
    },
    {
      name: "location",
      label: "موقعیت",
      type: "text",
      placeholder: "موقعیت انبار را وارد کنید",
      validation: [{ type: "required", message: "موقعیت الزامی است" }],
    },
    {
      name: "shapeCode",
      label: "شکل",
      type: "select",
      placeholder: "شکل را انتخاب کنید",
      validation: [{ type: "required", message: "شکل الزامی است" }],
      options: SHAPES.map(shape => ({
        label: shape.name,
        value: shape.code,
      })),
    },
    {
      name: "description",
      label: "توضیحات",
      type: "textarea",
      placeholder: "توضیحات اضافی را وارد کنید (اختیاری)",
      rows: 3,
    },
  ];

  const handleFormSuccess = (data: any) => {
    toast.success("انبار با موفقیت ثبت شد");
    onSuccess();
  };

  const handleFormError = (error: Error) => {
    toast.error(error.message || "خطا در ثبت انبار");
  };

  return (
    <DynamicForm
      title="افزودن انبار جدید"
      subtitle="لطفا اطلاعات انبار را وارد کنید"
      fields={formFields}
      endpoint="/api/productionInventory"
      method="POST"
      submitButtonText="ذخیره انبار"
      cancelButtonText="پاک کردن"
      onSuccess={handleFormSuccess}
      onError={handleFormError}
      resetAfterSubmit={true}
    />
  );
};

export default ProductionInventoryForm;