import { useState } from "react";
import { useInventories } from "../hooks/useInventories";

interface MicroLineModalProps {
  microLine: any;
  onClose: () => void;
  onSave: (formData: any) => void;
}

export default function MicroLineModal({
  microLine,
  onClose,
  onSave,
}: MicroLineModalProps) {
  const [formData, setFormData] = useState({
    name: microLine.name || "",
    code: microLine.code || "",
    description: microLine.description || "",
    inventory: microLine.inventory?._id || microLine.inventory || "",
  });

  const { inventories, isLoading, error } = useInventories();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-50/10 backdrop-blur-sm flex items-center justify-center">
      <div className="relative bg-white rounded-xl max-w-md w-full mx-auto p-6 shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">ویرایش میکرو لاین</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              نام
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              کد
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              توضیحات
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="inventory"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              موجودی
            </label>
            <select
              id="inventory"
              name="inventory"
              value={formData.inventory}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">انتخاب موجودی</option>
              {!isLoading &&
                !error &&
                inventories.map((inventory) => (
                  <option key={inventory._id} value={inventory._id}>
                    {inventory.name}
                  </option>
                ))}
            </select>
            {isLoading && (
              <p className="text-sm text-gray-500">در حال بارگذاری موجودی ها</p>
            )}
            {error && (
              <p className="text-sm text-red-500">خطا در دریافت موجودی ها</p>
            )}
          </div>

          <div className="flex justify-start space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              لغو
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              ثبت و ذخیره
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
