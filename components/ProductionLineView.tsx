'use client';
import { useState } from 'react';
import { useProductionLine } from '../hooks/useProductionLines';
import TrackingModal from './TrackingModal';

export default function ProductionLineView({
  lineId,
  onStepClick,
}: {
  lineId: string;
  onStepClick?: (stepId: string, stepName: string, stepDescription: string) => void;
}) {
  const { line, isLoading, error } = useProductionLine(lineId);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<{
    id: string;
    name: string;
    description: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
  
  if (error || !line) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-red-500">{error || 'Production line not found'}</p>
      </div>
    );
  }
  
  const toggleStepExpand = (stepId: string) => {
    setExpandedStepId(expandedStepId === stepId ? null : stepId);
  };

  const handleStepClick = (stepId: string, stepName: string, stepDescription: string) => {
    setSelectedStep({
      id: stepId,
      name: stepName,
      description: stepDescription
    });
    setIsModalOpen(true);
    
    // Also call the parent's onStepClick if provided
    if (onStepClick) {
      onStepClick(stepId, stepName, stepDescription);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStep(null);
  };

  // Sort steps by order
  const sortedSteps = [...line.steps].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">{line.name}</h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date(line.updatedAt).toLocaleDateString()}
        </div>
      </div>
      
      {line.description && (
        <p className="text-gray-600 mb-4">{line.description}</p>
      )}
      
      {/* Production Line Flow Visualization */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Production Flow</h3>
        <div className="flex flex-wrap items-center gap-2">
          {line.flowOrder.sort((a, b) => a.order - b.order).map((item, index) => (
            <div key={item._id} className="flex items-center">
              {/* Arrow between items */}
              {index > 0 && (
                <div className="mx-2 text-gray-400">→</div>
              )}
              
              {/* Item box */}
              <div 
                className={`
                  p-3 rounded-lg transition-all cursor-pointer
                  ${item.itemType === 'steps' 
                    ? 'bg-blue-100 border border-blue-300 hover:bg-blue-200' 
                    : 'bg-green-100 border border-green-300 hover:bg-green-200'}
                `}
                onClick={() => {
                  if (item.itemType === 'steps') {
                    handleStepClick(
                      item.itemId._id,
                      item.itemId.name,
                      item.itemId.description || ''
                    );
                  }
                }}
              >
                <div className="font-medium">{item.itemId.name}</div>
                {item.itemId.description && (
                  <div className="text-xs text-gray-600">{item.itemId.description}</div>
                )}
                {item.itemType === 'productionInventory' && item.itemId.quantity !== undefined && (
                  <div className="text-xs text-gray-600">Qty: {item.itemId.quantity}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Production Line Steps Detail */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Production Steps</h3>
        {sortedSteps.map((step, index) => (
          <div key={step._id} className="border rounded-lg overflow-hidden">
            <div 
              className={`flex justify-between items-center p-4 cursor-pointer ${
                expandedStepId === step.stepId._id ? 'bg-blue-50' : 'bg-gray-50'
              }`}
              onClick={() => toggleStepExpand(step.stepId._id)}
            >
              <div className="flex items-center">
                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-medium">{step.stepId.name}</h3>
                  {step.stepId.description && (
                    <p className="text-sm text-gray-600">{step.stepId.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStepClick(step.stepId._id, step.stepId.name, step.stepId.description || '');
                  }}
                >
                  View
                </button>
                <svg 
                  className={`ml-2 w-5 h-5 transition-transform ${
                    expandedStepId === step.stepId._id ? 'transform rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Expanded content - we'll implement this later when we have layer data */}
            {expandedStepId === step.stepId._id && (
              <div className="p-4 border-t">
                <p className="text-gray-500 text-center py-4">
                  Layer tracking will be implemented in the next phase
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Tracking Modal */}
      {isModalOpen && selectedStep && (
        <TrackingModal
          stepId={selectedStep.id}
          stepName={selectedStep.name}
          stepDescription={selectedStep.description}
          glasses={[]} // We'll implement this later
          onClose={closeModal}
        />
      )}
    </div>
  );
}
