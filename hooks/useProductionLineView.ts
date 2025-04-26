import { useMemo } from 'react';
import { useProduction } from '../contexts/ProductionContext';
import { useLayers } from '../contexts/LayerContext';

export function useProductionLineView(lineId: string) {
  const { getLineById, isLoading: isLoadingProduction } = useProduction();
  const { getLayersByLine, layers, isLoading: isLoadingLayers } = useLayers();
  
  // Get the production line data
  const line = useMemo(() => getLineById(lineId), [getLineById, lineId]);
  
  // Get layers in this production line
  const lineLayersData = useMemo(() => {
    if (!line) return [];
    return getLayersByLine(lineId);
  }, [line, getLayersByLine, lineId, layers]);
  
  // Group layers by step
  const layersByStep = useMemo(() => {
    const result: Record<string, typeof lineLayersData> = {};
    
    if (line) {
      // Initialize with empty arrays for all steps
      line.steps.forEach(step => {
        result[step.id] = [];
      });
      
      // Add layers to their current steps
      lineLayersData.forEach(layer => {
        if (result[layer.currentStepId]) {
          result[layer.currentStepId].push(layer);
        }
      });
    }
    
    return result;
  }, [line, lineLayersData]);
  
  // Calculate statistics
  const statistics = useMemo(() => {
    const total = lineLayersData.length;
    const inProgress = lineLayersData.filter(layer => layer.status === 'in-progress').length;
    const completed = lineLayersData.filter(layer => layer.status === 'completed').length;
    const defective = lineLayersData.filter(layer => layer.status === 'defective').length;
    
    return {
      total,
      inProgress,
      completed,
      defective,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      defectRate: total > 0 ? (defective / total) * 100 : 0
    };
  }, [lineLayersData]);
  
  return {
    line,
    lineLayersData,
    layersByStep,
    statistics,
    isLoading: isLoadingProduction || isLoadingLayers
  };
}
