export type ProductionStep = {
  id: string;
  name: string;
  description?: string;
  defaultDuration?: number;
  items?: (ProductionStep | Inventory)[];
  // Add more fields as needed
};


// Add this to your existing types
export interface Inventory {
  id: string;
  name: string;
  quantity?: number;
  type?: "inventory"; // Add this to help with type discrimination
}

// Update your ProductionLineConfig type
export interface ProductionLineConfig {
  id: string;
  name: string;
  steps: ProductionStep[];
  inventories: Inventory[];
  items: (ProductionStep | Inventory)[];
  order: string[];
  createdAt: Date;
  updatedAt: Date;
}
// Add this to your existing types
export interface Glass {
  id: string;
  batchId: string;
  dimensions: string;
  status: 'in-progress' | 'completed' | 'defective';
  // Add any other properties you need
}

// Layer represents a glass layer in production
export interface Layer {
  id: string;
  batchId: string;
  dimensions: string;
  thickness: number;
  material: string;
  quality: number;
  status: 'pending' | 'in-progress' | 'completed' | 'defective';
  currentLineId: string;
  currentStepId: string;
  inventoryId?: string;
  createdAt: Date;
  updatedAt: Date;
  processHistory: ProcessStep[];
}

// Represents a step in the layer's processing history
export interface ProcessStep {
  stepId: string;
  stepName: string;
  workerId?: string;
  startTime: Date;
  endTime?: Date;
  status: 'in-progress' | 'completed' | 'defective';
  notes?: string;
}
