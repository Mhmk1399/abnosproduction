"use client";

import React, { useState, useEffect } from "react";
import DynamicForm from "@/components/dynamiccomponents/DynamicForm";
import { FormField } from "@/types/typesofdynamics";
import { FormConfig } from "@/types/form";
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

  const handleFormSuccess = (data: any) => {
    toast.success("انبار با موفقیت ثبت شد");
    onSuccess();
  };

  const handleFormError = (error: Error) => {
    toast.error(error.message || "خطا در ثبت انبار");
  };

  const config: FormConfig = {
    title: "افزودن انبار جدید",
    description: "لطفا اطلاعات انبار را وارد کنید",
    endpoint: "/api/productionInventory",
    method: "POST",
    successMessage: "انبار با موفقیت ثبت شد",
    submitButtonText:"ثبت",
    errorMessage: "خطا در ثبت انبار",
    onSuccess: handleFormSuccess,
    onError: (error) => handleFormError(new Error(error)),
    fields: [
      {
        name: "name",
        label: "نام انبار",
        type: "text",
        placeholder: "نام انبار را وارد کنید",
        required: true,
      },
      {
        name: "Capacity",
        label: "ظرفیت",
        type: "number",
        placeholder: "ظرفیت انبار را وارد کنید",
        required: true,
      },
      {
        name: "location",
        label: "موقعیت",
        type: "text",
        placeholder: "موقعیت انبار را وارد کنید",
        required: true,
      },
      {
        name: "productwidth",
        label: "عرض محصولات",
        type: "number",
        placeholder: "حداکثر عرض محصولات را وارد کنید",
        required: true,
      },
      {
        name: "productheight",
        label: "ارتفاع محصولات",
        type: "number",
        placeholder: "حداکثر ارتفاع محصولات را وارد کنید",
        required: true,
      },
      {
        name: "productthikness",
        label: "ضخامت محصولات",
        type: "number",
        placeholder: "حداکثر ضخامت محصولات را وارد کنید",
        required: true,
      },
      {
        name: "shapeCode",
        label: "شکل",
        type: "select",
        placeholder: "شکل را انتخاب کنید",
        required: true,
        options: SHAPES.map((shape) => ({
          label: shape.name,
          value: shape.code,
        })),
      },
      {
        name: "products",
        label: "محصولات",
        type: "select",
        placeholder: "محصولات را انتخاب کنید",
        options: products,
      },
      {
        name: "description",
        label: "توضیحات",
        type: "textarea",
        placeholder: "توضیحات اضافی را وارد کنید (اختیاری)",
      },
    ],
  };

  return <DynamicForm config={config} />;
};

export default ProductionInventoryForm;
