export interface InventoryData {
  name: string;
  Capacity: number;
  location: string;
  description?: string;
  code?: string;
  shapeCode?: string;
  _id?: string;
  id?: string;
}

////////////////////////////////////////////////////////////////////////////
////step interface and types and its hooks and its dragableprops

export interface DraggableItemProps {
  item: Step | InventoryData;
  index: number;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: () => void;
}

export interface Step {
  _id: string;
  name: string;
  code: string;
  description: string;
  requiresScan: boolean;
  handlesTreatments: glasstreatments[] | string[];
  type: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface UseProductionStepReturn {
  steps: Step[];
  isLoading: boolean;
  error: string | null;
  mutate: () => Promise<Step[]>;
  createStep: (data: Step) => Promise<boolean>;
  updateStep: (data: Step) => Promise<boolean>;
  deleteStep: (id: string) => Promise<boolean>;
  getStep: (id: string) => Promise<Step | null>;
  fetchGlassTreatments: () => Promise<glasstreatments[]>;
  treatments: glasstreatments[];
  loadingTreatments: boolean;
}
////////////////////////////////////////////////////////////////////////////////////////////

export interface glasstreatments {
  _id: string;
  name: string;
  code: string;
  ServiceFee: {
    serviceFeeType: string;
    serviceFeeValue: number;
  };
  invoice: invoiceData[];
  createdAt: string;
  updatedAt: string;
}

export interface invoiceData {
  _id: string;
  customer: string;
  sideMaterial: string;
  priority: string;
  deliveryDate: Date;
  seller: string;
  layers: layerData[];
  type: string;
  count: number;
  designNumber: string;
  code: string;
  price: number;
  status: string;
  productuModel: string;
  editedBy: string;
  confirmedBy: string;
}

///layer interface hooks and returns
export interface layerData {
  _id: string;
  customer: Customer;
  code: string;
  glass: glassData;
  treatments: Array<{
    treatment: string;
    count: number;
  }>;
  width: number;
  height: number;
  product: string;
  invoice: invoiceData;
  productionCode: string;
  productionLine: ProductionLine | string;
  productionDate: string;
  currentStep: Step | string;
  currentline: ProductionLine | string;
  currentInventory?: InventoryData;
  productionNotes?: string;
  designNumber?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  completed?: boolean;
}

export interface UseProductLayersReturn {
  layers: layerData[];
  isLoading: boolean;
  error: string | null;
  mutate: () => Promise<layerData[]>;
  createProductLayer: (data: Partial<layerData>) => Promise<boolean>;
  updateProductLayer: (data: Partial<layerData>) => Promise<boolean>;
  deleteProductLayer: (id: string) => Promise<boolean>;
  getProductLayer: (id: string) => Promise<layerData | null>;
}

///////////////////////////////////////
export interface glassData {
  _id: string;
  name: string;
  code: string;
  thickness: number;
  sellPrice: number;
}

export interface treatmentData {
  _id: string;
  name: string;
  code: string;
  ServiceFee: {
    serviceFeeType: string;
    serviceFeeValue: number;
  };
  invoice: invoiceData[];
}

////////////////////////////////////////////////////////////////////////////
////ProductionLine interface and types and its hooks and its dragableprops
export interface LineItem {
  id: string;
  originalId: string;
  name: string;
  type: "step" | "inventory";
  description?: string;
  quantity?: number;
  code?: string;
}

export interface ProductionLine {
  _id: string;
  name: string;
  code: string;
  description: string | undefined;
  steps: { step: Step[] | string; sequence: number }[];
  inventory: InventoryData[] | string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface UseProductionLinesReturn {
  productionLines: ProductionLine[];
  isLoading: boolean;
  error: string | null;
  steps: Step[];
  inventories: InventoryData[];
  loadingSteps: boolean;
  loadingInventories: boolean;
  mutate: () => Promise<ProductionLine[]>;
  createProductionLine: (data: Partial<ProductionLine>) => Promise<boolean>;
  updateProductionLine: (data: ProductionLine) => Promise<boolean>;
  deleteProductionLine: (id: string) => Promise<boolean>;
  getProductionLine: (id: string) => Promise<ProductionLine | null>;
  fetchSteps: () => Promise<Step[]>;
  fetchInventories: () => Promise<invoiceData[]>;
}

export interface DraggableItemProps {
  item: InventoryData | Step;
  index: number;
  type: "inventory" | "step";
  isInLine: boolean;
  onReorder: (from: number, to: number) => void;
  onRemove: () => void;
}

/////////////////////////////////////////////////////
export interface Customer {
  _id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  nationalId: string;
  postalCode: string;
  type: string;
}

////* Represents a treatment applied during a step execution

export interface TreatmentApplication {
  treatment:
    | {
        _id: string;
        name: string;
        code?: string;
      }
    | string;
  count: number;
  measurement?: string;
}

/**
 * Represents a single step execution record
 */
/**
 * Interface for items that can be dropped in a production line
 */
export interface DropAreaItem {
  id: string;
  name: string;
  description?: string;
  type: "inventory" | "step";
  // Properties for inventory items
  quantity?: number;
  location?: string;
  Capacity?: number;
  // Properties for step items
  code?: string;
}

export interface StepExecution {
  _id: string;
  layer: string | layerData; // Reference to the layer
  step:
    | {
        _id: string;
        name: string;
        code: string;
      }
    | string;
  productionLine:
    | {
        _id: string;
        name: string;
      }
    | string;
  scannedAt: string;
  treatmentsApplied: TreatmentApplication[];
  passed: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Props for the ProductionHistory component
 */
export interface ProductionHistoryProps {
  layerId: string;
}

/**
 * State for the ProductionHistory component
 */
export interface ProductionHistoryState {
  history: StepExecution[];
  loading: boolean;
  error: string | null;
  layer: layerData | null;
}

export interface MenuItemChild {
  id: string;
  title: string;
}

export interface NavMenuItem {
  id: string;
  title: string;
  icon: string;
  children: {
    id: string;
    title: string;
  }[];
}
