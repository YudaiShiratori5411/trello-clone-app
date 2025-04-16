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
      style={{
        ...style,
        backgroundColor: '#ebecf0',
        borderRadius: '3px',
        width: '24git add .0px',
        minWidth: '240px',
        marginRight: '12px',
        padding: '8px',
        maxHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
        transition: 'box-shadow 0.2s ease'
      }}
    >
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px',
          marginBottom: '8px',
          fontWeight: 'bold',
          cursor: 'grab'
        }}
        {...attributes} 
        {...listeners}
      >
        <h3 style={{ margin: 0, fontSize: '14px' }}>{column.title}</h3>
        <button 
          onClick={() => onDeleteColumn(column.id)}
          style={{ 
            border: 'none', 
            background: 'none', 
            cursor: 'pointer',
            fontSize: '16px',
            color: '#6b778c',
            opacity: 0.8
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
        >
          ×
        </button>
      </div>
      
      <div style={{ overflowY: 'auto', flexGrow: 1 }}>
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
          <div style={{ 
            textAlign: 'center', 
            color: '#6b778c', 
            padding: '10px',
            fontSize: '13px',
            opacity: 0.8
          }}>
            カードがありません
          </div>
        )}
      </div>
      
      {isAdding ? (
        <CardForm onSubmit={handleAddCard} onCancel={toggleAddForm} />
      ) : (
        <button
          onClick={toggleAddForm}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '8px',
            marginTop: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#6b778c',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '13px'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(9, 30, 66, 0.08)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span style={{ marginRight: '4px' }}>+</span> カードを追加
        </button>
      )}
    </div>
  );
}

export default ColumnComponent;