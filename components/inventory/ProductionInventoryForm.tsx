"use client";

import React, { useState, useEffect } from "react";
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
  const [products, setProducts] = useState<{ label: string; value: string }[]>(
    []
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        if (response.ok && data) {
          const productOptions = (
            Array.isArray(data) ? data : data.data || []
          ).map((product: any) => ({
            label: product.name,
            value: product._id,
          }));
          setProducts(productOptions);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

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
      name: "productwidth",
      label: "عرض مصحولات",
      type: "number",
      placeholder: "حداکثر عرض محصولات را وارد کنید",
      validation: [
        { type: "required", message: "حداکثر عرض محصولات الزامی است" },
      ],
    },
    {
      name: "productheight",
      label: "ارتفا مصحولات",
      type: "number",
      placeholder: "حداکثر ارتفا محصولات را وارد کنید",
      validation: [
        { type: "required", message: "حداکثر ارتفا محصولات الزامی است" },
      ],
    },
    {
      name: "productthikness",
      label: "ضخامت مصحولات",
      type: "number",
      placeholder: "حداکثر ضخامت محصولات را وارد کنید",
      validation: [
        { type: "required", message: "حداکثر ضخامت  محصولات الزامی است" },
      ],
    },
    {
      name: "shapeCode",
      label: "شکل",
      type: "select",
      placeholder: "شکل را انتخاب کنید",
      validation: [{ type: "required", message: "شکل الزامی است" }],
      options: SHAPES.map((shape) => ({
        label: shape.name,
        value: shape.code,
      })),
    },
    {
      name: "products",
      label: "محصولات",
      type: "multiselect",
      placeholder: "محصولات را انتخاب کنید",
      options: products,
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
