'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Worker {
  id: string;
  name: string;
  role: string;
  assignedStepId?: string;
  isActive: boolean;
}

interface WorkerContextType {
  // Data
  workers: Worker[];
  currentWorker: Worker | null;
  isLoading: boolean;
  error: string | null;
  
  // Operations
  loginWorker: (workerId: string) => Promise<boolean>;
  logoutWorker: () => void;
  assignWorkerToStep: (workerId: string, stepId: string) => Promise<boolean>;
  unassignWorker: (workerId: string) => Promise<boolean>;
  
  // Queries
  getWorkerById: (id: string) => Worker | undefined;
  getWorkersByStep: (stepId: string) => Worker[];
  
  // Refresh data
  refreshWorkers: () => Promise<void>;
}

const WorkerContext = createContext<WorkerContextType | undefined>(undefined);

export function WorkerProvider({ children }: { children: ReactNode }) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [currentWorker, setCurrentWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch workers data
  const fetchWorkers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/assets/data/workers.json');
      if (!response.ok) throw new Error('Failed to fetch workers data');
      
      const data = await response.json();
      setWorkers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching workers:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchWorkers();
    
    // Check for logged in worker in localStorage
    const savedWorkerId = localStorage.getItem('currentWorkerId');
    if (savedWorkerId) {
      loginWorker(savedWorkerId);
    }
  }, []);
  
  // Worker operations
  const loginWorker = async (workerId: string) => {
    try {
      const worker = workers.find(w => w.id === workerId);
      if (!worker) {
        setError(`Worker with ID ${workerId} not found`);
        return false;
      }
      
      if (!worker.isActive) {
        setError(`Worker ${worker.name} is not active`);
        return false;
      }
      
      setCurrentWorker(worker);
      localStorage.setItem('currentWorkerId', workerId);
      return true;
    } catch (err) {
      console.error('Error logging in worker:', err);
      setError('Failed to log in worker');
      return false;
    }
  };
  
  const logoutWorker = () => {
    setCurrentWorker(null);
    localStorage.removeItem('currentWorkerId');
  };
  
  const assignWorkerToStep = async (workerId: string, stepId: string) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll update our local state
      setWorkers(prev => 
        prev.map(worker => worker.id === workerId ? 
          { ...worker, assignedStepId: stepId } : worker
        )
      );
      
      // Update current worker if it's the one being assigned
      if (currentWorker?.id === workerId) {
        setCurrentWorker({ ...currentWorker, assignedStepId: stepId });
      }
      
      return true;
    } catch (err) {
      console.error('Error assigning worker to step:', err);
      return false;
    }
  };
  
  const unassignWorker = async (workerId: string) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll update our local state
      setWorkers(prev => 
        prev.map(worker => worker.id === workerId ? 
          { ...worker, assignedStepId: undefined } : worker
        )
      );
      
      // Update current worker if it's the one being unassigned
      if (currentWorker?.id === workerId) {
        setCurrentWorker({ ...currentWorker, assignedStepId: undefined });
      }
      
      return true;
    } catch (err) {
      console.error('Error unassigning worker:', err);
      return false;
    }
  };
  
  // Worker queries
  const getWorkerById = (id: string) => workers.find(worker => worker.id === id);
  
  const getWorkersByStep = (stepId: string) => 
    workers.filter(worker => worker.assignedStepId === stepId);
  
  // Refresh data function
  const refreshWorkers = async () => {
    await fetchWorkers();
  };
  
  const value = {
    workers,
    currentWorker,
    isLoading,
    error,
    loginWorker,
    logoutWorker,
    assignWorkerToStep,
    unassignWorker,
    getWorkerById,
    getWorkersByStep,
    refreshWorkers
  };
  
  return (
    <WorkerContext.Provider value={value}>
      {children}
    </WorkerContext.Provider>
  );
}

// Hook for using the worker context
export function useWorkers() {
  const context = useContext(WorkerContext);
  if (context === undefined) {
    throw new Error('useWorkers must be used within a WorkerProvider');
  }
  return context;
}
