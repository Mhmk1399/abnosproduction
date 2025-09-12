"use client";

import { useState, useRef } from "react";
import DynamicTable from "@/components/dynamiccomponents/DynamicTable";
import DynamicModal from "@/components/dynamiccomponents/DynamicModal";
import { TableConfig, DynamicTableRef } from "@/types/tables";
import { ModalConfig } from "@/components/dynamiccomponents/DynamicModal";
import { SHAPES } from "@/lib/shapes";
import toast from "react-hot-toast";

export interface ProductionInventory extends Record<string, unknown> {
  _id: string;
  name: string;
  Capacity: number;
  location: string;
  code: string;
  shapeCode: string;
  productwidth?: number;
  productheight?: number;
  productthikness?: number;
  products?: any[];
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductionInventoryTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProductionInventoryTable: React.FC<ProductionInventoryTableProps> = ({
  onDelete,
}) => {
  const [selectedInventory, setSelectedInventory] =
    useState<ProductionInventory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    title: "",
    type: "view",
  });
  const tableRef = useRef<DynamicTableRef>(null);

  const handleView = (inventory: ProductionInventory) => {
    setSelectedInventory(inventory);
    setModalConfig({
      title: `مشاهده اطلاعات انبار ${inventory.name}`,
      type: "view",
      size: "md",
      fields: [
        { key: "name", label: "نام انبار" },
        { key: "code", label: "کد" },
        { key: "Capacity", label: "ظرفیت" },
        { key: "location", label: "موقعیت" },
        { key: "productwidth", label: "عرض محصول" },
        { key: "productheight", label: "ارتفاع محصول" },
        { key: "productthikness", label: "ضخامت محصول" },
        { key: "description", label: "توضیحات" },
      ],
      onClose: () => {
        setIsModalOpen(false);
        setSelectedInventory(null);
      },
    });
    setIsModalOpen(true);
  };

  const handleEdit = (inventory: ProductionInventory) => {
    setSelectedInventory(inventory);
    setModalConfig({
      title: `ویرایش انبار ${inventory.name}`,
      type: "edit",
      size: "md",
      endpoint: `/api/productionInventory/detailed`,
      method: "PATCH",
      fields: [
        {
          key: "name",
          label: "نام انبار",
          type: "text",
          required: true,
          placeholder: "نام انبار را وارد کنید",
        },
        {
          key: "Capacity",
          label: "ظرفیت",
          type: "number",
          required: true,
        },
        {
          key: "location",
          label: "موقعیت",
          type: "text",
          required: true,
        },
        {
          key: "productwidth",
          label: "عرض محصول",
          type: "number",
        },
        {
          key: "productheight",
          label: "ارتفاع محصول",
          type: "number",
        },
        {
          key: "productthikness",
          label: "ضخامت محصول",
          type: "number",
        },
        {
          key: "shapeCode",
          label: "شکل",
          type: "select",
          required: true,
          options: SHAPES.map((shape) => ({
            value: shape.code,
            label: shape.name,
          })),
        },
        {
          key: "description",
          label: "توضیحات",
          type: "textarea",
        },
      ],
      onSuccess: () => {
        toast.success("انبار با موفقیت بروزرسانی شد");
        setIsModalOpen(false);
        setSelectedInventory(null);
        if (tableRef.current) {
          tableRef.current.refreshData();
        }
      },
      onError: (error) => {
        toast.error(`خطا در بروزرسانی انبار: ${error}`);
      },
      onClose: () => {
        setIsModalOpen(false);
        setSelectedInventory(null);
      },
    });
    setIsModalOpen(true);
  };

  const handleDelete = (inventory: ProductionInventory) => {
    setSelectedInventory(inventory);
    setModalConfig({
      title: `حذف انبار`,
      type: "delete",
      endpoint: `/api/productionInventory/detailed`,
      method: "DELETE",
      onSuccess: () => {
        toast.success("انبار با موفقیت حذف شد");
        setIsModalOpen(false);
        setSelectedInventory(null);
        onDelete(inventory._id);
        if (tableRef.current) {
          tableRef.current.refreshData();
        }
      },
      onError: (error) => {
        toast.error(`خطا در حذف انبار: ${error}`);
      },
      onClose: () => {
        setIsModalOpen(false);
        setSelectedInventory(null);
      },
    });
    setIsModalOpen(true);
  };

  const tableConfig: TableConfig = {
    title: "مدیریت انبار تولید",
    description: "لیست انبارهای تولید",
    endpoint: "/api/productionInventory",
    enableFilters: true,

    columns: [
      {
        key: "name",
        label: "نام انبار",
        sortable: true,
        filterable: true,
        filterType: "text",
      },
      {
        key: "code",
        label: "کد",
        sortable: true,
        filterable: true,
        filterType: "text",
      },
      {
        key: "Capacity",
        label: "ظرفیت",
        sortable: true,
      },
      {
        key: "location",
        label: "موقعیت",
        sortable: true,
        filterable: true,
        filterType: "text",
      },
      {
        key: "productwidth",
        label: "عرض",
        sortable: true,
        render: (value) => (value ? value.toString() : "-"),
      },
      {
        key: "productheight",
        label: "ارتفاع",
        sortable: true,
        render: (value) => (value ? value.toString() : "-"),
      },
      {
        key: "productthikness",
        label: "ضخامت",
        sortable: true,
        render: (value) => (value ? value.toString() : "-"),
      },
      {
        key: "shapeCode",
        label: "شکل",
        sortable: true,
        filterable: true,
        filterType: "select",
        filterOptions: SHAPES.map((shape) => ({
          value: shape.code,
          label: shape.name,
        })),
        render: (value) => {
          const shape = SHAPES.find((s) => s.code === value);
          return shape ? shape.name : "نامشخص";
        },
      },
      {
        key: "description",
        label: "توضیحات",
        render: (value) => {
          const desc = value as string;
          return desc && desc.length > 50
            ? `${desc.substring(0, 50)}...`
            : desc || "-";
        },
      },
    ],
    actions: {
      view: true,
      edit: true,
      delete: true,
    },
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  };

  return (
    <div className="container mx-auto py-8" dir="rtl">
      <DynamicTable ref={tableRef} config={tableConfig} />

      {isModalOpen && (
        <DynamicModal
          isOpen={isModalOpen}
          config={modalConfig}
          itemId={selectedInventory?._id}
          initialData={selectedInventory || undefined}
        />
      )}
    </div>
  );
};

export default ProductionInventoryTable;
