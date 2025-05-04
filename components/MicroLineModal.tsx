"use client";
import { useState, useEffect } from "react";
import { useSteps } from "../hooks/useSteps";

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
    name: "",
    description: "",
    steps: [] as any[],
  });
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const { steps, isLoading } = useSteps();

  useEffect(() => {
    if (microLine) {
      setFormData({
        name: microLine.name || "",
        description: microLine.description || "",
        steps: microLine.steps || [],
      });
      
      // Extract step IDs from the microLine
      if (microLine.steps && Array.isArray(microLine.steps)) {
        const stepIds = microLine.steps.map((s: any) => 
          typeof s.step === 'object' ? s.step._id : s.step
        );
        setSelectedSteps(stepIds);
      }
    }
  }, [microLine]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStepToggle = (stepId: string) => {
    setSelectedSteps((prev) => {
      if (prev.includes(stepId)) {
        return prev.filter((id) => id !== stepId);
      } else {
        return [...prev, stepId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create steps array with order
    const stepsWithOrder = selectedSteps.map((stepId, index) => ({
      step: stepId,
      order: index,
    }));
    
    onSave({
      ...formData,
      steps: stepsWithOrder,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Edit Micro Line</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name*
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              rows={3}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Steps
            </label>
            {isLoading ? (
              <div>Loading steps...</div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-2 max-h-60 overflow-y-auto">
                {steps.map((step) => (
                  <div key={step._id} className="flex items-center p-2 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      id={`step-${step._id}`}
                      checked={selectedSteps.includes(step._id)}
                      onChange={() => handleStepToggle(step._id)}
                      className="mr-2"
                    />
                    <label htmlFor={`step-${step._id}`} className="cursor-pointer flex-1">
                      {step.name}
                    </label>
                  </div>
                ))}
                {steps.length === 0 && <div className="text-gray-500">No steps available</div>}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={!formData.name || selectedSteps.length === 0}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}