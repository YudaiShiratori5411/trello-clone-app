import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column } from '../types';
import Card from './Card.tsx';
import CardForm from './CardForm.tsx';

interface ColumnProps {
  column: Column;
  onDeleteColumn: (columnId: string) => void;
  onAddCard: (columnId: string, content: string) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
  onUpdateCard: (columnId: string, cardId: string, content: string, dueDate: string | null) => void;
}

function ColumnComponent({ column, onDeleteColumn, onAddCard, onDeleteCard, onUpdateCard }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: column.id
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  // カード追加フォームの表示/非表示を切り替え
  const toggleAddForm = () => {
    setIsAdding(!isAdding);
  };

  // カード追加処理
  const handleAddCard = (content: string) => {
    onAddCard(column.id, content);
    setIsAdding(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-100 rounded-md p-3 w-72 flex-shrink-0 shadow-md flex flex-col max-h-[calc(100vh-180px)]"
    >
      <div 
        className="flex justify-between items-center mb-3 p-2 cursor-grab bg-gray-200 rounded" 
        {...attributes} 
        {...listeners}
      >
        <h3 className="font-semibold text-gray-700">{column.title}</h3>
        <button 
          onClick={() => onDeleteColumn(column.id)}
          className="text-gray-500 hover:text-red-500"
        >
          ×
        </button>
      </div>
      
      <div className="overflow-y-auto flex-grow">
        {column.cards && column.cards.length > 0 ? (
          column.cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              columnId={column.id}
              onDeleteCard={onDeleteCard}
              onUpdateCard={onUpdateCard}
            />
          ))
        ) : (
          <div className="text-gray-400 text-center p-2">
            カードがありません
          </div>
        )}
      </div>
      
      {isAdding ? (
        <CardForm onSubmit={handleAddCard} onCancel={toggleAddForm} />
      ) : (
        <button
          onClick={toggleAddForm}
          className="w-full text-left text-gray-600 py-2 px-2 hover:bg-gray-200 rounded mt-2"
        >
          + カードを追加
        </button>
      )}
    </div>
  );
}

export default ColumnComponent;