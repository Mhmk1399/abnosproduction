import { ProductionLineConfig } from '../types/production';

export default function ProductionLineView({ line }: { line: ProductionLineConfig }) {
  return (
    <div className="mb-8 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">{line.name}</h2>
      <div className="space-y-2">
        {line.steps.map((step, index) => (
          <div
            key={step.id}
            className="p-3 bg-gray-50 rounded border border-gray-200"
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-500 mr-2">#{index + 1}</span>
                <span className="font-medium">{step.name}</span>
              </div>
              {step.description && (
                <span className="text-sm text-gray-500">{step.description}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}