import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface InventoryFormData {
  name: string;
  type: 'holding' | 'finished';
  description?: string;
  code?: string;
  _id?: string;
}

interface Inventory {
  _id: string;
  name: string;
  type: 'holding' | 'finished';
  description?: string;
  code: string;
}

interface AddInventoryProps {
  onSuccess?: () => void;
}

const AddInventory: React.FC<AddInventoryProps> = ({ onSuccess }) => {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentInventory, setCurrentInventory] = useState<Inventory | null>(null);

  // Create a separate form instance for the edit modal
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd },
  } = useForm<InventoryFormData>();

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
      const response = await fetch('/api/inventory');
      if (!response.ok) {
        throw new Error('Failed to fetch inventories');
      }
      const data = await response.json();
      setInventories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  const onSubmit = async (data: InventoryFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create inventory');
      }

      resetAdd();
      fetchInventories();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (inventory: Inventory) => {
    setCurrentInventory(inventory);
    // Set form values for edit modal
    setValue('name', inventory.name);
    setValue('type', inventory.type);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (data: InventoryFormData) => {
    if (!currentInventory) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/inventory', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          _id: currentInventory._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update inventory');
      }

      setIsEditModalOpen(false);
      resetEdit();
      fetchInventories();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inventory?')) return;

    try {
      const response = await fetch('/api/inventory', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete inventory');
      }

      fetchInventories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setError(null);
    resetEdit();
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Add New Inventory</h2>
        <form onSubmit={handleSubmitAdd(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Inventory Name *
            </label>
            <input
              type="text"
              {...registerAdd('name', { required: 'Inventory name is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errorsAdd.name && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.name.message}</p>
            )}
          </div>

          

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type *
            </label>
            <select
              {...registerAdd('type', { required: 'Type is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="holding">Holding</option>
              <option value="finished">Finished</option>
            </select>
            {errorsAdd.type && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...registerAdd('description')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Inventory'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Inventory List</h2>
        {inventories.length === 0 ? (
          <p className="text-gray-500">No inventories found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventories.map((inventory) => (
                  <tr key={inventory._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {inventory.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inventory.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inventory.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleEdit(inventory)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(inventory._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Simple Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="relative bg-white rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Inventory</h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmitEdit(handleUpdate)} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Inventory Name *
                </label>
                <input
                  type="text"
                  {...registerEdit('name', { required: 'Inventory name is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errorsEdit.name && (
                  <p className="mt-1 text-sm text-red-600">{errorsEdit.name.message}</p>
                )}
              </div>

              

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type *
                </label>
                <select
                  {...registerEdit('type', { required: 'Type is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="holding">Holding</option>
                  <option value="finished">Finished</option>
                </select>
                {errorsEdit.type && (
                  <p className="mt-1 text-sm text-red-600">{errorsEdit.type.message}</p>
                )}
              </div>

              

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddInventory;

