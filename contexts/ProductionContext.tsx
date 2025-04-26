'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductionLineConfig, ProductionStep, Inventory } from '../types/production';

interface ProductionContextType {
  // Data
  productionLines: ProductionLineConfig[];
  availableSteps: ProductionStep[];
  availableInventories: Inventory[];
  isLoading: boolean;
  error: string | null;
  
  // Query functions
  getLineById: (id: string) => ProductionLineConfig | undefined;
  getStepById: (id: string) => ProductionStep | undefined;
  getInventoryById: (id: string) => Inventory | undefined;
  
  // Operations
  createProductionLine: (line: Omit<ProductionLineConfig, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateProductionLine: (line: ProductionLineConfig) => Promise<boolean>;
  
  // Refresh data
  refreshProductionData: () => Promise<void>;
}

const ProductionContext = createContext<ProductionContextType | undefined>(undefined);

export function ProductionProvider({ children }: { children: ReactNode }) {
  const [productionLines, setProductionLines] = useState<ProductionLineConfig[]>([]);
  const [availableSteps, setAvailableSteps] = useState<ProductionStep[]>([]);
  const [availableInventories, setAvailableInventories] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch production data
  const fetchProductionData = async () => {
    setIsLoading(true);
    try {
      // Fetch production lines
      const linesResponse = await fetch('/assets/data/production-lines.json');
      if (!linesResponse.ok) throw new Error('Failed to fetch production lines');
      const linesData = await linesResponse.json();
      
      // Fetch available steps
      const stepsResponse = await fetch('/assets/data/available-steps.json');
      if (!stepsResponse.ok) throw new Error('Failed to fetch available steps');
      const stepsData = await stepsResponse.json();
      
      // Fetch available inventories
      const inventoriesResponse = await fetch('/assets/data/available-inventories.json');
      if (!inventoriesResponse.ok) throw new Error('Failed to fetch available inventories');
      const inventoriesData = await inventoriesResponse.json();
      
      // Format dates
      const formattedLines = linesData.map((line: any) => ({
        ...line,
        createdAt: new Date(line.createdAt),
        updatedAt: new Date(line.updatedAt)
      }));
      
      setProductionLines(formattedLines);
      setAvailableSteps(stepsData);
      setAvailableInventories(inventoriesData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching production data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchProductionData();
  }, []);
  
  // Query functions
  const getLineById = (id: string) => 
    productionLines.find(line => line.id === id);
  
  const getStepById = (id: string) => {
    // First check in available steps
    const availableStep = availableSteps.find(step => step.id === id);
    if (availableStep) return availableStep;
    
    // Then check in production lines
    for (const line of productionLines) {
      const lineStep = line.steps.find(step => step.id === id);
      if (lineStep) return lineStep;
    }
    
    return undefined;
  };
  
  const getInventoryById = (id: string) => {
    // First check in available inventories
    const availableInventory = availableInventories.find(inv => inv.id === id);
    if (availableInventory) return availableInventory;
    
    // Then check in production lines
    for (const line of productionLines) {
      const lineInventory = line.inventories.find(inv => inv.id === id);
      if (lineInventory) return lineInventory;
    }
    
    return undefined;
  };
  
  // Operations
  const createProductionLine = async (lineData: Omit<ProductionLineConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newLine: ProductionLineConfig = {
        ...lineData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // In a real app, this would be an API call
      // For now, we'll update our local state
      setProductionLines(prev => [...prev, newLine]);
      
      return true;
    } catch (err) {
      console.error('Error creating production line:', err);
      return false;
    }
  };
  
  const updateProductionLine = async (updatedLine: ProductionLineConfig) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll update our local state
      setProductionLines(prev => 
        prev.map(line => line.id === updatedLine.id ? 
          { ...updatedLine, updatedAt: new Date() } : line
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error updating production line:', err);
      return false;
    }
  };
  
  // Refresh data function
  const refreshProductionData = async () => {
    await fetchProductionData();
  };
  
  const value = {
    productionLines,
    availableSteps,
    availableInventories,
    isLoading,
    error,
    getLineById,
    getStepById,
    getInventoryById,
    createProductionLine,
    updateProductionLine,
    refreshProductionData
  };
  
  return (
    <ProductionContext.Provider value={value}>
      {children}
    </ProductionContext.Provider>
  );
}

// Hook for using the production context
export function useProduction() {
  const context = useContext(ProductionContext);
  if (context === undefined) {
    throw new Error('useProduction must be used within a ProductionProvider');
  }
  return context;
}
