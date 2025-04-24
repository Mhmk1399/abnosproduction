'use client'
import { useEffect, useState } from "react";
import ProductionLineView from "../components/ProductionLineView";
import { ProductionLineConfig } from "../types/production";

export default function ProductionLinesPage() {
  const [lines, setLines] = useState<ProductionLineConfig[]>([]);

  useEffect(() => {
    const fetchLines = async () => {
      try {
        const response = await fetch("/api/production-lines");
        const data = await response.json();
        setLines(data);
      } catch (error) {
        console.error("Error fetching production lines:", error);
      }
    };

    fetchLines();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Production Lines</h1>
      <div className="space-y-6">
        {lines.map((line) => (
          <ProductionLineView key={line.id} line={line} />
        ))}
        {lines.length === 0 && (
          <div className="text-center text-gray-500">
            No production lines configured yet
          </div>
        )}
      </div>
    </div>
  );
}
