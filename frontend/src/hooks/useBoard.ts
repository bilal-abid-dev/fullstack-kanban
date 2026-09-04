'use client';

import { useCallback, useState } from 'react';
import type { BoardWithColumns, Card, ColumnWithCards } from '@/types/database';

const BOARD_ID = 'board-1';

function createInitialBoard(): BoardWithColumns {
  const createdAt = new Date().toISOString();
  const columns = [
    { id: 'backlog', name: 'Backlog' },
    { id: 'todo', name: 'To Do' },
    { id: 'in-progress', name: 'In Progress' },
    { id: 'review', name: 'Review' },
    { id: 'done', name: 'Done' },
  ];

  const cards = [
    { column_id: 'backlog', title: 'Research Supabase', details: 'Review the data model and access rules.' },
    { column_id: 'backlog', title: 'Define MVP scope', details: 'Keep the first release focused and simple.' },
    { column_id: 'todo', title: 'Set up Next.js', details: 'Create the app shell and shared layout.' },
    { column_id: 'todo', title: 'Build board layout', details: 'Add responsive columns and card styling.' },
    { column_id: 'in-progress', title: 'Add drag and drop', details: 'Make cards and columns easy to rearrange.' },
    { column_id: 'review', title: 'Test responsive views', details: 'Check the board on mobile, tablet, and desktop.' },
    { column_id: 'done', title: 'Choose visual direction', details: 'Set the typography, spacing, and color system.' },
  ];

  return {
    id: BOARD_ID,
    name: 'Kanban Board',
    created_at: createdAt,
    columns: columns.map((column, position): ColumnWithCards => ({
      ...column,
      board_id: BOARD_ID,
      position,
      created_at: createdAt,
      cards: cards
        .filter((card) => card.column_id === column.id)
        .map((card, cardPosition): Card => ({
          ...card,
          id: `${card.column_id}-${cardPosition}`,
          position: cardPosition,
          created_at: createdAt,
        })),
    })),
  };
}

export function useBoard() {
  const [board, setBoard] = useState<BoardWithColumns>(() => createInitialBoard());

  const refetch = useCallback(async () => {}, []);

  return { board, loading: false, error: null, refetch, setBoard };
}

export function useColumns() {
  const renameColumn = useCallback(async (_columnId: string, _newName: string) => {}, []);
  const reorderColumns = useCallback(async (_columnIds: string[]) => {}, []);

  return { renameColumn, reorderColumns };
}

export function useCards() {
  const createCard = useCallback(async (columnId: string, title: string, details: string): Promise<Card> => ({
    id: `card-${Date.now()}`,
    column_id: columnId,
    title,
    details: details || null,
    position: 0,
    created_at: new Date().toISOString(),
  }), []);

  const deleteCard = useCallback(async (_cardId: string) => {}, []);
  const moveCard = useCallback(async (_cardId: string, _newColumnId: string, _newPosition: number) => {}, []);
  const reorderCards = useCallback(async (_cardIds: string[], _columnId: string) => {}, []);

  return { createCard, deleteCard, moveCard, reorderCards };
}
