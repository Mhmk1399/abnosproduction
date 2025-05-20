"use client";
import React, { useState } from "react";
import { useProductionLines } from "@/hooks/useProductionLines";
import ProductionLineVisualizer from "@/components/ProductionLine/ProductionLineVisualizer";
import ProductionLineStatus from "@/components/ProductionLine/ProductionLineStatus";
import ProductionLineMetrics from "@/components/ProductionLine/ProductionLineMetrics";
import Link from "next/link";
import {
  FiPlus,
  FiRefreshCw,
  FiList,
  FiGrid,
  FiSettings,
  FiEdit,
  FiTrash2,
  FiEye,
} from "react-icons/fi";

const ProductionLine = ({
  setActiveChild,
}: {
  setActiveChild: (child: string) => void;
}) => {
  const { productionLines, isLoading, deleteProductionLine, mutate } =
    useProductionLines();
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm("آیا از حذف این خط تولید اطمینان دارید؟")) {
      setIsDeleting(true);
      try {
        await deleteProductionLine(id);
        await mutate();
      } catch (error) {
        console.error("Error deleting production line:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-6 mt-20" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">مدیریت خطوط تولید</h1>
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              title="نمای لیستی"
            >
              <FiList />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              title="نمای گرید"
            >
              <FiGrid />
            </button>
          </div>
          <button
            onClick={() => mutate()}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            <FiRefreshCw
              className={`text-gray-600 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>بروزرسانی</span>
          </button>
          <button
            onClick={() => setActiveChild("configure")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus />
            <span>خط تولید جدید</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ProductionLineMetrics />
        </div>
        <div>
          <ProductionLineStatus />
        </div>
      </div>

      {/* Production Lines View */}

      {viewMode === "grid" && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FiGrid className="text-gray-600" />
              <span>نمای گرافیکی خطوط تولید</span>
            </h2>
          </div>

          <ProductionLineVisualizer />
        </div>
      )}

      {viewMode === "list" && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FiList className="text-gray-600" />
              <span>لیست خطوط تولید</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    نام
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    کد
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    وضعیت
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    مراحل
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productionLines.map((line) => (
                  <tr key={line._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FiSettings className="text-blue-600" />
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">
                            {line.name}
                          </div>
                          {line.description && (
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {line.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">
                        {line.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          line.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {line.active ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {line.steps?.length || 0} مرحله
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/production-lines/view/${line._id}`}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="مشاهده"
                        >
                          <FiEye />
                        </Link>
                        <Link
                          href={`/production-lines/edit/${line._id}`}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="ویرایش"
                        >
                          <FiEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(line._id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                          title="حذف"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {productionLines.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      هیچ خط تولیدی یافت نشد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionLine;
