import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useProductionInventory } from "../../hooks/useProductionInventory";
import {
  FaBoxes,
  FaBoxOpen,
  FaSyncAlt,
  FaEdit,
  FaTrash,
  FaTimes,
  FaTag,
  FaMapMarkerAlt,
  FaWarehouse,
  FaSave,
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";
import { InventoryData } from "@/types/types";
import {
  FiBox,
  FiCode,
  FiEye,
  FiInfo,
  FiMapPin,
  FiX,
} from "react-icons/fi";

const InventoryList = () => {
  const {
    inventories,
    isLoading,
    error,
    mutate,
    deleteInventory,
    updateInventory,
  } = useProductionInventory();

  // Ensure inventories is always typed as Inventory[]
  const inventoriesList: InventoryData[] = inventories as InventoryData[];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentInventory, setCurrentInventory] =
    useState<InventoryData | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState<string | null>(
    null
  );

  // states to handle row click for detail of each row
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] =
    useState<InventoryData | null>(null);

  const openDeleteModal = (id: string) => {
    setInventoryToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setInventoryToDelete(null);
  };

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue,
    formState: { errors: errorsEdit },
  } = useForm<InventoryData>();

  const handleEdit = (inventory: InventoryData) => {
    setCurrentInventory(inventory);
    // Set form values for edit modal
    setValue("name", inventory.name);
    setValue("Capacity", inventory.Capacity);
    setValue("location", inventory.location);
    setValue("description", inventory.description || "");
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (data: InventoryData) => {
    if (!currentInventory) return;

    setIsSubmitting(true);

    try {
      const success = await updateInventory({
        ...currentInventory,
        ...data,
      });

      if (success) {
        toast.success("انبار با موفقیت ویرایش شد");
        setIsEditModalOpen(false);
        resetEdit();
      } else {
        toast.error("خطا در ویرایش انبار");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!inventoryToDelete) return;

    try {
      setIsSubmitting(true);
      const success = await deleteInventory(inventoryToDelete);

      if (success) {
        setIsDeleteModalOpen(false);
        toast.success("انبار با موفقیت حذف شد");
      } else {
        toast.error("خطا در حذف انبار");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    resetEdit();
  };

  const refreshList = () => {
    mutate();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 mt-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-20 max-w-7xl mx-auto overflow-auto">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-50">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-2.5 rounded-xl shadow-md ml-2">
              <FaBoxes className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">لیست انبارها</h2>
              <p className="text-gray-500 text-sm mt-1">
                مدیریت و مشاهده انبارهای سیستم
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className=" text-black text-sm py-1 px-3 font-medium">
              {inventoriesList.length} انبار
            </span>
            <button
              onClick={refreshList}
              className="flex items-center px-4 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-200 shadow-sm"
            >
              <FaSyncAlt className="h-4 w-4 ml-2" />
              <span>بروزرسانی</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-r-4 border-red-500 text-red-700 rounded-md flex items-center mb-4">
            <FaExclamationCircle className="ml-2 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {inventories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <FaBoxOpen className="text-gray-300 text-5xl mb-4" />
            <p className="text-gray-500 text-lg">هیچ انباری یافت نشد</p>
            <p className="text-gray-400 text-sm mt-2">
              برای افزودن انبار جدید از فرم افزودن انبار استفاده کنید
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ردیف
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نام
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    کد
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ظرفیت
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    موقعیت
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    توضیحات
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventoriesList.map(
                  (inventory: InventoryData, index: number) => (
                    <tr
                      key={inventory._id}
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {inventory.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {inventory.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {inventory.Capacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {inventory.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {inventory.description?.slice(0, 10)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        <div className="flex space-x-3 space-x-reverse">
                          <button
                            onClick={() => {
                              setSelectedInventory(inventory);
                              setIsModalOpen(true);
                            }}
                            className="flex items-center text-blue-600 hover:text-blue-900 transition-colors duration-150"
                          >
                            <FiEye className="ml-1" />
                            <span>جزئیات</span>
                          </button>
                          <button
                            onClick={() => handleEdit(inventory)}
                            className="flex items-center text-indigo-600 hover:text-indigo-900 transition-colors duration-150 mr-3"
                          >
                            <FaEdit className="ml-1" />
                            <span>ویرایش</span>
                          </button>
                          <button
                            onClick={() =>
                              inventory._id && openDeleteModal(inventory._id)
                            }
                            className="flex items-center text-red-600 hover:text-red-900 transition-colors duration-150 mr-3"
                          >
                            <FaTrash className="ml-1" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
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
                  ویرایش انبار
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
                  نام انبار <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...registerEdit("name", {
                      required: "نام انبار الزامی است",
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
                  ظرفیت <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    {...registerEdit("Capacity", {
                      required: "ظرفیت الزامی است",
                      min: {
                        value: 1,
                        message: "ظرفیت باید بزرگتر از صفر باشد",
                      },
                    })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaWarehouse className="text-gray-400" />
                  </div>
                </div>
                {errorsEdit.Capacity && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FaExclamationCircle className="ml-1" />
                    {errorsEdit.Capacity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  موقعیت <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...registerEdit("location", {
                      required: "موقعیت الزامی است",
                    })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400" />
                  </div>
                </div>
                {errorsEdit.location && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FaExclamationCircle className="ml-1" />
                    {errorsEdit.location.message}
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
                      بروزرسانی انبار
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
                آیا از حذف این انبار اطمینان دارید؟ این عملیات قابل بازگشت نیست.
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

      {/* Detail Modal */}

      {isModalOpen && selectedInventory && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-50/10 backdrop-blur-sm flex items-center justify-center">
          <div className="relative bg-white rounded-xl max-w-3xl w-full mx-auto p-6 shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiInfo className="text-blue-500" />
                جزئیات انبار
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className=" p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-4 border-b pb-2">
                    اطلاعات اصلی
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiBox className="text-blue-600" />
                      </div>
                      <div className="mr-3">
                        <div className="text-sm text-gray-500">نام</div>
                        <div className="font-medium">
                          {selectedInventory.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCode className="text-green-600" />
                      </div>
                      <div className="mr-3">
                        <div className="text-sm text-gray-500">کد</div>
                        <div className="font-medium">
                          {selectedInventory.code}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiMapPin className="text-purple-600" />
                      </div>
                      <div className="mr-3">
                        <div className="text-sm text-gray-500">موقعیت</div>
                        <div className="font-medium">
                          {selectedInventory.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className=" p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-4 border-b pb-2">
                    اطلاعات تکمیلی
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-gray-500 ml-2">ظرفیت:</span>
                      <span className="font-medium text-black border-b px-3 py-1">
                        {selectedInventory.Capacity}
                      </span>
                    </div>

                    <div>
                      <div className="text-gray-500 mb-1 flex items-center">
                        توضیحات:
                      </div>
                      <div className="bg-white p-3 rounded border text-gray-700 min-h-[80px]">
                        {selectedInventory.description ||
                          "توضیحاتی ثبت نشده است."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className=" px-6 py-4 flex justify-start">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                بستن
              </button>
              <button
                onClick={() => {
                  handleEdit(selectedInventory);
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-2"
              >
                ویرایش
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryList;
