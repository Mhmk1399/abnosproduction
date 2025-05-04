import { useDrag } from 'react-dnd';
import { FaGripLines, FaTrash } from 'react-icons/fa';

interface MicroLineItemProps {
  microLine: {
    id: string;
    name: string;
    description: string;
    steps: {
      step: {
        _id: string;
        name: string;
        description: string;
      };
      order: number;
    }[];
  };
  isInLine: boolean;
  onRemove?: () => void;
}

export default function MicroLineItem({ microLine, isInLine, onRemove }: MicroLineItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'microLine',
    item: { id: microLine.id, type: 'microLine' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: !isInLine,
  }));

  return (
    <div
      ref={drag}
      className={`p-3 rounded-lg border ${
        isInLine ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-blue-300'
      } ${isDragging ? 'opacity-50' : 'opacity-100'} ${
        !isInLine ? 'cursor-move' : 'cursor-default'
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {isInLine && <FaGripLines className="mr-2 text-gray-400" />}
          <div>
            <h3 className="font-medium text-gray-800">{microLine.name}</h3>
            {microLine.description && (
              <p className="text-sm text-gray-500">{microLine.description}</p>
            )}
            <div className="mt-1">
              <span className="text-xs text-gray-500">
                Contains {microLine.steps.length} steps
              </span>
            </div>
          </div>
        </div>
        {isInLine && onRemove && (
          <button
            onClick={onRemove}
            className="p-1 text-red-500 hover:text-red-700"
            aria-label="Remove item"
          >
            <FaTrash />
          </button>
        )}
      </div>
    </div>
  );
}