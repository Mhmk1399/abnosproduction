import { useState, useCallback, useMemo } from 'react';
import { useInventories } from '../contexts/InventoryContext';
import { useLayers } from '../contexts/LayerContext';

export function useInventoryManagement(inventoryId?: string) {
  const { 
    inventories, 
    getLayersByInventory, 
    addLayerToInventory, 
    removeLayerFromInventory, 
    transferLayer,
    refreshInventories
  } = useInventories();
  
  const { getLayerById } = useLayers();
  
  const [selectedInventory, setSelectedInventory] = useState(inventoryId || '');
  const [selectedLayerId, setSelectedLayerId] = useState('');
  const [targetInventoryId, setTargetInventoryId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get inventory data
  const inventory = useMemo(() => {
    if (!selectedInventory) return null;
    return inventories.find(inv => inv.id === selectedInventory) || null;
  }, [selectedInventory, inventories]);
  
  // Get layers in the selected inventory
  const inventoryLayers = useMemo(() => {
    if (!selectedInventory) return [];
    return getLayersByInventory(selectedInventory);
  }, [selectedInventory, getLayersByInventory]);
  
  // Handle adding a layer to inventory
  const handleAddLayer = useCallback(async (layerId: string) => {
    if (!selectedInventory) {
      setError('No inventory selected');
      return false;
    }
    
    try {
      setIsProcessing(true);
      setError('');
      
      const layer = getLayerById(layerId);
      if (!layer) {
        setError(`Layer ${layerId} not found`);
        setIsProcessing(false);
        return false;
      }
      
      if (layer.inventoryId) {
        setError(`Layer ${layerId} is already in inventory ${layer.inventoryId}`);
        setIsProcessing(false);
        return false;
      }
      
      const success = await addLayerToInventory(layerId, selectedInventory);
      
      if (!success) {
        setError('Failed to add layer to inventory');
        setIsProcessing(false);
        return false;
      }
      
      await refreshInventories();
      setSuccess(`Layer ${layerId} added to inventory successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      setIsProcessing(false);
      return true;
    } catch (err) {
      console.error('Error adding layer to inventory:', err);
      setError('An error occurred while adding the layer');
      setIsProcessing(false);
      return false;
    }
  }, [selectedInventory, getLayerById, addLayerToInventory, refreshInventories]);
  
  // Handle removing a layer from inventory
  const handleRemoveLayer = useCallback(async (layerId: string) => {
    if (!selectedInventory) {
      setError('No inventory selected');
      return false;
    }
    
    try {
      setIsProcessing(true);
      setError('');
      
      const success = await removeLayerFromInventory(layerId, selectedInventory);
      
      if (!success) {
        setError('Failed to remove layer from inventory');
        setIsProcessing(false);
        return false;
      }
      
      await refreshInventories();
      setSuccess(`Layer ${layerId} removed from inventory successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      setIsProcessing(false);
      return true;
    } catch (err) {
      console.error('Error removing layer from inventory:', err);
      setError('An error occurred while removing the layer');
      setIsProcessing(false);
      return false;
    }
  }, [selectedInventory, removeLayerFromInventory, refreshInventories]);
  
  // Handle transferring a layer between inventories
  const handleTransferLayer = useCallback(async () => {
    if (!selectedInventory || !targetInventoryId || !selectedLayerId) {
      setError('Please select source inventory, target inventory, and layer');
      return false;
    }
    
    if (selectedInventory === targetInventoryId) {
      setError('Source and target inventories must be different');
      return false;
    }
    
    try {
      setIsProcessing(true);
      setError('');
      
      const success = await transferLayer(selectedLayerId, selectedInventory, targetInventoryId);
      
      if (!success) {
        setError('Failed to transfer layer');
        setIsProcessing(false);
        return false;
      }
      
      await refreshInventories();
      setSuccess(`Layer ${selectedLayerId} transferred successfully`);
      
      // Reset selection
      setSelectedLayerId('');
      setTargetInventoryId('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      setIsProcessing(false);
      return true;
    } catch (err) {
      console.error('Error transferring layer:', err);
      setError('An error occurred while transferring the layer');
      setIsProcessing(false);
      return false;
    }
  }, [selectedInventory, targetInventoryId, selectedLayerId, transferLayer, refreshInventories]);
  
  return {
    inventories,
    selectedInventory,
    setSelectedInventory,
    inventory,
    inventoryLayers,
    selectedLayerId,
    setSelectedLayerId,
    targetInventoryId,
    setTargetInventoryId,
    error,
    success,
    isProcessing,
    handleAddLayer,
    handleRemoveLayer,
    handleTransferLayer
  };
}
