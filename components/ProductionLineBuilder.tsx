import { useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import LineArea from "./LineArea";
import { ProductionStep, ProductionLineConfig } from "../types/production";
import StepItem from "./StepItem";

export default function ProductionLineBuilder({
  availableSteps,
  initialConfig,
  onSave,
}: {
  availableSteps: ProductionStep[];
  initialConfig?: ProductionLineConfig;
  onSave: (config: ProductionLineConfig) => void;
}) {
  const [lineSteps, setLineSteps] = useState<ProductionStep[]>(
    initialConfig?.steps || []
  );
  const [lineName, setLineName] = useState(initialConfig?.name || "");

  const handleDrop = useCallback(
    (stepId: string) => {
      const step = availableSteps.find((s) => s.id === stepId);
      if (step && !lineSteps.find((s) => s.id === stepId)) {
        setLineSteps((prev) => [...prev, step]);
      }
    },
    [availableSteps, lineSteps]
  );

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setLineSteps((prev) => {
      const newSteps = [...prev];
      const [moved] = newSteps.splice(fromIndex, 1);
      newSteps.splice(toIndex, 0, moved);
      return newSteps;
    });
  }, []);

  // Use the handleRemove function you already defined
  const handleRemove = useCallback((stepId: string) => {
    setLineSteps((prev) => prev.filter((s) => s.id !== stepId));
  }, []);

  const handleSave = async () => {
    const config: ProductionLineConfig = {
      id: initialConfig?.id || crypto.randomUUID(),
      name: lineName,
      steps: lineSteps,
      order: lineSteps.map((s) => s.id),
      createdAt: initialConfig?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    try {
      const response = await fetch("/api/production-lines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error("Failed to save");

      onSave(config);
      alert("Production line saved successfully!");
    } catch (error) {
      console.error("Error saving production line:", error);
      alert("Error saving production line");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <input
            type="text"
            value={lineName}
            onChange={(e) => setLineName(e.target.value)}
            placeholder="Enter production line name"
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Available Steps</h2>
            <div className="space-y-2">
              {availableSteps.map((step) => (
                <StepItem key={step.id} step={step} isInLine={false} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Production Line</h2>
            {/* Fix: Pass the handleRemove function to the LineArea component */}
            <LineArea
              steps={lineSteps}
              onDrop={handleDrop}
              onReorder={handleReorder}
              onRemove={handleRemove} // Changed this line to use your handleRemove function
            />
            <button
              onClick={handleSave}
              disabled={!lineName || lineSteps.length === 0}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
