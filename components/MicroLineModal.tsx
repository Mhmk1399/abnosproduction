import { useState, useEffect } from "react";
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Micro Line</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
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
              Code
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
              Description
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
              Inventory
            </label>
            <select
              id="inventory"
              name="inventory"
              value={formData.inventory}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select an inventory (optional)</option>
              {!isLoading && !error && inventories.map((inventory) => (
                <option key={inventory._id} value={inventory._id}>
                  {inventory.name}
                </option>
              ))}
            </select>
            {isLoading && <p className="text-sm text-gray-500">Loading inventories...</p>}
            {error && <p className="text-sm text-red-500">Error loading inventories</p>}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
