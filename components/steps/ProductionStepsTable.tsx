"use client";

import React, { useState, useEffect } from "react";
import { useProductionStep } from "@/hooks/useProductionStep";
import DynamicTable from "@/components/dynamicTable";
import { FormField, TableColumn, FilterField } from "@/types/typesofdynamics";
import toast from "react-hot-toast";

interface ProductionStepsTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProductionStepsTable: React.FC<ProductionStepsTableProps> = ({
  onDelete,
}) => {
  const { steps, isLoading, mutate } = useProductionStep();
  console.log(steps);
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

  const tableColumns: TableColumn[] = [
    {
      key: "name",
      header: "نام مرحله",
      sortable: true,
    },
    {
      key: "code",
      header: "کد",
      sortable: true,
    },
    {
      key: "type",
      header: "نوع",
      sortable: true,
      render: (value) => {
        return value === "step"
          ? "تولید"
          : value === "shelf"
          ? "استقرار"
          : value || "-";
      },
    },
    {
      key: "requiresScan",
      header: "نیاز به اسکن",
      render: (value) => {
        return value ? "بله" : "خیر";
      },
    },
    {
      key: "handlesTreatments",
      header: "خدمات مرتبط",
      render: (value) => {
        if (Array.isArray(value) && value.length > 0) {
          return value
            .map((treatment: any) => treatment.name || treatment)
            .join(", ");
        }
        return "-";
      },
    },
    {
      key: "description",
      header: "توضیحات",
      render: (value) => {
        const desc = value as string;
        return desc
          ? desc.length > 50
            ? `${desc.substring(0, 50)}...`
            : desc
          : "-";
      },
    },
  ];

  const filterFields: FilterField[] = [
    {
      key: "name",
      label: "نام مرحله",
      type: "text",
      placeholder: "جستجو در نام مرحله...",
    },
    {
      key: "type",
      label: "نوع مرحله",
      type: "select",
      placeholder: "انتخاب نوع",
      options: [
        { label: "تولید", value: "step" },
        { label: "استقرار", value: "shelf" },
      ],
    },
  ];

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch("/api/steps/detailed", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          id: id,
        },
      });

      if (response.ok) {
        toast.success("مرحله با موفقیت حذف شد");
        mutate();
        onDelete(id);
      } else {
        toast.error("خطا در حذف مرحله");
      }
    } catch (error) {
      console.error("Error deleting step:", error);
      toast.error("خطا در حذف مرحله");
    }
  };

  return (
    <DynamicTable
      columns={tableColumns}
      data={steps}
      loading={isLoading}
      formFields={formFields}
      endpoint="/api/steps/detailed"
      formTitle="ویرایش مرحله"
      formSubtitle="لطفا اطلاعات مرحله را ویرایش کنید"
      onRefresh={mutate}
      onDelete={handleDelete}
      showActions={true}
      filterFields={filterFields}
    />
  );
};

export default ProductionStepsTable;
