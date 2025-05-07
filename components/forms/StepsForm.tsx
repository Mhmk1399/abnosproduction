"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Step } from "@/hooks/useSteps";

interface StepFormData {
  name: string;
  code?: string;
  description?: string;
  password?: string;
}

interface StepFormProps {
  onSuccess?: () => void;
  stepToEdit?: Step | null;
  mode?: "create" | "edit";
}

const StepsForm: React.FC<StepFormProps> = ({ 
  onSuccess, 
  stepToEdit = null, 
  mode = "create" 
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StepFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (stepToEdit && mode === "edit") {
      setValue("name", stepToEdit.name);
      setValue("code", stepToEdit.code);
      setValue("description", stepToEdit.description || "");
      // Note: We don't set the password as it's hashed in the database
    }
  }, [stepToEdit, setValue, mode]);

  const onSubmit = async (data: StepFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let response;
      
      if (mode === "edit" && stepToEdit) {
        response = await fetch(`/api/steps/${stepToEdit._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      } else {
        response = await fetch("/api/steps", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${mode === "edit" ? "update" : "create"} step`);
      }

      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!stepToEdit) return;
    
    if (!confirm("Are you sure you want to delete this step?")) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/steps/${stepToEdit._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete step");
      }

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
          disabled={mode === "edit"} // Cannot edit code in edit mode
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
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          {...register("password")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="flex justify-between">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting 
            ? "Saving..." 
            : mode === "edit" 
              ? "Update Step" 
              : "Save Step"}
        </button>
        
        {mode === "edit" && stepToEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isSubmitting ? "Deleting..." : "Delete Step"}
          </button>
        )}
      </div>
    </form>
  );
};

export default StepsForm;
