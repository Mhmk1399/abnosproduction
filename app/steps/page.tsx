'use client';

import { useState } from 'react';
import { useSteps } from '@/hooks/useSteps';
import StepsForm from '@/components/forms/StepsForm';

export default function StepsPage() {
  const { steps, isLoading, error } = useSteps();
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
    // Ideally, you would refresh the steps list here
    window.location.reload();
  };

  if (isLoading) return <div className="p-8">Loading steps...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Production Steps</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {showForm ? 'Cancel' : 'Add New Step'}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-4 bg-gray-50 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Add New Step</h2>
          <StepsForm onSuccess={handleSuccess} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step) => (
          <div key={step._id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{step.name}</h3>
            <p className="text-sm text-gray-500">Code: {step.code}</p>
            {step.description && <p className="mt-2">{step.description}</p>}
            <p className="text-xs text-gray-400 mt-2">
              Created: {new Date(step.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {steps.length === 0 && (
        <div className="text-center p-8 bg-gray-50 rounded">
          No steps found. Add your first production step!
        </div>
      )}
    </div>
  );
}