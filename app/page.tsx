"use client";
import { useProductionLines } from "../hooks/useProductionLines";
import ProductionLineView from "../components/ProductionLineView";
import Link from "next/link";

export default function ProductionLinesPage() {
  const { lines, isLoading, error } = useProductionLines();

  const handleStepClick = (
    stepId: string,
    stepName: string,
    stepDescription: string
  ) => {
    console.log(`Clicked on step ${stepName} (${stepId}): ${stepDescription}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Production Lines</h1>
        <Link
          href="/configure"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create New Line
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {lines.length > 0 ? (
            <div className="space-y-6">
              {lines.map((line: any) => (
                <ProductionLineView
                  key={line._id}
                  lineId={line._id}
                  onStepClick={handleStepClick}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                No Production Lines Found
              </h2>
              <p className="text-gray-500 mb-6">
                Get started by creating your first production line.
              </p>
              <Link
                href="/configure"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Production Line
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
