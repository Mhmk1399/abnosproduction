'use client';
import { useState } from 'react';
import { useProductionLineView } from '../hooks/useProductionLineView';

export default function ProductionLineView({
  lineId,
  onStepClick,
}: {
  lineId: string;
  onStepClick?: (stepId: string, stepName: string) => void;
}) {
  const { line, layersByStep, statistics, isLoading } = useProductionLineView(lineId);
  console.log('ProductionLineView render:', { lineId, line, isLoading });
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!line) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-red-500">Production line not found</p>
      </div>
    );
  }
  
  const toggleStepExpand = (stepId: string) => {
    setExpandedStepId(expandedStepId === stepId ? null : stepId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">{line.name}</h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date(line.updatedAt).toLocaleDateString()}
        </div>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700">Total Layers</p>
          <p className="text-xl font-semibold">{statistics.total}</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
          <p className="text-sm text-yellow-700">In Progress</p>
          <p className="text-xl font-semibold">{statistics.inProgress}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
          <p className="text-sm text-green-700">Completed</p>
          <p className="text-xl font-semibold">{statistics.completed}</p>
        </div>
        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
          <p className="text-sm text-red-700">Defective</p>
          <p className="text-xl font-semibold">{statistics.defective}</p>
        </div>
      </div>
      
      {/* Production Line Steps */}
      <div className="space-y-4">
        {line.steps.map((step, index) => (
          <div key={step.id} className="border rounded-lg overflow-hidden">
            <div 
              className={`flex justify-between items-center p-4 cursor-pointer ${
                expandedStepId === step.id ? 'bg-blue-50' : 'bg-gray-50'
              }`}
              onClick={() => toggleStepExpand(step.id)}
            >
              <div className="flex items-center">
                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-medium">{step.name}</h3>
                  {step.description && (
                    <p className="text-sm text-gray-600">{step.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="mr-4 text-sm">
                  <span className="font-medium">{layersByStep[step.id]?.length || 0}</span> layers
                </div>
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onStepClick) onStepClick(step.id, step.name);
                  }}
                >
                  View
                </button>
                <svg 
                  className={`ml-2 w-5 h-5 transition-transform ${
                    expandedStepId === step.id ? 'transform rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Expanded content - layers in this step */}
            {expandedStepId === step.id && (
              <div className="p-4 border-t">
                {layersByStep[step.id]?.length > 0 ? (
                  <div className="overflow-x-auto">
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
                            Dimensions
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {layersByStep[step.id].map((layer) => (
                          <tr key={layer.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {layer.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {layer.batchId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {layer.dimensions}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                layer.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : layer.status === 'in-progress'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : layer.status === 'defective'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                              }`}>
                                {layer.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No layers in this step</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
