'use client';
import { useRef, useEffect } from 'react';
import { useWorkerInput } from '../hooks/useWorkerInput';

export default function WorkerInputForm({
  stepId,
  stepName,
}: {
  stepId: string;
  stepName?: string;
}) {
  const {
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
  } = useWorkerInput(stepId);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus the input field when the component mounts or after submission
  useEffect(() => {
    if (inputRef.current && !currentLayer) {
      inputRef.current.focus();
    }
  }, [currentLayer]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLayerSubmit(layerId);
  };
  
  // if (!currentWorker) {
  //   return (
  //     <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto p-6">
  //       <div className="text-center py-8">
  //         <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  //         </svg>
  //         <h2 className="text-xl font-semibold text-gray-700 mb-2">Worker Login Required</h2>
  //         <p className="text-gray-500 mb-6">Please log in to access the worker station</p>
  //         <a href="/worker-login" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
  //           Go to Login
  //         </a>
  //       </div>
  //     </div>
  //   );
  // }
  
  // if (!isWorkerAssigned) {
  //   return (
  //     <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto p-6">
  //       <div className="text-center py-8">
  //         <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  //         </svg>
  //         <h2 className="text-xl font-semibold text-gray-700 mb-2">Not Assigned to This Step</h2>
  //         <p className="text-gray-500 mb-6">You are not assigned to work on this production step</p>
  //         <div className="text-sm text-gray-500">
  //           Current worker: <span className="font-medium">{currentWorker.name}</span>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Worker Station</h2>
            <p className="text-blue-100">Step: {stepName || 'Processing'}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-sm text-blue-100">Worker</p>
            <p className="font-medium">{currentWorker?.name}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Layer ID Input Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label htmlFor="layerId" className="block text-sm font-medium text-gray-700 mb-1">
                Enter Layer ID
              </label>
              <input
                ref={inputRef}
                type="text"
                id="layerId"
                value={layerId}
                onChange={(e) => setLayerId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Scan or type layer ID..."
                required
                disabled={!!currentLayer || isProcessing}
              />
            </div>
            <button
              type="submit"
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
              disabled={!layerId || !!currentLayer || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Check'}
            </button>
          </div>
          
          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}
        </form>
        
        {/* Current Layer Details */}
        {currentLayer && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Layer Details</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Layer ID</p>
                <p className="font-medium">{currentLayer.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Batch</p>
                <p className="font-medium">{currentLayer.batchId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dimensions</p>
                <p className="font-medium">{currentLayer.dimensions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Material</p>
                <p className="font-medium">{currentLayer.material}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Thickness</p>
                <p className="font-medium">{currentLayer.thickness} mm</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Status</p>
                <p className="font-medium">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    currentLayer.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : currentLayer.status === 'in-progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : currentLayer.status === 'defective'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentLayer.status}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="processComplete"
                  type="checkbox"
                  checked={isProcessComplete}
                  onChange={(e) => setIsProcessComplete(e.target.checked)}
                  className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="processComplete" className="ml-2 text-gray-700">
                  Process complete
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isDefective"
                  type="checkbox"
                  checked={isDefective}
                  onChange={(e) => setIsDefective(e.target.checked)}
                  className="h-5 w-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                />
                <label htmlFor="isDefective" className="ml-2 text-gray-700">
                  Mark as defective
                </label>
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any notes about this process..."
                />
              </div>
              
              <button
                onClick={handleProcessComplete}
                disabled={!isProcessComplete || isProcessing}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Complete & Continue'}
              </button>
            </div>
          </div>
        )}
        
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}
        
        {/* Recent Processed Layers */}
        {recentLayers.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Recently Processed</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Layer ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentLayers.map((layer) => (
                    <tr key={layer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {layer.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {layer.batchId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          layer.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : layer.status === 'in-progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {layer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(layer.updatedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
