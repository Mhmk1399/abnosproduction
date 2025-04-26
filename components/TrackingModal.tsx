import { Glass, ProductionStep } from "../types/production";
import { useState } from "react";

export default function TrackingModal({
  stepId,
  stepName,
  stepDescription,
  glasses,
  onClose,
}: {
  stepId: string;
  stepName: string;
  stepDescription: string;
  glasses: Glass[];
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  
  // Calculate some statistics for the dashboard
  const totalGlasses = glasses.length;
  const completedGlasses = glasses.filter(g => g.status === 'completed').length;
  const inProgressGlasses = glasses.filter(g => g.status === 'in-progress').length;
  const defectiveGlasses = glasses.filter(g => g.status === 'defective').length;
  
  // Group glasses by batch for the batch summary
  const batchSummary = glasses.reduce((acc, glass) => {
    if (!acc[glass.batchId]) {
      acc[glass.batchId] = { total: 0, completed: 0, inProgress: 0, defective: 0 };
    }
    
    acc[glass.batchId].total += 1;
    if (glass.status === 'completed') acc[glass.batchId].completed += 1;
    if (glass.status === 'in-progress') acc[glass.batchId].inProgress += 1;
    if (glass.status === 'defective') acc[glass.batchId].defective += 1;
    
    return acc;
  }, {} as Record<string, { total: number, completed: number, inProgress: number, defective: number }>);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{stepName}</h2>
              <p className="text-blue-100 mt-1">{stepDescription}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white bg-blue-600 hover:bg-blue-700 rounded-full h-8 w-8 flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{totalGlasses}</div>
              <div className="text-sm text-blue-100">Total Glasses</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{inProgressGlasses}</div>
              <div className="text-sm text-blue-100">In Progress</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{completedGlasses}</div>
              <div className="text-sm text-blue-100">Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{defectiveGlasses}</div>
              <div className="text-sm text-blue-100">Defective</div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'current' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('current')}
            >
              Current Glasses
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'history' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('history')}
            >
              Batch Summary
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'current' ? (
            glasses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Glass ID
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dimensions
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time in Step
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {glasses.map((glass) => (
                      <tr key={glass.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {glass.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {glass.batchId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {glass.dimensions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            glass.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : glass.status === 'in-progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {glass.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {/* Simulate time in step - in a real app, calculate from timestamps */}
                          {Math.floor(Math.random() * 120) + 10} minutes
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">No glasses currently in this step</p>
                <p className="text-sm mt-1">Glasses will appear here when they enter this production step</p>
              </div>
            )
          ) : (
            // Batch Summary Tab
            Object.keys(batchSummary).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(batchSummary).map(([batchId, stats]) => (
                  <div key={batchId} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Batch: {batchId}</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Total Glasses:</span>
                        <span className="font-medium">{stats.total}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">In Progress:</span>
                        <span className="font-medium text-yellow-600">{stats.inProgress}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Completed:</span>
                        <span className="font-medium text-green-600">{stats.completed}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Defective:</span>
                        <span className="font-medium text-red-600">{stats.defective}</span>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(stats.completed / stats.total) * 100}%` }}></div>
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        {Math.round((stats.completed / stats.total) * 100)}% Complete
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-lg font-medium">No batch data available</p>
                <p className="text-sm mt-1">Batch summary will appear when glasses are processed</p>
              </div>
            )
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Step ID: {stepId}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
            <button
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Move Glasses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
