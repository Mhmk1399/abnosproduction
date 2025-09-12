"use client";

import React, { useState, useEffect } from "react";
import DynamicTable from "../dynamiccomponents/DynamicTable";
import {
  FilterField,
  Layer,
  PriorityTableData,
  TableData,
} from "../../types/typesofdynamics";

interface InvoiceListProps {
  onRefresh?: () => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ onRefresh }) => {
  const [invoices, setInvoices] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  const columns: any[] = [
    {
      key: "invoice.priority.name",
      header: "اولویت",
      sortable: true,
      render: (value: any, row: any) => row.invoice?.priority?.name || "نامشخص",
    },
    {
      key: "invoice.customer.name",
      header: "نام مشتری",
      sortable: true,
      render: (value: any, row: any) => row.invoice?.customer?.name || "نامشخص",
    },
    {
      key: "glass.name",
      header: "نام شیشه",
      sortable: true,
      render: (value: any, row: any) => row.glass?.name || "نامشخص",
    },
    {
      key: "currentStep.name",
      header: "مرحله فعلی",
      sortable: true,
      render: (value: any, row: any) => row.currentStep?.name || "نامشخص",
    },
    {
      key: "invoice.createdAt",
      header: "تاریخ فاکتور",
      sortable: true,
      render: (value: any, row: any) =>
        new Date(row.invoice?.createdAt).toLocaleDateString("fa-IR"),
    },
    {
      key: "invoice.deliveryDate",
      header: "تاریخ تحویل",
      sortable: true,
      render: (value: any, row: any) =>
        new Date(row.invoice?.deliveryDate).toLocaleDateString("fa-IR"),
    },
    {
      key: "designNumber.name",
      header: "شماره طرح",
      sortable: true,
      render: (value: any, row: any) => row.designNumber?.name || "نامشخص",
    },
    {
      key: "invoice.layers.length",
      header: "تعداد لایه",
      sortable: false,
      render: (value: any, row: any) => row.invoice?.layers?.length || 0,
    },
    {
      key: "treatments",
      header: "پردازشها",
      sortable: false,
      render: (value: any, row: any) => {
        if (row.treatments && Array.isArray(row.treatments)) {
          return (
            row.treatments
              .map((t: any) => t.treatment?.name || "نامشخص")
              .join(", ") || "ندارد"
          );
        }
        return "ندارد";
      },
    },
    {
      key: "height",
      header: "ارتفاع",
      sortable: true,
    },
    {
      key: "width",
      header: "عرض",
      sortable: true,
    },
    {
      key: "productionDate",
      header: "تاریخ تولید",
      sortable: true,
      render: (value: any, row: any) =>
        new Date(row.productionDate).toLocaleDateString("fa-IR"),
    },
    {
      key: "productionCode",
      header: "کد تولید",
      sortable: true,
    },
  ];

  const filterFields: FilterField[] = [
    {
      key: "productionCode",
      label: "کد تولید",
      type: "text",
      placeholder: "جستجو بر اساس کد تولید...",
    },
    {
      key: "priority",
      label: "اولویت",
      type: "select",
      placeholder: "انتخاب اولویت",
      options: [
        { value: "high", label: "بالا" },
        { value: "medium", label: "متوسط" },
        { value: "low", label: "پایین" },
      ],
    },
    {
      key: "status",
      label: "وضعیت",
      type: "select",
      placeholder: "انتخاب وضعیت",
      options: [
        { value: "pending", label: "در انتظار" },
        { value: "in progress", label: "در حال انجام" },
        { value: "completed", label: "تکمیل شده" },
        { value: "cancelled", label: "لغو شده" },
        { value: "stop production", label: "توقف تولید" },
      ],
    },
    {
      key: "customer",
      label: "مشتری",
      type: "text",
      placeholder: "جستجو بر اساس نام مشتری...",
    },
    {
      key: "designNumber",
      label: "شماره طرح",
      type: "text",
      placeholder: "جستجو بر اساس شماره طرح...",
    },
    {
      key: "deliveryDate",
      label: "تاریخ تحویل",
      type: "dateRange",
      placeholder: "انتخاب بازه تاریخ تحویل",
    },
    {
      key: "createdAt",
      label: "تاریخ فاکتور",
      type: "dateRange",
      placeholder: "انتخاب بازه تاریخ فاکتور",
    },
  ];

  const fetchInvoices = async (filterParams = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      Object.entries(filterParams).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(","));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });

      const response = await fetch(`/api/invoices?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    fetchInvoices(newFilters);
  };

  const handleSort = (key: string, direction: "asc" | "desc") => {
    const sortedInvoices = [...invoices].sort((a, b) => {
      const aVal = key.includes(".") ? getNestedValue(a, key) : a[key];
      const bVal = key.includes(".") ? getNestedValue(b, key) : b[key];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let cmp = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }
      return direction === "asc" ? cmp : -cmp;
    });
    setInvoices(sortedInvoices);
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  const handleRefresh = () => {
    fetchInvoices(filters);
    onRefresh?.();
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">لیست فاکتورها</h1>
        <p className="text-gray-600">مدیریت و مشاهده تمام فاکتورهای سیستم</p>
      </div>

      <DynamicTable
        columns={columns}
        data={invoices}
        loading={loading}
        onSort={handleSort}
        onRefresh={handleRefresh}
        filterFields={filterFields}
        onFilterChange={handleFilterChange}
        showActions={true}
      />
    </div>
  );
};

export default InvoiceList;
