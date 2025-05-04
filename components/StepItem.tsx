import { useDrag } from 'react-dnd';

interface StepItemProps {
  step: {
    id: string;
    name: string;
    description: string;
  };
  isInLine: boolean;
  onRemove?: () => void;
}

export default function StepItem({ step, isInLine, onRemove }: StepItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'step',
    item: { id: step.id, type: 'step' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`p-3 bg-white rounded-lg shadow-sm border border-gray-200 ${
        isDragging ? 'opacity-50' : ''
      } ${isInLine ? 'cursor-move' : 'cursor-grab'}`}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-800">{step.name}</h3>
          {step.description && (
            <p className="text-sm text-gray-500">{step.description}</p>
          )}
        </div>
        {isInLine && onRemove && (
          <button
            onClick={onRemove}
            className="ml-2 text-red-500 hover:text-red-700"
            aria-label="Remove step"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
