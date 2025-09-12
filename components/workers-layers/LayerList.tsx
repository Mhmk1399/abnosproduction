"use client";

import { useState, useRef, useEffect } from "react";
import DynamicTable from "@/components/dynamiccomponents/DynamicTable";
import DynamicModal from "@/components/dynamiccomponents/DynamicModal";
import { TableConfig, DynamicTableRef } from "@/types/tables";
import { ModalConfig } from "@/components/dynamiccomponents/DynamicModal";
import { BarcodeService } from "@/services/barcodeService";

export interface ProductLayer extends Record<string, unknown> {
  _id: string;
  productionCode: string;
  glass?: any;
  treatments?: any[];
  width: number;
  height: number;
  product?: any;
  invoice?: any;
  productionLine?: any;
  productionDate: Date;
  currentStep?: any;
  currentInventory?: any;
  productionNotes?: string;
  designNumber?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LayerListProps {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function LayerList({ onDelete }: LayerListProps = {}) {
  const [selectedLayer, setSelectedLayer] = useState<ProductLayer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    title: "",
    type: "view",
  });
  const [steps, setSteps] = useState<{ label: string; value: string }[]>([]);
  const [inventories, setInventories] = useState<{ label: string; value: string }[]>([]);
  const tableRef = useRef<DynamicTableRef>(null);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch steps
        const stepsResponse = await fetch('/api/steps');
        const stepsData = await stepsResponse.json();
        console.log('LayerList - Steps data:', stepsData);
        
        if (stepsResponse.ok && stepsData.steps) {
          const stepOptions = stepsData.steps.map((step: any) => ({
            label: step.name,
            value: step._id,
          }));
          setSteps(stepOptions);
          console.log('LayerList - Step options:', stepOptions);
        }

        // Fetch inventories
        const inventoriesResponse = await fetch('/api/productionInventory');
        const inventoriesData = await inventoriesResponse.json();
        console.log('LayerList - Inventories data:', inventoriesData);
        
        if (inventoriesResponse.ok && inventoriesData.inventories) {
          const inventoryOptions = inventoriesData.inventories.map((inventory: any) => ({
            label: inventory.name,
            value: inventory._id,
          }));
          setInventories(inventoryOptions);
          console.log('LayerList - Inventory options:', inventoryOptions);
        }
      } catch (error) {
        console.error('LayerList - Error fetching filter options:', error);
      }
    };
    fetchFilterOptions();
  }, []);

  const handleView = (layer: ProductLayer) => {
    console.log('LayerList - Viewing layer:', layer);
    setSelectedLayer(layer);
    setModalConfig({
      title: `مشاهده اطلاعات لایه ${layer.productionCode}`,
      type: "view",
      size: "lg",
      fields: [
        { key: "productionCode", label: "کد تولید" },
        { key: "width", label: "عرض" },
        { key: "height", label: "ارتفاع" },
        { key: "productionDate", label: "تاریخ تولید" },
        { key: "productionNotes", label: "یادداشت تولید" },
      ],
      onClose: () => {
        setIsModalOpen(false);
        setSelectedLayer(null);
      },
    });
    setIsModalOpen(true);
  };

  const handleEdit = (layer: ProductLayer) => {
    console.log('LayerList - Editing layer:', layer);
    setSelectedLayer(layer);
    setModalConfig({
      title: `ویرایش لایه ${layer.productionCode}`,
      type: "edit",
      size: "lg",
      endpoint: `/api/productLayer/detailed`,
      method: "PATCH",
      fields: [
        {
          key: "productionCode",
          label: "کد تولید",
          type: "text",
          required: true,
          placeholder: "کد تولید را وارد کنید",
        },
        {
          key: "width",
          label: "عرض (میلی‌متر)",
          type: "number",
          required: true,
        },
        {
          key: "height",
          label: "ارتفاع (میلی‌متر)",
          type: "number",
          required: true,
        },
        {
          key: "productionDate",
          label: "تاریخ تولید",
          type: "date",
          required: true,
        },
        {
          key: "currentStep",
          label: "مرحله فعلی",
          type: "select",
          options: steps,
        },
        {
          key: "currentInventory",
          label: "انبار فعلی",
          type: "select",
          options: inventories,
        },
        {
          key: "productionNotes",
          label: "یادداشت تولید",
          type: "textarea",
        },
      ],
      onSuccess: () => {
        console.log('LayerList - Layer updated successfully');
        setIsModalOpen(false);
        setSelectedLayer(null);
        if (tableRef.current) {
          tableRef.current.refreshData();
        }
      },
      onError: (error) => {
        console.error('LayerList - Error updating layer:', error);
      },
      onClose: () => {
        setIsModalOpen(false);
        setSelectedLayer(null);
      },
    });
    setIsModalOpen(true);
  };

  const handlePrintBarcode = (layer: ProductLayer) => {
    console.log('LayerList - Printing barcode for layer:', layer);
    BarcodeService.printBarcode(layer._id, layer.productionCode);
  };



  const tableConfig: TableConfig = {
    title: "مدیریت لایه‌های تولید",
    description: "لیست لایه‌های تولید شده",
    endpoint: "/api/productLayer",
    enableFilters: true,
    columns: [
      {
        key: "productionCode",
        label: "کد تولید",
        sortable: true,
        filterable: true,
        filterType: "text",
      },
      {
        key: "glass.name",
        label: "نوع شیشه",
        sortable: true,
        render: (value, row) => {
          const layer = row as ProductLayer;
          return typeof layer.glass === "object" && layer.glass?.name
            ? layer.glass.name
            : "-";
        },
      },
      {
        key: "width",
        label: "عرض",
        sortable: true,
        filterable: true,
        filterType: "number",
        render: (value) => (value ? `${value} mm` : "-"),
      },
      {
        key: "height",
        label: "ارتفاع",
        sortable: true,
        filterable: true,
        filterType: "number",
        render: (value) => (value ? `${value} mm` : "-"),
      },
      {
        key: "dimensions",
        label: "ابعاد",
        render: (value, row) => {
          const layer = row as ProductLayer;
          return `${layer.width}×${layer.height}`;
        },
      },
      {
        key: "productionDate",
        label: "تاریخ تولید",
        type: "date",
        sortable: true,
        filterable: true,
        filterType: "dateRange",
      },
      {
        key: "currentStep.name",
        label: "مرحله فعلی",
        filterable: true,
        filterType: "select",
        filterKey: "currentStep",
        filterOptions: steps,
        render: (value, row) => {
          const layer = row as ProductLayer;
          console.log('LayerList - Current step render:', layer.currentStep);
          return typeof layer.currentStep === "object" &&
            layer.currentStep?.name
            ? layer.currentStep.name
            : "نامشخص";
        },
      },
      {
        key: "currentInventory.name",
        label: "انبار فعلی",
        filterable: true,
        filterType: "select",
        filterKey: "currentInventory",
        filterOptions: inventories,
        render: (value, row) => {
          const layer = row as ProductLayer;
          console.log('LayerList - Current inventory render:', layer.currentInventory);
          return typeof layer.currentInventory === "object" &&
            layer.currentInventory?.name
            ? layer.currentInventory.name
            : "نامشخص";
        },
      },
      {
        key: "treatments",
        label: "تعداد خدمات",
        render: (value) => {
          return Array.isArray(value) ? value.length.toString() : "0";
        },
      },
    ],
    actions: {
      view: true,
      edit: true,
      delete: false,
      custom: [
        {
          label: "چاپ بارکد",
          icon: "🖨️",
          className: "bg-blue-600 hover:bg-blue-700 text-white",
          onClick: handlePrintBarcode,
        },
      ],
    },
    onView: handleView,
    onEdit: handleEdit,
  };

  return (
    <div className="container mx-auto py-8" dir="rtl">
      <DynamicTable ref={tableRef} config={tableConfig} />

      {isModalOpen && (
        <DynamicModal
          isOpen={isModalOpen}
          config={modalConfig}
          itemId={selectedLayer?._id}
          initialData={selectedLayer || undefined}
        />
      )}
    </div>
  );
}
