"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

interface StepFormData {
  name: string;
  code?: string;
  description?: string;
}

interface StepFormProps {
  onSuccess?: () => void;
}

const StepsForm: React.FC<StepFormProps> = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StepFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: StepFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/steps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create step");
      }

      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Step Name *
        </label>
        <input
          type="text"
          {...register("name", { required: "Step name is required" })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Step Code
        </label>
        <input
          type="text"
          {...register("code")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Leave blank to auto-generate"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Step"}
        </button>
      </div>
    </form>
  );
};

export default StepsForm;
