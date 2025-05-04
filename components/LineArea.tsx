import { useDrop } from 'react-dnd';
import { LineItem } from './types/production';
import MicroLineItem from './MicroLineItem';
import InventoryItem from './InventoryItem';
import StepItem from './StepItem';

interface LineAreaProps {
  items: LineItem[];
  onDrop: (itemId: string, itemType: "microLine" | "inventory" | "step") => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (itemId: string) => void;
}

export default function LineArea({ items, onDrop, onReorder, onRemove }: LineAreaProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['microLine', 'inventory', 'step'],
    drop: (item: { id: string; type: "microLine" | "inventory" | "step" }) => {
      onDrop(item.id, item.type);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    onReorder(dragIndex, hoverIndex);
  };

  return (
    <div
      ref={drop}
      className={`min-h-[300px] border-2 border-dashed rounded-lg p-4 ${
        isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
      }`}
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <p>Drag and drop items here to build your production line</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id} className="relative">
              {item.type === 'microLine' ? (
                <MicroLineItem
                  microLine={{
                    id: item.id,
                    name: item.name,
                    description: item.description || '',
                    steps: item.steps || [],
                  }}
                  isInLine={true}
                  onRemove={() => onRemove(item.id)}
                />
              ) : item.type === 'inventory' ? (
                <InventoryItem
                  inventory={{
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    description: item.description || '',
                  }}
                  isInLine={true}
                  onRemove={() => onRemove(item.id)}
                />
              ) : (
                <StepItem
                  step={{
                    id: item.id,
                    name: item.name,
                    description: item.description || '',
                  }}
                  isInLine={true}
                  onRemove={() => onRemove(item.id)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
