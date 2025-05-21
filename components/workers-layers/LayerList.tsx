"use client";

import { useState } from "react";
import { useProductLayers } from "@/hooks/useProductLayers";
import { BarcodeService } from "@/services/barcodeService";
import {
  FiPrinter,
  FiRefreshCw,
  FiSearch,
  FiBarChart2,
  FiClock,
  FiCalendar,
  FiCheckSquare,
} from "react-icons/fi";

export default function LayerList() {
  const { layers, isLoading, error, mutate } = useProductLayers();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);

  // Filter layers based on search term
  const filteredLayers = layers.filter((layer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      layer.productionCode?.toLowerCase().includes(searchLower) ||
      (typeof layer.glass === "object" &&
        layer.glass?.name?.toLowerCase().includes(searchLower)) ||
      (layer.width &&
        layer.height &&
        `${layer.width}x${layer.height}`.includes(searchTerm))
    );
  });

  // Toggle layer selection
  const toggleLayerSelection = (layerId: string) => {
    setSelectedLayers((prev) =>
      prev.includes(layerId)
        ? prev.filter((id) => id !== layerId)
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
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups to print barcodes");
      return;
    }

    // Get selected layers data
    const selectedLayersData = layers.filter((layer) =>
      selectedLayers.includes(layer._id)
    );

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
            ${selectedLayersData
              .map((layer) => {
                const barcodeValue = BarcodeService.generateBarcodeValue(
                  layer._id
                );
                const barcodeImage = BarcodeService.generateBarcodeDataUrl(
                  barcodeValue,
                  {
                    height: 70,
                    displayValue: true,
                  }
                );

                return `
                <div class="barcode-item">
                  <div class="barcode-label">${
                    layer.productionCode || "No Code"
                  }</div>
                  <div class="barcode-details">
                    ${layer.width}×${layer.height} - 
                    ${
                      typeof layer.glass === "object"
                        ? layer.glass?.name || "Unknown Glass"
                        : "Unknown Glass"
                    }
                  </div>
                  <img src="${barcodeImage}" alt="Barcode" class="barcode-image" />
                  <div class="barcode-id">ID: ${layer._id}</div>
                </div>
              `;
              })
              .join("")}
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
    <div className="container mx-auto p-4 mt-20" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">لیست لایه‌ها</h1>

      {/* نوار جستجو و اقدامات */}
      <div className="flex flex-wrap gap-3 mb-6 items-center justify-between bg-white p-5 rounded-lg shadow-sm">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجو بر اساس کد، نوع شیشه یا ابعاد..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex gap-2">
          {/* Select All Button */}
          {filteredLayers.length > 0 && (
            <button
              onClick={() => {
                if (selectedLayers.length === filteredLayers.length) {
                  // If all are selected, deselect all
                  setSelectedLayers([]);
                } else {
                  // Otherwise, select all
                  setSelectedLayers(filteredLayers.map((layer) => layer._id));
                }
              }}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-sm"
            >
              <FiCheckSquare className="inline" />
              <span>
                {selectedLayers.length === filteredLayers.length
                  ? "لغو انتخاب همه"
                  : "انتخاب همه"}
              </span>
            </button>
          )}

          {selectedLayers.length > 0 && (
            <button
              onClick={printSelectedBarcodes}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <FiPrinter className="inline" />
              <span>چاپ انتخاب شده‌ها ({selectedLayers.length})</span>
            </button>
          )}

          <button
            onClick={() => mutate()}
            className="flex items-center px-4 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-200 shadow-sm"
          >
            <div
              className={`absolute inset-0 bg-gray-200 opacity-50 ${
                isLoading ? "animate-pulse" : "hidden"
              }`}
            ></div>
            <FiRefreshCw
              className={`text-gray-50 ml-1 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>بروزرسانی</span>
          </button>
        </div>
      </div>

      {/* وضعیت بارگذاری */}
      {isLoading && (
        <div className="text-center p-10 bg-white rounded-lg shadow-sm">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری لایه‌ها...</p>
        </div>
      )}

      {/* وضعیت خطا */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-lg mb-6 shadow-sm">
          <p className="font-bold mb-1">خطا</p>
          <p>{error}</p>
        </div>
      )}

      {/* وضعیت خالی */}
      {!isLoading && filteredLayers.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-8 rounded-lg text-center shadow-sm">
          <p className="text-lg mb-2 font-medium">هیچ لایه‌ای یافت نشد</p>
          <p className="text-sm">
            {searchTerm
              ? "لطفا عبارت جستجوی دیگری را امتحان کنید"
              : "برای شروع، لایه‌ها را اضافه کنید"}
          </p>
        </div>
      )}

      {/* جدول لایه‌ها */}
      {!isLoading && filteredLayers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="w-10 py-3.5 px-4 text-right">ردیف</th>
                  <th className="w-10 py-3.5 px-4 text-right">
                    <input
                      type="checkbox"
                      checked={
                        selectedLayers.length > 0 &&
                        selectedLayers.length === filteredLayers.length
                      }
                      onChange={() => {
                        if (selectedLayers.length === filteredLayers.length) {
                          setSelectedLayers([]);
                        } else {
                          setSelectedLayers(
                            filteredLayers.map((layer) => layer._id)
                          );
                        }
                      }}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    کد تولید
                  </th>
                  <th className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ابعاد
                  </th>
                  <th className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع شیشه
                  </th>
                  <th className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مرحله فعلی
                  </th>
                  <th className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ‌ها
                  </th>
                  <th className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    بارکد
                  </th>
                  <th className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLayers.map((layer, index) => (
                  <tr
                    key={layer._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                      {index + 1}
                    </td>
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedLayers.includes(layer._id)}
                        onChange={() => toggleLayerSelection(layer._id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                      {layer.productionCode || "نامشخص"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {layer.width} × {layer.height}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {typeof layer.glass === "object"
                        ? layer.glass?.name
                        : "نامشخص"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {typeof layer.currentStep === "object"
                        ? layer.currentStep?.name
                        : layer.currentStep
                        ? "مرحله نامشخص"
                        : "شروع نشده"}
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center text-xs text-gray-600">
                          <FiCalendar
                            className="ml-1.5 text-blue-500"
                            size={12}
                          />
                          <span title="تاریخ ایجاد">
                            {layer.createdAt
                              ? new Date(layer.createdAt).toLocaleDateString(
                                  "fa-IR"
                                )
                              : "نامشخص"}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <FiClock className="ml-1.5 text-gray-400" size={12} />
                          <span title="تاریخ بروزرسانی">
                            {layer.updatedAt
                              ? new Date(layer.updatedAt).toLocaleDateString(
                                  "fa-IR"
                                )
                              : "نامشخص"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <div className="flex items-center">
                        <FiBarChart2 className="text-gray-400 ml-2" />
                        <span className="font-mono text-xs text-gray-600">
                          {BarcodeService.generateBarcodeValue(layer._id)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <button
                        onClick={() =>
                          printBarcode(
                            layer._id,
                            layer.productionCode || "لایه"
                          )
                        }
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <FiPrinter className="inline" />
                        <span>چاپ</span>
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
