"use client";

import { useState, useEffect, useCallback } from "react";
import { useTableData } from "@/hooks/useTable";
import DatePicker from "react-multi-date-picker";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function LayerStatistics() {
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});
  const [steps, setSteps] = useState<{ label: string; value: string }[]>([]);
  const [inventories, setInventories] = useState<{ label: string; value: string }[]>([]);

  // Get filtered data for statistics
  const { data: layersData } = useTableData(
    "/api/productLayer",
    undefined,
    currentFilters,
    1,
    undefined
  );

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const stepsResponse = await fetch('/api/steps');
        const stepsData = await stepsResponse.json();
        if (stepsResponse.ok && stepsData.steps) {
          setSteps(stepsData.steps.map((step: any) => ({
            label: step.name,
            value: step._id,
          })));
        }

        const inventoriesResponse = await fetch('/api/productionInventory');
        const inventoriesData = await inventoriesResponse.json();
        if (inventoriesResponse.ok && inventoriesData.inventories) {
          setInventories(inventoriesData.inventories.map((inventory: any) => ({
            label: inventory.name,
            value: inventory._id,
          })));
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };
    fetchFilterOptions();
  }, []);

  const updateFilter = useCallback((key: string, value: any) => {
    setCurrentFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  }, []);

  const clearFilters = () => {
    setCurrentFilters({});
  };

  // Calculate statistics from filtered data
  const calculateStats = () => {
    if (!layersData || layersData.length === 0) {
      return {
        totalLayers: 0,
        totalArea: 0,
        avgWidth: 0,
        avgHeight: 0,
        stepCounts: {},
        inventoryCounts: {},
      };
    }

    const totalLayers = layersData.length;
    const totalArea = layersData.reduce((sum: number, layer: any) => {
      return sum + (layer.width * layer.height) / 1000000; // Convert to m²
    }, 0);
    const avgWidth = layersData.reduce((sum: number, layer: any) => sum + layer.width, 0) / totalLayers;
    const avgHeight = layersData.reduce((sum: number, layer: any) => sum + layer.height, 0) / totalLayers;

    const stepCounts: Record<string, number> = {};
    const inventoryCounts: Record<string, number> = {};

    layersData.forEach((layer: any) => {
      const stepName = layer.currentStep?.name || 'نامشخص';
      const inventoryName = layer.currentInventory?.name || 'نامشخص';
      stepCounts[stepName] = (stepCounts[stepName] || 0) + 1;
      inventoryCounts[inventoryName] = (inventoryCounts[inventoryName] || 0) + 1;
    });

    return {
      totalLayers,
      totalArea: Math.round(totalArea * 100) / 100,
      avgWidth: Math.round(avgWidth),
      avgHeight: Math.round(avgHeight),
      stepCounts,
      inventoryCounts,
    };
  };

  const stats = calculateStats();

  return (
    <div className="container mx-auto py-8" dir="rtl">
      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">فیلترهای جستجو</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">کد تولید</label>
            <input
              type="text"
              value={currentFilters.productionCode || ''}
              onChange={(e) => updateFilter('productionCode', e.target.value)}
              placeholder="جستجو کد تولید..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">مرحله فعلی</label>
            <select
              value={currentFilters.currentStep || ''}
              onChange={(e) => updateFilter('currentStep', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">همه مراحل</option>
              {steps.map(step => (
                <option key={step.value} value={step.value}>{step.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">انبار فعلی</label>
            <select
              value={currentFilters.currentInventory || ''}
              onChange={(e) => updateFilter('currentInventory', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">همه انبارها</option>
              {inventories.map(inventory => (
                <option key={inventory.value} value={inventory.value}>{inventory.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عملیات</label>
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              پاک کردن فیلترها
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">تعداد لایه‌ها</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalLayers}</p>
            </div>
            <div className="text-blue-500 text-3xl">📋</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">مجموع مساحت</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalArea} m²</p>
            </div>
            <div className="text-green-500 text-3xl">📏</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">میانگین عرض</p>
              <p className="text-2xl font-bold text-purple-600">{stats.avgWidth} mm</p>
            </div>
            <div className="text-purple-500 text-3xl">↔️</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">میانگین ارتفاع</p>
              <p className="text-2xl font-bold text-orange-600">{stats.avgHeight} mm</p>
            </div>
            <div className="text-orange-500 text-3xl">↕️</div>
          </div>
        </div>
      </div>

      {/* Step and Inventory Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">توزیع بر اساس مرحله</h3>
          <div className="space-y-2">
            {Object.entries(stats.stepCounts).map(([step, count]) => (
              <div key={step} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{step}</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">توزیع بر اساس انبار</h3>
          <div className="space-y-2">
            {Object.entries(stats.inventoryCounts).map(([inventory, count]) => (
              <div key={inventory} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{inventory}</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}