export interface LineItem {
  id: string;
  originalId: string;
  name: string;
  type: "microLine" | "inventory" | "step";
  description?: string;
  quantity?: number;
  steps?: {
    step: {
      _id: string;
      name: string;
      description: string;
    };
    order: number;
  }[];
}
// Add this to your existing types
export interface Inventory {
  id: string;
  name: string;
  quantity?: number;
  description: string;
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
  status: "in-progress" | "completed" | "defective";
  // Add any other properties you need
}

// Layer represents a glass layer in production
export interface Layer {
  processedAt: string | number | Date;
  _id: any;
  code: any;
  id: string;
  batchId: string;
  thickness: number;
  material: string;
  quality: number;
  status: "pending" | "in-progress" | "completed" | "defective";
  currentLineId: string;
  currentStepId: string;
  inventoryId?: string;
  createdAt: Date;
  updatedAt: Date;
  processHistory: ProcessStep[];
  layerHistory: Layer[];
  glassId: string;
  glass: Glass;
  dimensions?: Dimensions;

  layerId: string;
  layer: Layer;
  inventory: Inventory;
}
export interface Dimensions {
  width: number;
  height: number;
  thickness: number;
}

// Represents a step in the layer's processing history
export interface ProcessStep {
  stepId: string;
  stepName: string;
  workerId?: string;
  startTime: Date;
  endTime?: Date;
  status: "in-progress" | "completed" | "defective";
  notes?: string;
}

export interface ProductionStep {
  _id: string;
  stepId: {
    _id: string;
    name: string;
    code: string;
    description: string;
  };
  order: number;
}
export interface ProductionInventory {
  _id: string;
  inventoryId: {
    _id: string;
    name: string;
    code: string;
    quantity: number;
    description: string;
  };
  order: number;
}
export interface FlowOrderItem {
  _id: string;
  itemId: {
    _id: string;
    name: string;
    code: string;
    description?: string;
    quantity?: number;
  };
  itemType: "steps" | "productionInventory";
  order: number;
}
export interface ProductionLine {
  _id: string;
  name: string;
  code: string;
  description: string;
  steps: ProductionStep[];
  inventories: ProductionInventory[];
  flowOrder: FlowOrderItem[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface LineItem {
  id: string;
  originalId: string;
  name: string;
  type: "microLine" | "inventory"| "step";
  description?: string;
  quantity?: number;
  steps?: {
    step: {
      _id: string;
      name: string;
      description: string;
    };
    order: number;
  }[];
}
