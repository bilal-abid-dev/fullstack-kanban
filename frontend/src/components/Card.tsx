'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card as CardType } from '@/types/database';
import { useCards } from '@/hooks/useBoard';

interface CardProps {
  card: CardType;
  onDelete?: (id: string) => Promise<void>;
  columnId?: string;
}

export function Card({ card, onDelete }: CardProps) {
  const { deleteCard } = useCards();
  const handleDeleteCard = onDelete ?? deleteCard;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this card?')) {
      await handleDeleteCard(card.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-[12px] border border-black bg-[#DECCCC] p-3 shadow-sm transition-shadow hover:shadow-md"
      data-card-id={card.title.toLowerCase().replace(/\s+/g, '-')}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <h4 className="mb-1 font-medium text-black">{card.title}</h4>
        {card.details && (
          <p className="line-clamp-2 text-sm text-black/70">{card.details}</p>
        )}
      </div>
      <button
        onClick={handleDelete}
        className="mt-2 flex w-full items-center justify-center gap-1 rounded-[12px] py-1 text-xs text-black/70 transition-colors hover:bg-black hover:text-white"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete
      </button>
    </div>
  );
}
