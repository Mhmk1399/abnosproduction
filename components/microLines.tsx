"use client";
import { useState } from "react";

import DeleteConfirmationModal from "@/components/deleteConfirmationModal";
import MicroLineModal from "./MicroLineModal";
import { useMicroLines } from "@/hooks/useMicroLines";

export default function MicroLinesPage() {
  const { microLines, isLoading, error, mutate } = useMicroLines();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMicroLine, setSelectedMicroLine] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lineToDelete, setLineToDelete] = useState<string | null>(null);

  // Filter micro lines based on search term
  const filteredLines = microLines.filter(
    (line) =>
      line.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      line.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (microLine: any) => {
    setSelectedMicroLine(microLine);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!lineToDelete) return;

    try {
      const response = await fetch("/api/microLine", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: lineToDelete }),
      });

      if (!response.ok) {
        throw new Error("حذف میکرو لاین با خطا مواجه شد");
      }

      // Refresh the data
      mutate();
      // Close the modal
      setIsDeleteModalOpen(false);
      setLineToDelete(null);
    } catch (error) {
      console.error("خطا در حذف میکرو لاین:", error);
      // You could set an error state here to display in the modal
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMicroLine(null);
  };

  const handleModalSave = async (formData: any) => {
    try {
      const response = await fetch("/api/microLine", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          _id: selectedMicroLine._id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update micro line");
      }

      // Refresh the data
      mutate();
      setIsModalOpen(false);
      setSelectedMicroLine(null);
    } catch (error) {
      console.error("Error updating micro line:", error);
      alert("Failed to update micro line");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 mt-20" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">میکرو لاین ها</h1>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          ساخت میکرو لاین
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="جستجوی میکرو لاین..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ردیف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                کد
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نام
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                توضیحات
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                موجودی
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                مراحل
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLines.map((line, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {line.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {line.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {line.description || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {line.inventory
                    ? typeof line.inventory === "object"
                      ? line.inventory.name
                      : "Assigned"
                    : "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {line.steps ? line.steps.length : 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap gap-3 flex text-sm text-gray-500">
                  <button
                    onClick={() => handleEdit(line)}
                    className="text-blue-500 hover:text-blue-700 mr-4"
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={() => {
                      setLineToDelete(line._id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {filteredLines.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  میکرو لاینی پیدا نشد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <MicroLineModal
          microLine={selectedMicroLine}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          onClose={() => {
            setIsDeleteModalOpen(false);
            setLineToDelete(null);
          }}
          onConfirm={handleDelete}
          title="تایید حذف میکرو لاین"
          message="آیا از حذف این میکرو لاین اطمینان دارید؟ این عمل قابل بازگشت نیست."
        />
      )}
    </div>
  );
}
