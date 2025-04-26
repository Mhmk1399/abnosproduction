import { useState, useCallback } from 'react';
import { useLayers } from '../contexts/LayerContext';
import { useWorkers } from '../contexts/WorkerContext';

export function useWorkerInput(stepId: string) {
  const { getLayerById, startProcessing, completeProcessing, refreshLayers } = useLayers();
  const { currentWorker } = useWorkers();
  
  const [layerId, setLayerId] = useState('');
  const [currentLayer, setCurrentLayer] = useState<ReturnType<typeof getLayerById>>(undefined);
  const [isProcessComplete, setIsProcessComplete] = useState(false);
  const [isDefective, setIsDefective] = useState(false);
  const [notes, setNotes] = useState('');
  const [recentLayers, setRecentLayers] = useState<Array<NonNullable<ReturnType<typeof getLayerById>>>>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Check if a worker is logged in and assigned to this step
  const isWorkerAssigned = currentWorker && currentWorker.assignedStepId === stepId;
  
  // Handle layer ID submission
  const handleLayerSubmit = useCallback(async (id: string) => {
    if (!isWorkerAssigned) {
      setError('You must be assigned to this step to process layers');
      return false;
    }
    
    setError('');
    setLayerId(id);
    
    try {
      // Get the layer data
      const layer = getLayerById(id);
      
      if (!layer) {
        setError(`Layer ID ${id} not found`);
        return false;
      }
      
      if (layer.status !== 'pending' && layer.status !== 'in-progress') {
        setError(`Layer ${id} is already ${layer.status}`);
        return false;
      }
      
      if (layer.currentStepId !== stepId) {
        setError(`Layer ${id} is not assigned to this step`);
        return false;
      }
      
      // Set the current layer
      setCurrentLayer(layer);
      setIsProcessComplete(false);
      setIsDefective(false);
      setNotes('');
      
      // If layer is pending, start processing
      if (layer.status === 'pending' && currentWorker) {
        setIsProcessing(true);
        const success = await startProcessing(id, currentWorker.id, stepId);
        setIsProcessing(false);
        
        if (!success) {
          setError('Failed to start processing the layer');
          return false;
        }
        
        // Refresh layer data
        await refreshLayers();
        // Update current layer with fresh data
        setCurrentLayer(getLayerById(id));
      }
      
      return true;
    } catch (err) {
      console.error('Error submitting layer:', err);
      setError('An error occurred while processing the layer');
      return false;
    }
  }, [isWorkerAssigned, getLayerById, startProcessing, refreshLayers, currentWorker, stepId]);
  
  // Handle process completion
  const handleProcessComplete = useCallback(async () => {
    if (!currentLayer || !isWorkerAssigned) return false;
    
    try {
      setIsProcessing(true);
      const success = await completeProcessing(currentLayer.id, isDefective, notes);
      setIsProcessing(false);
      
      if (!success) {
        setError('Failed to complete processing');
        return false;
      }
      
      // Refresh layer data
      await refreshLayers();
      
      // Get updated layer data
      const updatedLayer = getLayerById(currentLayer.id);
      
      if (updatedLayer) {
        // Add to recent layers
        setRecentLayers(prev => [updatedLayer, ...prev].slice(0, 5));
      }
      
      // Show success message
      setSuccess(`Layer ${currentLayer.id} processed successfully`);
      
      // Reset form for next entry
      setCurrentLayer(undefined);
      setLayerId('');
      setIsProcessComplete(false);
      setIsDefective(false);
      setNotes('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      return true;
    } catch (err) {
      console.error('Error completing process:', err);
      setError('An error occurred while completing the process');
      return false;
    }
  }, [currentLayer, isWorkerAssigned, completeProcessing, isDefective, notes, refreshLayers, getLayerById]);
  
  return {
    layerId,
    setLayerId,
    currentLayer,
    isProcessComplete,
    setIsProcessComplete,
    isDefective,
    setIsDefective,
    notes,
    setNotes,
    recentLayers,
    error,
    success,
    isProcessing,
    isWorkerAssigned,
    handleLayerSubmit,
    handleProcessComplete,
    currentWorker
  };
}
