"use client";
import { useState } from "react";

export default function BatchCreationForm({
  productionLineId,
  onBatchCreated,
}: {
  productionLineId: string;
  onBatchCreated?: (batchId: string) => void;
}) {
  const [batchId, setBatchId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    thickness: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Validate inputs
      if (!batchId) {
        throw new Error("Batch ID is required");
      }

      if (quantity < 1) {
        throw new Error("Quantity must be at least 1");
      }

      // Create batch of layers
      const layersToCreate = [];

      for (let i = 0; i < quantity; i++) {
        layersToCreate.push({
          batchId,
          dimensions,
          productionLineId,
        });
      }

      // Send request to create layers
      const response = await fetch("/api/layers/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          layers: layersToCreate,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create batch");
      }

      const data = await response.json();

      setSuccess(
        `Successfully created ${data.layers.length} layers in batch ${batchId}`
      );

      // Reset form
      setBatchId("");
      setQuantity(1);
      setDimensions({ width: 0, height: 0, thickness: 0 });

      // Notify parent component
      if (onBatchCreated) {
        onBatchCreated(batchId);
      }
    } catch (err) {
      console.error("Error creating batch:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Create New Batch</h2>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="batchId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Batch ID
            </label>
            <input
              type="text"
              id="batchId"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter batch identifier"
              required
            />
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="width"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Width (mm)
              </label>
              <input
                type="number"
                id="width"
                value={dimensions.width || ""}
                onChange={(e) =>
                  setDimensions({
                    ...dimensions,
                    width: parseFloat(e.target.value) || 0,
                  })
                }
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="height"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Height (mm)
              </label>
              <input
                type="number"
                id="height"
                value={dimensions.height || ""}
                onChange={(e) =>
                  setDimensions({
                    ...dimensions,
                    height: parseFloat(e.target.value) || 0,
                  })
                }
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="thickness"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Thickness (mm)
              </label>
              <input
                type="number"
                id="thickness"
                value={dimensions.thickness || ""}
                onChange={(e) =>
                  setDimensions({
                    ...dimensions,
                    thickness: parseFloat(e.target.value) || 0,
                  })
                }
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Batch"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
          {success}
        </div>
      )}
    </div>
  );
}
