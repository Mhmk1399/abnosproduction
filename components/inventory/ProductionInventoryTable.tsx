"use client";

import React, { useState, useEffect } from "react";
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
  onDelete,
}) => {
  const { inventories, isLoading, mutate } = useProductionInventory();
  const [products, setProducts] = useState<{ label: string; value: string }[]>(
    []
  );
  console.log(inventories);

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
      name: "code",
      label: "کد",
      type: "text",
      placeholder: "کد انبار را وارد کنید",
      validation: [{ type: "required", message: "کد الزامی است" }],
    },
    {
      name: "productwidth",
      label: "عرض محصول",
      type: "number",
      placeholder: "عرض محصول را وارد کنید",
    },
    {
      name: "productheight",
      label: "ارتفاع محصول",
      type: "number",
      placeholder: "ارتفاع محصول را وارد کنید",
    },
    {
      name: "productthikness",
      label: "ضخامت محصول",
      type: "number",
      placeholder: "ضخامت محصول را وارد کنید",
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

  const tableColumns: TableColumn[] = [
    {
      key: "name",
      header: "نام انبار",
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
      key: "productthikness",
      header: "ضخامت",
      sortable: true,
      render: (value) => {
        console.log("productthikness value:", value);
        return value !== null && value !== undefined ? value.toString() : "-";
      },
    },
    {
      key: "productheight",
      header: "ارتفاع",
      sortable: true,
      render: (value) => {
        console.log("productheight value:", value);
        return value !== null && value !== undefined ? value.toString() : "-";
      },
    },
    {
      key: "productwidth",
      header: "عرض",
      sortable: true,
      render: (value) => {
        console.log("productwidth value:", value);
        return value !== null && value !== undefined ? value.toString() : "-";
      },
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
      key: "products",
      header: "محصولات",
      render: (value) => {
        if (Array.isArray(value) && value.length > 0) {
          return value
            .map((product: any) => product.name || product)
            .join(", ");
        }
        return "-";
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

  // Debug logging
  console.log("Inventories data:", inventories);
  if (inventories && inventories.length > 0) {
    console.log("First inventory item:", inventories[0]);
  }

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
