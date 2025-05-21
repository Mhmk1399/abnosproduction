"use client";

import { useState } from "react";
import { useProductLayers } from "@/hooks/useProductLayers";
import { BarcodeService } from "@/services/barcodeService";
import { FiPrinter, FiRefreshCw, FiSearch, FiBarChart2 } from "react-icons/fi";

export default function LayerList() {
  const { layers, isLoading, error, mutate } = useProductLayers();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);

  // Filter layers based on search term
  const filteredLayers = layers.filter(layer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      layer.productionCode?.toLowerCase().includes(searchLower) ||
      (typeof layer.glass === 'object' && layer.glass?.name?.toLowerCase().includes(searchLower)) ||
      (layer.width && layer.height && `${layer.width}x${layer.height}`.includes(searchTerm))
    );
  });

  // Toggle layer selection
  const toggleLayerSelection = (layerId: string) => {
    setSelectedLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId) 
        : [...prev, layerId]
    );
  };

  // Print barcode for a single layer
  const printBarcode = (layerId: string, label: string) => {
    BarcodeService.printBarcode(layerId, label);
  };

  // Print barcodes for all selected layers
  const printSelectedBarcodes = () => {
    // Create a new window for printing multiple barcodes
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow pop-ups to print barcodes');
      return;
    }
    
    // Get selected layers data
    const selectedLayersData = layers.filter(layer => selectedLayers.includes(layer._id));
    
    // Generate HTML content with all barcodes
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Barcodes</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .barcodes-container {
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
              justify-content: center;
            }
            .barcode-item {
              border: 1px solid #ddd;
              padding: 15px;
              width: 250px;
              text-align: center;
              page-break-inside: avoid;
            }
            .barcode-label {
              margin-bottom: 10px;
              font-size: 14px;
              font-weight: bold;
            }
            .barcode-details {
              margin-bottom: 10px;
              font-size: 12px;
              color: #666;
            }
            .barcode-image {
              max-width: 100%;
            }
            .barcode-id {
              margin-top: 5px;
              font-size: 10px;
              color: #999;
            }
            .print-button {
              display: block;
              margin: 20px auto;
              padding: 10px 20px;
              background: #4a90e2;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
            @media print {
              .print-button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="barcodes-container">
            ${selectedLayersData.map(layer => {
              const barcodeValue = BarcodeService.generateBarcodeValue(layer._id);
              const barcodeImage = BarcodeService.generateBarcodeDataUrl(barcodeValue, {
                height: 70,
                displayValue: true
              });
              
              return `
                <div class="barcode-item">
                  <div class="barcode-label">${layer.productionCode || 'No Code'}</div>
                  <div class="barcode-details">
                    ${layer.width}×${layer.height} - 
                    ${typeof layer.glass === 'object' ? layer.glass?.name || 'Unknown Glass' : 'Unknown Glass'}
                  </div>
                  <img src="${barcodeImage}" alt="Barcode" class="barcode-image" />
                  <div class="barcode-id">ID: ${layer._id}</div>
                </div>
              `;
            }).join('')}
          </div>
          <button class="print-button" onclick="window.print(); setTimeout(() => window.close(), 500);">
            Print All Barcodes
          </button>
        </body>
      </html>
    `);
    
    // Close the document
    printWindow.document.close();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Layer List</h1>
      
      {/* Search and Actions Bar */}
      <div className="flex flex-wrap gap-3 mb-6 items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by code, glass type, or dimensions..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex gap-2">
          {selectedLayers.length > 0 && (
            <button
              onClick={printSelectedBarcodes}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <FiPrinter className="inline" />
              <span>Print Selected ({selectedLayers.length})</span>
            </button>
          )}
          
          <button
            onClick={() => mutate()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FiRefreshCw className="inline" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p>Loading layers...</p>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Empty State */}
      {!isLoading && filteredLayers.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-6 rounded-lg text-center">
          <p className="text-lg mb-2">No layers found</p>
          <p className="text-sm">
            {searchTerm ? 'Try a different search term' : 'Add some layers to get started'}
          </p>
        </div>
      )}
      
      {/* Layers Table */}
      {!isLoading && filteredLayers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="w-10 py-3 px-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedLayers.length > 0 && selectedLayers.length === filteredLayers.length}
                      onChange={() => {
                        if (selectedLayers.length === filteredLayers.length) {
                          setSelectedLayers([]);
                        } else {
                          setSelectedLayers(filteredLayers.map(layer => layer._id));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Production Code
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dimensions
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Glass Type
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Step
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barcode
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLayers.map((layer) => (
                  <tr key={layer._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedLayers.includes(layer._id)}
                        onChange={() => toggleLayerSelection(layer._id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                      {layer.productionCode || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {layer.width} × {layer.height}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {typeof layer.glass === 'object' ? layer.glass?.name : 'Unknown'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {typeof layer.currentStep === 'object' 
                        ? layer.currentStep?.name 
                        : layer.currentStep 
                          ? 'Unknown Step' 
                          : 'Not Started'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center">
                        <FiBarChart2 className="text-gray-400 mr-2" />
                        <span className="font-mono text-xs text-gray-600">
                          {BarcodeService.generateBarcodeValue(layer._id)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => printBarcode(layer._id, layer.productionCode || 'Layer')}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
                      >
                        <FiPrinter className="inline" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
