import { useState, useEffect } from 'react';
import { getNextStep } from '@/utils/productionUtils';

interface ProductLayer {
  _id: string;
  customer: any;
  code: string;
  glass: any;
  treatments: any[];
  width: number;
  height: number;
  product: any;
  invoice: any;
  productionCode: string;
  productionLine: any;
  productionDate: string;
  currentStep: any;
  currentline: any;
  currentInventory?: any;
  productionNotes?: string;
  designNumber: any;
}

export function useOptimizationLayers() {
  const [productLayers, setProductLayers] = useState<ProductLayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductLayers = async () => {
    try {
      setLoading(true);
      console.log('Fetching product layers...');

      const response = await fetch('/api/productLayer');
      if (!response.ok) {
        throw new Error('Failed to fetch product layers');
      }

      const data = await response.json();
      console.log(`Fetched ${data.productLayers?.length || 0} product layers`);

      // Filter layers that need optimization - just check current step name
      const optimizationLayers = data.productLayers.filter((layer: ProductLayer) => {
        const isOptimizer = layer.currentStep?.name?.toLowerCase() === "optimizer";
        console.log(`Layer ${layer._id} current step: ${layer.currentStep?.name}, needs optimization: ${isOptimizer}`);
        return isOptimizer;
      });

      console.log(`Found ${optimizationLayers.length} layers that need optimization`);

      // Sort by productionDate from sooner to later
      const sortedLayers = optimizationLayers.sort((a: ProductLayer, b: ProductLayer) => {
        return new Date(a.productionDate).getTime() - new Date(b.productionDate).getTime();
      });

      setProductLayers(sortedLayers);
      setError(null);
    } catch (err) {
      console.error('Error loading product layers:', err);
      setError('Error loading product layers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductLayers();

    // Set up polling to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing product layers...');
      fetchProductLayers();
    }, 30000);

    // Clean up interval on component unmount
    return () => {
      console.log('Cleaning up interval');
      clearInterval(intervalId);
    };
  }, []);

  // Function to move a layer to the next step
  const moveToNextStep = async (layerId: string) => {
    console.log(`Moving layer ${layerId} to next step...`);

    try {
      const layer = productLayers.find(l => l._id === layerId);
      if (!layer) {
        console.error(`Layer ${layerId} not found`);
        throw new Error('Layer not found');
      }

      // Get the next step
      const nextStep = getNextStep(layer);

      if (!nextStep) {
        console.error(`No next step found for layer ${layerId}`);
        throw new Error('No next step found');
      }

      console.log(`Moving layer ${layerId} from step ${layer.currentStep?.name} to next step with ID ${nextStep._id}`);

      // Update the layer's current step
      const response = await fetch('/api/productLayer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: layerId,
          currentStep: nextStep._id,
          // If the next step is in a different micro line, update the current line too
          ...(nextStep.microLineIndex !== undefined && layer.currentStep?.microLineIndex !== nextStep.microLineIndex && {
            currentline: layer.productionLine.microLines[nextStep.microLineIndex].microLine._id
          })
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`API error updating layer ${layerId}:`, errorData);
        throw new Error(`Failed to update product layer: ${errorData.error || 'Unknown error'}`);
      }

      console.log(`Successfully moved layer ${layerId} to next step`);

      // Refresh the layers to get updated data
      await fetchProductLayers();

      return true;
    } catch (err) {
      console.error('Error moving to next step:', err);
      return false;
    }
  };

  // Function to move multiple layers to the next step
  const moveMultipleToNextStep = async (layerIds: string[]) => {
    console.log(`Moving ${layerIds.length} layers to next step...`);

    let successCount = 0;

    for (const layerId of layerIds) {
      const success = await moveToNextStep(layerId);
      if (success) {
        successCount++;
      }
    }

    console.log(`Finished moving layers. Success: ${successCount}/${layerIds.length}`);
    return successCount;
  };

  return {
    productLayers,
    loading,
    error,
    refreshLayers: fetchProductLayers,
    moveToNextStep,
    moveMultipleToNextStep
  };
}
