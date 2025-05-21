"use client";
import React, { useState } from "react";
import { useProductionLines } from "@/hooks/useProductionLines";
import ProductionLineVisualizer from "@/components/ProductionLine/ProductionLineVisualizer";
import ProductionLineStatus from "@/components/ProductionLine/ProductionLineStatus";
import ProductionLineMetrics from "@/components/ProductionLine/ProductionLineMetrics";
import {
  FiPlus,
  FiList,
  FiGrid,
  FiSettings,
  FiEdit,
  FiTrash2,
  FiEye,
  FiClock,
  FiAlertTriangle,
  FiBarChart2,
  FiCheckCircle,
  FiX,
  FiLayers,
  FiCalendar,
} from "react-icons/fi";
import { FaSyncAlt } from "react-icons/fa";

const ProductionLine = ({
  setActiveChild,
}: {
  setActiveChild: (child: string) => void;
}) => {
  const [selectedProductionLineId, setSelectedProductionLineId] = useState<
    string | null
  >(null);
  const { productionLines, deleteProductionLine, mutate } =
    useProductionLines();
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [isDeleting, setIsDeleting] = useState(false);

  console.log(setSelectedProductionLineId);

  // filters state

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
      {/* Header Section with Improved Styling */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            مدیریت خطوط تولید
          </h1>
          <p className="text-sm text-gray-500">
            مدیریت و نظارت بر خطوط تولید و مراحل آن‌ها
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle with Improved Styling */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-l-lg transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-blue-50 text-blue-600 border-r border-blue-100"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              title="نمای لیستی"
            >
              <FiList />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-r-lg transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-blue-50 text-blue-600 border-l border-blue-100"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              title="نمای گرید"
            >
              <FiGrid />
            </button>
          </div>

          {/* Refresh Button with Loading State */}
          <button
            onClick={() => mutate()}
            className="flex items-center px-4 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-200 shadow-sm"
          >
            <FaSyncAlt className="h-4 w-4 ml-2" />
            <span>بروزرسانی</span>
          </button>

          {/* Add New Button with Animation */}
          <button
            onClick={() => setActiveChild("configure")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow transform hover:-translate-y-0.5"
          >
            <FiPlus />
            <span>خط تولید جدید</span>
          </button>
        </div>
      </div>

      {/* Status Cards with Improved Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition-all duration-200 hover:shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            آمار و شاخص‌ها
          </h3>
          <ProductionLineMetrics />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition-all duration-200 hover:shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            وضعیت خطوط تولید
          </h3>
          <ProductionLineStatus />
        </div>
      </div>

      {/* Filter Section */}
      {/* <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              وضعیت
            </label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              مرتب‌سازی
            </label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="newest">جدیدترین</option>
              <option value="oldest">قدیمی‌ترین</option>
              <option value="name">نام (الفبا)</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تعداد مراحل
            </label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">همه</option>
              <option value="0">بدون مرحله</option>
              <option value="1-3">1 تا 3 مرحله</option>
              <option value="4+">4 مرحله و بیشتر</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium">
              اعمال فیلتر
            </button>
          </div>
        </div>
      </div> */}

      {/* Grid View with Animation and Improved Layout */}
      {viewMode === "grid" && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 transition-all duration-300 animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FiGrid className="text-gray-600" />
              <span>نمای گرافیکی خطوط تولید</span>
            </h2>
            <div className="text-sm text-gray-500">
              {productionLines.length} خط تولید
            </div>
          </div>

          {productionLines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-blue-50 p-4 rounded-full mb-4">
                <FiLayers className="text-blue-500 text-3xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                هیچ خط تولیدی یافت نشد
              </h3>
              <p className="text-gray-500 mb-6 max-w-md">
                برای شروع، یک خط تولید جدید ایجاد کنید یا فیلترهای جستجو را
                تغییر دهید.
              </p>
              <button
                onClick={() => setActiveChild("configure")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus />
                <span>ایجاد خط تولید</span>
              </button>
            </div>
          ) : (
            <ProductionLineVisualizer />
          )}
        </div>
      )}

      {/* List View with Improved Table Design */}
      {viewMode === "list" && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 transition-all duration-300 animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FiList className="text-gray-600" />
              <span>لیست خطوط تولید</span>
            </h2>
            <div className="text-sm text-gray-500">
              {productionLines.length} خط تولید
            </div>
          </div>

          {productionLines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-blue-50 p-4 rounded-full mb-4">
                <FiLayers className="text-blue-500 text-3xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                هیچ خط تولیدی یافت نشد
              </h3>
              <p className="text-gray-500 mb-6 max-w-md">
                برای شروع، یک خط تولید جدید ایجاد کنید یا فیلترهای جستجو را
                تغییر دهید.
              </p>
              <button
                onClick={() => setActiveChild("configure")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus />
                <span>ایجاد خط تولید</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
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
                      تاریخ بروزرسانی
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      تاریخ ساخت
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
                  {productionLines.map((line, index) => (
                    <tr
                      key={line._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
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
                              <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                                {line.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                          {line.code}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            line.active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {line.active ? (
                            <>
                              <FiCheckCircle className="mr-1" /> فعال
                            </>
                          ) : (
                            <>
                              <FiX className="mr-1" /> غیرفعال
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-blue-400 mr-2"></div>
                          <span className="text-sm text-gray-500">
                            {line.steps?.length || 0} مرحله
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-400 flex items-center">
                          <FiClock className="mr-1 text-gray-300" />
                          <span title="آخرین بروزرسانی">
                            {new Date(line.updatedAt).toLocaleDateString(
                              "fa-IR"
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 flex items-center">
                          <FiCalendar className="mr-1 text-gray-400" />
                          <span title="تاریخ ایجاد">
                            {new Date(line.createdAt).toLocaleDateString(
                              "fa-IR"
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              (window.location.href = `/production-lines/view/${line._id}`)
                            }
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-full transition-colors"
                            title="مشاهده"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() =>
                              (window.location.href = `/production-lines/edit/${line._id}`)
                            }
                            className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-full transition-colors"
                            title="ویرایش"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(line._id)}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="حذف"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog for Delete */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-center mb-4 text-red-500">
              <FiAlertTriangle size={48} />
            </div>
            <h3 className="text-lg font-bold text-center mb-2">حذف خط تولید</h3>
            <p className="text-gray-600 text-center mb-6">
              آیا از حذف این خط تولید اطمینان دارید؟ این عملیات قابل بازگشت
              نیست.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsDeleting(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={() =>
                  selectedProductionLineId &&
                  handleDelete(selectedProductionLineId)
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <FiTrash2 />
                <span>حذف</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Floating Button */}
      <div className="fixed bottom-6 right-6">
        <div className="relative group">
          <button className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <FiPlus size={24} />
          </button>

          <div className="absolute bottom-16 right-0 hidden group-hover:block">
            <div className="bg-white rounded-lg shadow-lg p-2 w-48">
              <button
                onClick={() => setActiveChild("configure")}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md flex items-center"
              >
                <FiPlus className="ml-2 text-blue-600" />
                <span>خط تولید جدید</span>
              </button>
              <button
                onClick={() => (window.location.href = "/production-steps/new")}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md flex items-center"
              >
                <FiLayers className="ml-2 text-indigo-600" />
                <span>مرحله جدید</span>
              </button>
              <button
                onClick={() => (window.location.href = "/production-reports")}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md flex items-center"
              >
                <FiBarChart2 className="ml-2 text-green-600" />
                <span>گزارش تولید</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionLine;
