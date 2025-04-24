'use client'
import { useDrag, useDrop } from 'react-dnd';
import StepItem from './StepItem';
import { ProductionStep } from '../types/production';

export default function DraggableStep({
  step,
  index,
  onReorder,
  onRemove,
}: {
  step: ProductionStep;
  index: number;
  onReorder: (from: number, to: number) => void;
  onRemove: () => void;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: 'step',
    item: { index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'step',
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        onReorder(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  // Create a ref callback that applies both drag and drop refs
  const dragDropRef = (node: HTMLDivElement | null) => {
    drag(node);
    drop(node);
  };

  return (
    <div
      ref={dragDropRef}
      className={`mb-2 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <StepItem step={step} isInLine={true} onRemove={onRemove} />
    </div>
  );
}
