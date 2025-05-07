'use client';

import { useState } from 'react';
import { useOptimizationLayers } from '@/hooks/useOptimizationLayers';
import { format } from 'date-fns';

export default function OptimizerPage() {
  const { 
    productLayers, 
    loading, 
    error, 
    refreshLayers,
    moveToNextStep,
    moveMultipleToNextStep
  } = useOptimizationLayers();
  
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [processingLayers, setProcessingLayers] = useState<string[]>([]);

  
  const handleSelectLayer = (id: string) => {
    setSelectedLayers(prev => {
      if (prev.includes(id)) {
        return prev.filter(layerId => layerId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedLayers.length === productLayers.length) {
      // Deselect all
      setSelectedLayers([]);
    } else {
      // Select all
      setSelectedLayers(productLayers.map(layer => layer._id));
    }
  };

  const handleMoveToNextStep = async (layerId: string) => {
    setProcessingLayers(prev => [...prev, layerId]);
    try {
      const success = await moveToNextStep(layerId);
      if (!success) {
        alert('Failed to move layer to next step');
      }
    } finally {
      setProcessingLayers(prev => prev.filter(id => id !== layerId));
    }
  };

  const handleMoveSelectedToNextStep = async () => {
    if (selectedLayers.length === 0) {
      alert('Please select at least one layer');
      return;
    }

    setProcessingLayers(selectedLayers);
    try {
      const results = await moveMultipleToNextStep(selectedLayers);
      const failures = results.filter(r => !r.success);
      
      if (failures.length > 0) {
        alert(`Failed to move ${failures.length} layers to next step`);
      } else {
        // Clear selection after successful move
        setSelectedLayers([]);
      }
    } finally {
      setProcessingLayers([]);
    }
  };

  const handleGenerateTrfFile = async () => {
    if (selectedLayers.length === 0) {
      alert('Please select at least one layer');
      return;
    }

    try {
      const selectedLayersData = productLayers.filter(layer => 
        selectedLayers.includes(layer._id)
      );

      const response = await fetch('/api/trfGenrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedLayers: selectedLayersData }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate TRF file');
      }

      const result = await response.json();
      alert(`TRF file generated successfully: ${result.fileName}`);
      
      // Provide download link
      window.open(result.downloadUrl, '_blank');
    } catch (err) {
      console.error('Error generating TRF file:', err);
      alert('Failed to generate TRF file');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading optimization layers...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Optimizer</h1>
      
      <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
        <div>
          <span className="font-semibold">Layers needing optimization: {productLayers.length}</span>
          {productLayers.length > 0 && (
            <button 
              onClick={handleSelectAll}
              className="ml-4 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              {selectedLayers.length === productLayers.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {selectedLayers.length > 0 && (
            <>
              <button 
                onClick={handleMoveSelectedToNextStep}
                disabled={processingLayers.length > 0}
                className={`px-4 py-2 rounded ${
                  processingLayers.length > 0 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {processingLayers.length > 0 ? 'Processing...' : 'Move Selected to Next Step'}
              </button>
              <button 
                onClick={handleGenerateTrfFile}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Generate TRF File
              </button>
            </>
          )}
          <button 
            onClick={refreshLayers}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Refresh
          </button>
        </div>
      </div>

      {productLayers.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p className="text-yellow-700">No layers currently need optimization.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Select</th>
                <th className="py-2 px-4 border-b text-left">Code</th>
                <th className="py-2 px-4 border-b text-left">Production Code</th>
                <th className="py-2 px-4 border-b text-left">Customer</th>
                <th className="py-2 px-4 border-b text-left">Dimensions</th>
                <th className="py-2 px-4 border-b text-left">Production Date</th>
                <th className="py-2 px-4 border-b text-left">Current Step</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productLayers.map((layer) => (
                <tr key={layer._id} className={`border-b hover:bg-gray-50 ${selectedLayers.includes(layer._id) ? 'bg-blue-50' : ''}`}>
                  <td className="py-2 px-4">
                    <input 
                      type="checkbox" 
                      checked={selectedLayers.includes(layer._id)}
                      onChange={() => handleSelectLayer(layer._id)}
                      className="h-5 w-5"
                      disabled={processingLayers.includes(layer._id)}
                    />
                  </td>
                  <td className="py-2 px-4">{layer.code}</td>
                  <td className="py-2 px-4">{layer.productionCode}</td>
                  <td className="py-2 px-4">{layer.customer?.name || 'N/A'}</td>
                  <td className="py-2 px-4">{layer.width} × {layer.height}</td>
                  <td className="py-2 px-4">
                    {layer.productionDate ? format(new Date(layer.productionDate), 'yyyy-MM-dd') : 'N/A'}
                  </td>
                  <td className="py-2 px-4">{layer.currentStep?.name || 'N/A'}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleMoveToNextStep(layer._id)}
                      disabled={processingLayers.includes(layer._id)}
                      className={`${
                        processingLayers.includes(layer._id)
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-green-500 hover:text-green-700'
                      } mr-2`}
                    >
                      {processingLayers.includes(layer._id) ? 'Processing...' : 'Move to Next Step'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
