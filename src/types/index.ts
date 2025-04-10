export interface Card {
  id: string;
  content: string;
  createdAt: string;
  dueDate: string | null;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  cards: Card[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}