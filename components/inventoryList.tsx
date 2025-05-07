import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  FaBoxes,
  FaBoxOpen,
  FaSyncAlt,
  FaEdit,
  FaTrash,
  FaTimes,
  FaTag,
  FaChevronDown,
  FaSave,
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";

interface InventoryFormData {
  name: string;
  type: "holding" | "finished";
  description?: string;
  code?: string;
  _id?: string;
}

interface Inventory {
  _id: string;
  name: string;
  type: "holding" | "finished";
  description?: string;
  code: string;
}

const InventoryList = () => {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentInventory, setCurrentInventory] = useState<Inventory | null>(
    null
  );
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState<string | null>(
    null
  );

  const openDeleteModal = (id: string) => {
    setInventoryToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setInventoryToDelete(null);
  };

  // Combine external and local refresh triggers

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue,
    formState: { errors: errorsEdit },
  } = useForm<InventoryFormData>();

  // Fetch all inventories
  const fetchInventories = async () => {
    try {
      const response = await fetch("/api/inventory");
      if (!response.ok) {
        throw new Error("Failed to fetch inventories");
      }
      const data = await response.json();
      setInventories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  const handleEdit = (inventory: Inventory) => {
    setCurrentInventory(inventory);
    // Set form values for edit modal
    setValue("name", inventory.name);
    setValue("type", inventory.type);
    setValue("description", inventory.description || "");
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (data: InventoryFormData) => {
    if (!currentInventory) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/inventory", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          _id: currentInventory._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update inventory");
      }

      setIsEditModalOpen(false);
      resetEdit();
      // Trigger a refresh
      setLocalRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!inventoryToDelete) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/inventory`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete inventory");
      }

      // Remove the deleted inventory from the list
      setInventories(
        inventories.filter((inv) => inv._id !== inventoryToDelete)
      );
      closeDeleteModal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during deletion"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setError(null);
    resetEdit();
  };

  const refreshList = () => {
    setLocalRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-8 mt-20">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-50">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-800">لیست موجودی</h2>
            <div className="bg-indigo-100 p-2 rounded-lg mr-1">
              <FaBoxes className="text-indigo-600 text-xl" />
            </div>
          </div>
          <button
            onClick={refreshList}
            className="flex items-center px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all duration-200"
          >
            <FaSyncAlt className="h-4 w-4 mr-2" />
            <span>بروزرسانی</span>
          </button>
        </div>

        {inventories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <FaBoxOpen className="text-gray-300 text-5xl mb-4" />
            <p className="text-gray-500 text-lg">هیچ موجودی یافت نشد</p>
            <p className="text-gray-400 text-sm mt-2">
              برای افزودن موجودی جدید از فرم افزودن موجودی استفاده کنید
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نام
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    کد
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventories.map((inventory) => (
                  <tr
                    key={inventory._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {inventory.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {inventory.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      <span
                        className={`px-3 py-1 rounded-full ${
                          inventory.type === "holding"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {inventory.type === "holding" ? "نگهداری" : "تکمیل شده"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      <div className="flex space-x-3 space-x-reverse">
                        <button
                          onClick={() => handleEdit(inventory)}
                          className="flex items-center text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                        >
                          <FaEdit className="ml-1" />
                          <span>ویرایش</span>
                        </button>
                        <button
                          onClick={() => openDeleteModal(inventory._id)}
                          className="flex items-center text-red-600 hover:text-red-900 transition-colors duration-150 mr-3"
                        >
                          <FaTrash className="ml-1" />
                          <span>حذف</span>
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

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-50/10 backdrop-blur-sm flex items-center justify-center">
          <div className="relative bg-white rounded-xl max-w-md w-full mx-auto p-6 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-1.5 rounded-lg ml-2">
                  <FaEdit className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  ویرایش موجودی
                </h3>
              </div>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-150"
                aria-label="close modal"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitEdit(handleUpdate)}
              className="space-y-5"
              dir="rtl"
            >
              {error && (
                <div className="p-4 bg-red-50 border-r-4 border-red-500 text-red-700 rounded-md flex items-center">
                  <FaExclamationCircle className="ml-2 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  نام موجودی <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...registerEdit("name", {
                      required: "نام موجودی الزامی است",
                    })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaTag className="text-gray-400" />
                  </div>
                </div>
                {errorsEdit.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FaExclamationCircle className="ml-1" />
                    {errorsEdit.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  نوع <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    {...registerEdit("type", {
                      required: "نوع موجودی الزامی است",
                    })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none"
                  >
                    <option value="holding">نگهداری</option>
                    <option value="finished">تکمیل شده</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaChevronDown className="text-gray-400" />
                  </div>
                </div>
                {errorsEdit.type && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FaExclamationCircle className="ml-1" />
                    {errorsEdit.type.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  توضیحات
                </label>
                <textarea
                  {...registerEdit("description")}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  rows={3}
                  placeholder="توضیحات اضافی (اختیاری)"
                />
              </div>

              <div className="flex justify-start gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      در حال بروزرسانی...
                      <FaSpinner className="animate-spin mr-2" />
                    </>
                  ) : (
                    <>
                      بروزرسانی موجودی
                      <FaSave className="mr-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-50/10 backdrop-blur-sm flex items-center justify-center">
          <div className="relative bg-white rounded-xl max-w-md w-full mx-auto p-6 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="bg-red-100 p-1.5 rounded-lg ml-2">
                  <FaTrash className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">تایید حذف</h3>
              </div>
              <button
                onClick={closeDeleteModal}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-150"
              >
                <span className="sr-only">بستن</span>
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4" dir="rtl">
              {error && (
                <div className="p-4 mb-4 bg-red-50 border-r-4 border-red-500 text-red-700 rounded-md flex items-center">
                  <FaExclamationCircle className="ml-2 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <p className="text-gray-700 mb-6">
                آیا از حذف این موجودی اطمینان دارید؟ این عملیات قابل بازگشت
                نیست.
              </p>

              <div className="flex justify-start gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isSubmitting}
                  className="flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      در حال حذف...
                      <FaSpinner className="animate-spin mr-2" />
                    </>
                  ) : (
                    <>
                      تایید حذف
                      <FaTrash className="mr-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryList;
