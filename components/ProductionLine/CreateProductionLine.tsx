"use client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ProductLineCreator from "./ProductLineCreator";
import { FiLayers } from "react-icons/fi";
import toast from "react-hot-toast";

export default function ProductionLinePage() {
  return (
  <DndProvider backend={HTML5Backend}>
  <div className="container mx-auto p-6 mt-20" dir="rtl">
    <div className="bg-white p-6 mb-8">
      <div className="flex items-center space-x-3 space-x-reverse mb-6 pb-4 border-b border-gray-200">
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-2.5 rounded-xl shadow-md ml-2">
          <FiLayers className="text-white text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ساخت خط تولید</h1>
          <p className="text-gray-500 text-sm mt-1">طراحی و پیکربندی خط تولید جدید</p>
        </div>
      </div>
      
      <ProductLineCreator
        onSave={(data) => {
          console.log("Production line saved:", data);
          // Handle successful save
          toast.success("خط تولید با موفقیت ذخیره شد");
        }}
      />
    </div>
  </div>
</DndProvider>

  );
}
