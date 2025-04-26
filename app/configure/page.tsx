"use client";
import { useState } from "react";
import ProductionLineBuilder from "../../components/ProductionLineBuilder";
import { ProductionStep, ProductionLineConfig } from "../../types/production";

const ConfigurePage = () => {
  // This would come from your backend/API
  const [savedConfigs, setSavedConfigs] = useState<ProductionLineConfig[]>([]);
  const availableSteps: ProductionStep[] = [
    { id: "1", name: "Cutting", description: "Glass cutting process" },
    { id: "2", name: "Edging", description: "Edge polishing" },
    { id: "3", name: "Tempering", description: "Heat treatment" },
    { id: "4", name: "Coating", description: "Protective coating" },
    { id: "5", name: "Quality Check", description: "Final inspection" },
  ];

  const availableInventories: ProductionStep[] = [
    { id: "1", name: "c.i", description: "Glass cutting process" },
    { id: "2", name: "r.i", description: "Edge polishing" },
    { id: "3", name: "li", description: "Heat treatment" },
    { id: "4", name: "l.p.i", description: "Protective coating" },
    { id: "5", name: "s.i", description: "Final inspection" },
  ];

  const handleSave = (config: ProductionLineConfig) => {
    setSavedConfigs((prev) => {
      const existing = prev.find((c) => c.id === config.id);
      return existing
        ? prev.map((c) => (c.id === config.id ? config : c))
        : [...prev, config];
    });
    // Here you would typically make API call to save to your backend
    console.log("Saving configuration:", config);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-center my-8">
        Production Line Configuration
      </h1>
      <ProductionLineBuilder
        availableInventories={availableInventories}
        availableSteps={availableSteps}
        onSave={handleSave}
      />
    </div>
  );
};

export default ConfigurePage;
