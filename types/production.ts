export type ProductionStep = {
    id: string;
    name: string;
    description?: string;
    defaultDuration?: number;
    // Add more fields as needed
  };
  
  export type ProductionLineConfig = {
    id: string;
    name: string;
    steps: ProductionStep[];
    order: string[];
    createdAt?: Date;
    updatedAt?: Date;
  };