"use client";

import React from "react";
import { useProductionInventory } from "@/hooks/useProductionInventory";
import DynamicTable from "@/components/dynamicTable";
import { FormField, TableColumn, FilterField } from "@/types/typesofdynamics";
import { SHAPES } from "@/lib/shapes";
import toast from "react-hot-toast";

interface ProductionInventoryTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProductionInventoryTable: React.FC<ProductionInventoryTableProps> = ({
  onEdit,
  onDelete,
}) => {
  const { inventories, isLoading, mutate } = useProductionInventory();

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

  const tableColumns: TableColumn[] = [
    {
      key: "name",
      header: "نام انبار",
      sortable: true,
    },
    {
      key: "code",
      header: "کد انبار",
      sortable: true,
    },
    {
      key: "Capacity",
      header: "ظرفیت",
      sortable: true,
    },
    {
      key: "location",
      header: "موقعیت",
      sortable: true,
    },
    {
      key: "shapeCode",
      header: "شکل",
      sortable: true,
      render: (value) => {
        const shape = SHAPES.find((s) => s.code === value);
        console.log(shape);
        return shape ? shape.name : "نامشخص";
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
    {
      key: "createdAt",
      header: "تاریخ ایجاد",
      sortable: true,
      render: (value) => {
        return value
          ? new Date(value as string).toLocaleDateString("fa-IR")
          : "-";
      },
    },
  ];

  const filterFields: FilterField[] = [
    {
      key: "name",
      label: "نام انبار",
      type: "text",
      placeholder: "جستجو در نام انبار...",
    },
    {
      key: "location",
      label: "موقعیت",
      type: "text",
      placeholder: "جستجو در موقعیت...",
    },
    {
      key: "shapeCode",
      label: "شکل",
      type: "select",
      placeholder: "انتخاب شکل",
      options: SHAPES.map((shape) => ({
        label: shape.name,
        value: shape.code,
      })),
    },
  ];

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch("/api/productionInventory/detailed", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          id: id,
        },
      });

      if (response.ok) {
        toast.success("انبار با موفقیت حذف شد");
        mutate();
        onDelete(id);
      } else {
        toast.error("خطا در حذف انبار");
      }
    } catch (error) {
      console.error("Error deleting inventory:", error);
      toast.error("خطا در حذف انبار");
    }
  };

  return (
    <DynamicTable
      columns={tableColumns}
      data={inventories}
      loading={isLoading}
      formFields={formFields}
      endpoint="/api/productionInventory/detailed"
      formTitle="ویرایش انبار"
      formSubtitle="لطفا اطلاعات انبار را ویرایش کنید"
      onRefresh={mutate}
      onDelete={handleDelete}
      showActions={true}
      filterFields={filterFields}
    />
  );
};

export default ProductionInventoryTable;
