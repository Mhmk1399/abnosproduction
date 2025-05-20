"use client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ProductLineCreator from "./ProductLineCreator";

export default function ProductionLinePage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Create Production Line</h1>
        <ProductLineCreator 
          onSave={(data) => {
            console.log("Production line saved:", data);
            // Handle successful save
          }}
        />
      </div>
    </DndProvider>
  );
}
