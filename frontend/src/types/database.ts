export interface Board {
  id: string;
  name: string;
  created_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  name: string;
  position: number;
  created_at: string;
}

export interface Card {
  id: string;
  column_id: string;
  title: string;
  details: string | null;
  position: number;
  created_at: string;
}

export interface BoardWithColumns extends Board {
  columns: (Column & { cards: Card[] })[];
}

export type ColumnWithCards = Column & { cards: Card[] };

export type DragItemType = 'column' | 'card';

export interface DragItem {
  type: DragItemType;
  id: string;
  columnId?: string;
  index: number;
}