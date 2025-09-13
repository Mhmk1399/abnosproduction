"use client";

import { useState, useRef, useEffect } from "react";
import DynamicTable from "@/components/dynamiccomponents/DynamicTable";
import DynamicModal from "@/components/dynamiccomponents/DynamicModal";
import { TableConfig, DynamicTableRef } from "@/types/tables";
import { ModalConfig } from "@/components/dynamiccomponents/DynamicModal";
import toast from "react-hot-toast";

export interface ProductionStep extends Record<string, unknown> {
  _id: string;
  name: string;
  code?: string;
  type: string;
  requiresScan: boolean;
  handlesTreatments?: any[];
  password?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductionStepsTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProductionStepsTable: React.FC<ProductionStepsTableProps> = ({
  onDelete,
}) => {
  const [selectedStep, setSelectedStep] = useState<ProductionStep | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    title: "",
    type: "view",
  });
  const [treatments, setTreatments] = useState<
    { label: string; value: string }[]
  >([]);
  const [availableSteps, setAvailableSteps] = useState<
    { label: string; value: string }[]
  >([]);
  const tableRef = useRef<DynamicTableRef>(null);

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

  const handleView = (step: ProductionStep) => {
    setSelectedStep(step);
    setModalConfig({
      title: `مشاهده اطلاعات مرحله ${step.name}`,
      type: "view",
      size: "md",
      fields: [
        { key: "name", label: "نام مرحله" },
        { key: "code", label: "کد" },
        { key: "type", label: "نوع" },
        { key: "requiresScan", label: "نیاز به اسکن" },
        { key: "description", label: "توضیحات" },
      ],
      onClose: () => {
        setIsModalOpen(false);
        setSelectedStep(null);
      },
    });
    setIsModalOpen(true);
  };

  const handleEdit = (step: ProductionStep) => {
    setSelectedStep(step);
    setModalConfig({
      title: `ویرایش مرحله ${step.name}`,
      type: "edit",
      size: "md",
      endpoint: `/api/steps/detailed`,
      method: "PATCH",
      fields: [
        {
          key: "name",
          label: "نام مرحله",
          type: "text",
          required: true,
          placeholder: "نام مرحله را وارد کنید",
        },
        {
          key: "code",
          label: "کد مرحله",
          type: "text",
          placeholder: "کد مرحله را وارد کنید",
        },
        {
          key: "type",
          label: "نوع مرحله",
          type: "select",
          required: true,
          options: [
            { label: "تولید", value: "step" },
            { label: "استقرار", value: "shelf" },
          ],
        },
        {
          key: "requiresScan",
          label: "نیاز به اسکن",
          type: "checkbox",
        },
        {
          key: "dependencies",
          label: "مرحله وابسته",
          type: "select",
          options: availableSteps,
        },
        {
          key: "handlesTreatments",
          label: "خدمات مرتبط",
          type: "select",
          options: treatments,
        },
        {
          key: "password",
          label: "رمز عبور",
          type: "password",
          placeholder: "رمز عبور را وارد کنید",
        },
        {
          key: "description",
          label: "توضیحات",
          type: "textarea",
        },
      ],
      onSuccess: () => {
        toast.success("مرحله با موفقیت بروزرسانی شد");
        setIsModalOpen(false);
        setSelectedStep(null);
        if (tableRef.current) {
          tableRef.current.refreshData();
        }
      },
      onError: (error) => {
        toast.error(`خطا در بروزرسانی مرحله: ${error}`);
      },
      onClose: () => {
        setIsModalOpen(false);
        setSelectedStep(null);
      },
    });
    setIsModalOpen(true);
  };

  const handleDelete = (step: ProductionStep) => {
    setSelectedStep(step);
    setModalConfig({
      title: `حذف مرحله`,
      type: "delete",
      endpoint: `/api/steps/detailed`,
      method: "DELETE",
      onSuccess: () => {
        toast.success("مرحله با موفقیت حذف شد");
        setIsModalOpen(false);
        setSelectedStep(null);
        onDelete(step._id);
        if (tableRef.current) {
          tableRef.current.refreshData();
        }
      },
      onError: (error) => {
        toast.error(`خطا در حذف مرحله: ${error}`);
      },
      onClose: () => {
        setIsModalOpen(false);
        setSelectedStep(null);
      },
    });
    setIsModalOpen(true);
  };

  const tableConfig: TableConfig = {
    title: "مدیریت مراحل تولید",
    description: "لیست مراحل تولید",
    endpoint: "/api/steps",
    enableFilters: true,
    columns: [
      {
        key: "name",
        label: "نام مرحله",
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
        key: "type",
        label: "نوع",
        sortable: true,
        filterable: true,
        filterType: "select",
        filterOptions: [
          { label: "تولید", value: "step" },
          { label: "استقرار", value: "shelf" },
        ],
        render: (value:unknown,row: Record<string, unknown>) => {
          return value === "step"
            ? "تولید"
            : value === "shelf"
            ? "استقرار"
            : value || "-";
        },
      },
      {
        key: "requiresScan",
        label: "نیاز به اسکن",
        filterable: true,
        filterType: "select",
        filterOptions: [
          { label: "بله", value: "true" },
          { label: "خیر", value: "false" },
        ],
        render: (value, row) => {
          return value ? "بله" : "خیر";
        },
      },
      {
        key: "dependencies.name",
        label: "مرحله وابسته",
        render: (value, row) => {
          const step = row as any;
          return typeof step.dependencies === "object" &&
            step.dependencies?.name
            ? step.dependencies.name
            : "-";
        },
      },
      {
        key: "handlesTreatments",
        label: "خدمات مرتبط",
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
          itemId={selectedStep?._id}
          initialData={selectedStep || undefined}
        />
      )}
    </div>
  );
};

export default ProductionStepsTable;
