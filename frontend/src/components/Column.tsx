'use client';

import { useState, useRef, useEffect } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Card } from './Card';
import type { ColumnWithCards } from '@/types/database';

interface ColumnProps {
  column: ColumnWithCards;
  onRename: (id: string) => void;
  onAddCard: () => void;
  isEditing: boolean;
  onSaveRename: (newName: string) => void;
  onDeleteCard: (id: string) => Promise<void>;
}

export function Column({ column, onRename, onAddCard, isEditing, onSaveRename, onDeleteCard }: ColumnProps) {
  const [editName, setEditName] = useState(column.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const droppableRef = useRef<HTMLDivElement>(null);

  const { setNodeRef: setDroppableNodeRef } = useDroppable({ id: column.id });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleRename = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editName.trim()) {
      await onSaveRename(editName.trim());
    } else if (e.key === 'Escape') {
      setEditName(column.name);
      onSaveRename(column.name);
    }
  };

  const handleBlur = () => {
    if (isEditing && editName.trim()) {
      onSaveRename(editName.trim());
    } else {
      setEditName(column.name);
      onSaveRename(column.name);
    }
  };

  const setCombinedRef = (node: HTMLDivElement | null) => {
    setDroppableNodeRef(node);
    droppableRef.current = node;
  };

  return (
    <SortableContext items={column.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
      <div data-testid="kanban-column" className="flex h-fit min-w-0 w-full self-start flex-col overflow-hidden rounded-[12px] border border-black bg-white shadow-md">
        <div className="flex items-center justify-between border-b-2 border-[#1098F7] bg-black p-3">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleRename}
              onBlur={handleBlur}
              className="flex-1 rounded-[12px] bg-[#DECCCC] px-2 py-1 text-sm font-medium text-black outline-none ring-[#1098F7] focus:ring-2"
              autoFocus
            />
          ) : (
            <h3
              onClick={() => onRename(column.id)}
              className="cursor-pointer rounded-[12px] px-2 py-1 font-medium text-white transition-colors hover:text-[#1098F7]"
            >
              {column.name}
            </h3>
          )}
          <span className="rounded-[12px] bg-[#1098F7] px-2 py-0.5 text-sm font-medium text-black">
            {column.cards.length}
          </span>
        </div>

        <div
          ref={setCombinedRef}
          className="min-w-0 space-y-2 p-2"
        >
          {column.cards.map((card) => (
            <Card key={card.id} card={card} onDelete={onDeleteCard} />
          ))}
          <button
            onClick={onAddCard}
            className="flex w-full items-center justify-center gap-1 rounded-[12px] bg-[#1098F7] py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add card
          </button>
        </div>
      </div>
    </SortableContext>
  );
}
