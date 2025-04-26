"use client";
import { useEffect, useState } from "react";
import ProductionLineView from "../components/ProductionLineView";
import { ProductionLineConfig, Glass } from "../types/production";
import TrackingModal from "../components/TrackingModal";

// Sample default data
const defaultProductionLines: ProductionLineConfig[] = [
  {
    id: "line-1",
    name: "Main Production Line",
    steps: [
      { id: "step-1", name: "Cutting", description: "Glass cutting process" },
      { id: "step-2", name: "Grinding", description: "Edge grinding" },
      { id: "step-3", name: "Polishing", description: "Surface polishing" },
      { id: "step-4", name: "Tempering", description: "Heat treatment" },
    ],
    inventories: [
      { id: "inv-1", name: "Raw Glass", quantity: 500 },
      { id: "inv-2", name: "Finished Glass", quantity: 200 },
    ],
    items: [], // This would be populated with the combined steps and inventories
    order: ["step-1", "inv-1", "step-2", "step-3", "step-4", "inv-2"],
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-05-20"),
  },
  {
    id: "line-2",
    name: "Special Glass Line",
    steps: [
      { id: "step-5", name: "Cutting", description: "Precision cutting" },
      { id: "step-6", name: "Laminating", description: "Layer bonding" },
      { id: "step-7", name: "Curing", description: "Heat curing process" },
    ],
    inventories: [
      { id: "inv-3", name: "Special Glass Sheets", quantity: 150 },
      { id: "inv-4", name: "Lamination Film", quantity: 300 },
    ],
    items: [], // This would be populated with the combined steps and inventories
    order: ["step-5", "inv-3", "step-6", "inv-4", "step-7"],
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-06-05"),
  },
];

// Sample glasses data with more variety
const defaultGlasses: Record<string, Glass[]> = {
  "step-1": [
    {
      id: "glass-1",
      batchId: "batch-001",
      dimensions: "100x200",
      status: "in-progress",
    },
    {
      id: "glass-2",
      batchId: "batch-001",
      dimensions: "100x200",
      status: "in-progress",
    },
    {
      id: "glass-3",
      batchId: "batch-001",
      dimensions: "100x200",
      status: "completed",
    },
    {
      id: "glass-4",
      batchId: "batch-002",
      dimensions: "150x300",
      status: "in-progress",
    },
  ],
  "step-2": [
    {
      id: "glass-5",
      batchId: "batch-001",
      dimensions: "100x200",
      status: "in-progress",
    },
    {
      id: "glass-6",
      batchId: "batch-002",
      dimensions: "150x300",
      status: "defective",
    },
    {
      id: "glass-7",
      batchId: "batch-002",
      dimensions: "150x300",
      status: "in-progress",
    },
  ],
  "step-3": [
    {
      id: "glass-8",
      batchId: "batch-002",
      dimensions: "150x300",
      status: "in-progress",
    },
    {
      id: "glass-9",
      batchId: "batch-002",
      dimensions: "150x300",
      status: "in-progress",
    },
    {
      id: "glass-10",
      batchId: "batch-003",
      dimensions: "200x400",
      status: "completed",
    },
  ],
  "step-4": [
    {
      id: "glass-11",
      batchId: "batch-003",
      dimensions: "200x400",
      status: "in-progress",
    },
    {
      id: "glass-12",
      batchId: "batch-003",
      dimensions: "200x400",
      status: "completed",
    },
  ],
  "step-5": [
    {
      id: "glass-13",
      batchId: "batch-004",
      dimensions: "250x350",
      status: "in-progress",
    },
    {
      id: "glass-14",
      batchId: "batch-004",
      dimensions: "250x350",
      status: "defective",
    },
  ],
  "step-6": [
    {
      id: "glass-15",
      batchId: "batch-004",
      dimensions: "250x350",
      status: "in-progress",
    },
    {
      id: "glass-16",
      batchId: "batch-005",
      dimensions: "300x500",
      status: "in-progress",
    },
  ],
  "step-7": [
    {
      id: "glass-17",
      batchId: "batch-005",
      dimensions: "300x500",
      status: "completed",
    },
  ],
};

export default function ProductionLinesPage() {
  const [lines, setLines] = useState<ProductionLineConfig[]>([]);
  const [glasses, setGlasses] =
    useState<Record<string, Glass[]>>(defaultGlasses);
  const [selectedStep, setSelectedStep] = useState<{
    id: string;
    name: string;
    description: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // For now, we'll use the default data
    const fetchLines = async () => {
      try {
        // Simulate API call with default data
        setLines(defaultProductionLines);
      } catch (error) {
        console.error("Error fetching production lines:", error);
      }
    };

    fetchLines();
  }, []);

  const handleStepClick = (
    stepId: string,
    stepName: string,
    stepDescription: string
  ) => {
    setSelectedStep({
      id: stepId,
      name: stepName,
      description: stepDescription,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStep(null);
  };

  const getGlassesForStep = (stepId: string): Glass[] => {
    return glasses[stepId] || [];
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Production Lines</h1>

      {/* Pass a valid lineId that exists in your production-lines.json */}
      <ProductionLineView
        lineId="line-001"
        onStepClick={(stepId, stepName) => {
          console.log(`Clicked on step ${stepName} (${stepId})`);
        }}
      />

      {/* Tracking Modal */}
      {isModalOpen && selectedStep && (
        <TrackingModal
          stepId={selectedStep.id}
          stepName={selectedStep.name}
          stepDescription={selectedStep.description}
          glasses={getGlassesForStep(selectedStep.id)}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
