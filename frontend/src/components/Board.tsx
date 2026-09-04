'use client';

import { useState } from 'react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Column } from './Column';
import { AddCardModal } from './AddCardModal';
import { useBoard, useColumns, useCards } from '@/hooks/useBoard';
import type { ColumnWithCards } from '@/types/database';

export function Board() {
  const { board, loading, error, refetch, setBoard } = useBoard();
  const { reorderColumns, renameColumn } = useColumns();
  const { createCard, deleteCard, moveCard, reorderCards } = useCards();
  const handleDeleteCard = async (cardId: string) => {
    const previous = board;
    setBoard(current => current ? { ...current, columns: current.columns.map(column => ({ ...column, cards: column.cards.filter(card => card.id !== cardId) })) } : current);
    try { await deleteCard(cardId); } catch (err) { setBoard(previous); throw err; }
  };
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [modalColumnId, setModalColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (!board) return;

    const isActiveColumn = board.columns.some(c => c.id === activeId);
    const isOverColumn = board.columns.some(c => c.id === overId);

    if (isActiveColumn && isOverColumn) {
      const columns = board.columns.map(c => c.id);
      const activeIndex = columns.indexOf(activeId);
      const overIndex = columns.indexOf(overId);
      
      const newColumns = Array.from(columns);
      const [removed] = newColumns.splice(activeIndex, 1);
      newColumns.splice(overIndex, 0, removed);
      
      await reorderColumns(newColumns);
      setBoard(current => current ? { ...current, columns: newColumns.map(id => current.columns.find(column => column.id === id)!).map((column, index) => ({ ...column, position: index })) } : current);
      refetch();
      return;
    }

    if (!isActiveColumn && !isOverColumn) {
      const activeColumn = board.columns.find(c => c.cards.some(card => card.id === activeId));
      const overColumn = board.columns.find(c => c.cards.some(card => card.id === overId));
      
      if (activeColumn && overColumn && activeColumn.id === overColumn.id) {
        const cardIds = activeColumn.cards.map(c => c.id);
        const activeIndex = cardIds.indexOf(activeId);
        const overIndex = cardIds.indexOf(overId);
        
        const newCardIds = Array.from(cardIds);
        const [removed] = newCardIds.splice(activeIndex, 1);
        newCardIds.splice(overIndex, 0, removed);
        
        await reorderCards(newCardIds, activeColumn.id);
        setBoard(current => current ? { ...current, columns: current.columns.map(column => column.id === activeColumn.id ? { ...column, cards: newCardIds.map(id => column.cards.find(card => card.id === id)!).map((card, index) => ({ ...card, position: index })) } : column) } : current);
        refetch();
        return;
      }
    }

    if (!isActiveColumn && isOverColumn) {
      const activeColumn = board.columns.find(c => c.cards.some(card => card.id === activeId));
      if (activeColumn) {
        const targetColumnId = overId;
        const targetColumn = board.columns.find(c => c.id === targetColumnId);
        const newPosition = targetColumn?.cards.length || 0;
        
        await moveCard(activeId, targetColumnId, newPosition);
        setBoard(current => {
          if (!current) return current;
          const moving = activeColumn.cards.find(card => card.id === activeId);
          if (!moving) return current;
          return { ...current, columns: current.columns.map(column => column.id === activeColumn.id ? { ...column, cards: column.cards.filter(card => card.id !== activeId) } : column.id === targetColumnId ? { ...column, cards: [...column.cards, { ...moving, column_id: targetColumnId, position: newPosition }] } : column) };
        });
        refetch();
        return;
      }
    }
  };

  const handleAddCard = async (columnId: string, title: string, details: string) => {
    const card = await createCard(columnId, title, details);
    setBoard(current => current ? { ...current, columns: current.columns.map(column => column.id === columnId ? { ...column, cards: [...column.cards, card] } : column) } : current);
    setModalColumnId(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray">
        Loading board...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex h-screen items-center justify-center text-gray">
        No board found
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={board.columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
        <div data-testid="kanban-board" className="grid h-full auto-rows-max grid-cols-1 content-start items-start gap-4 overflow-y-auto bg-[#DECCCC] p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
          {board.columns.map((column: ColumnWithCards) => (
            <Column
              key={column.id}
              column={column}
              onRename={setActiveColumnId}
              onAddCard={() => setModalColumnId(column.id)}
              isEditing={activeColumnId === column.id}
              onSaveRename={async (newName: string) => {
                await renameColumn(column.id, newName);
                setBoard(current => current ? { ...current, columns: current.columns.map(item => item.id === column.id ? { ...item, name: newName } : item) } : current);
                setActiveColumnId(null);
                refetch();
              }}
              onDeleteCard={handleDeleteCard}
            />
          ))}
        </div>
      </SortableContext>

      {modalColumnId && (
        <AddCardModal
          columnId={modalColumnId}
          onSubmit={handleAddCard}
          onClose={() => setModalColumnId(null)}
        />
      )}
    </DndContext>
  );
}
