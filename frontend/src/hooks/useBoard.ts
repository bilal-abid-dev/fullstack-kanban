'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import type { BoardWithColumns, ColumnWithCards } from '@/types/database';

const BOARD_ID = '00000000-0000-0000-0000-000000000001';

export function useBoard() {
  const [board, setBoard] = useState<BoardWithColumns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    const supabase = createClient();
    
    try {
      const { data: boardData, error: boardError } = await supabase
        .from('boards')
        .select('*')
        .eq('id', BOARD_ID)
        .single();

      if (boardError) throw boardError;

      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .eq('board_id', BOARD_ID)
        .order('position', { ascending: true });

      if (columnsError) throw columnsError;

      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .in('column_id', columnsData.map(c => c.id))
        .order('position', { ascending: true });

      if (cardsError) throw cardsError;

      const columnsWithCards: ColumnWithCards[] = columnsData.map(col => ({
        ...col,
        cards: cardsData.filter(card => card.column_id === col.id)
      }));

      setBoard({ ...boardData, columns: columnsWithCards });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch board');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const loadBoard = async () => {
      setLoading(true);
      await fetchBoard();
      if (mounted) {
        // State updates happen in fetchBoard
      }
    };
    
    loadBoard();
    
    return () => {
      mounted = false;
    };
  }, [fetchBoard]);

  return { board, loading, error, refetch: fetchBoard, setBoard };
}

export function useColumns() {
  const supabase = createClient();

  const renameColumn = useCallback(async (columnId: string, newName: string) => {
    const { error } = await supabase
      .from('columns')
      .update({ name: newName })
      .eq('id', columnId);
    
    if (error) throw error;
  }, [supabase]);

  const reorderColumns = useCallback(async (columnIds: string[]) => {
    const updates = columnIds.map((id, index) => 
      supabase.from('columns').update({ position: index }).eq('id', id)
    );
    
    const results = await Promise.all(updates);
    const error = results.find(r => r.error)?.error;
    if (error) throw error;
  }, [supabase]);

  return { renameColumn, reorderColumns };
}

export function useCards() {
  const supabase = createClient();

  const createCard = useCallback(async (columnId: string, title: string, details: string) => {
    const { data: maxPos } = await supabase
      .from('cards')
      .select('position')
      .eq('column_id', columnId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = maxPos && maxPos.length > 0 ? maxPos[0].position + 1 : 0;

    const { data, error } = await supabase
      .from('cards')
      .insert({ column_id: columnId, title, details, position: nextPosition })
      .select()
      .single();

    if (error) throw error;
    return data;
  }, [supabase]);

  const deleteCard = useCallback(async (cardId: string) => {
    const { error } = await supabase.from('cards').delete().eq('id', cardId);
    if (error) throw error;
  }, [supabase]);

  const moveCard = useCallback(async (cardId: string, newColumnId: string, newPosition: number) => {
    const { error } = await supabase
      .from('cards')
      .update({ column_id: newColumnId, position: newPosition })
      .eq('id', cardId);
    
    if (error) throw error;
  }, [supabase]);

  const reorderCards = useCallback(async (cardIds: string[], columnId: string) => {
    const updates = cardIds.map((id, index) => 
      supabase.from('cards').update({ position: index, column_id: columnId }).eq('id', id)
    );
    
    const results = await Promise.all(updates);
    const error = results.find(r => r.error)?.error;
    if (error) throw error;
  }, [supabase]);

  return { createCard, deleteCard, moveCard, reorderCards };
}
