import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Card as CardType } from '../types';
import CardEditForm from './CardEditForm.tsx';

interface CardProps {
  card: CardType;
  columnId: string;
  onDeleteCard: (columnId: string, cardId: string) => void;
  onUpdateCard: (columnId: string, cardId: string, content: string, dueDate: string | null) => void;
}

function Card({ card, columnId, onDeleteCard, onUpdateCard }: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: `${card.id}_${columnId}`
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  // 編集モードの切り替え
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // カード更新処理
  const handleUpdateCard = (content: string, dueDate: string | null) => {
    onUpdateCard(columnId, card.id, content, dueDate);
    setIsEditing(false);
  };

  // 締め切り日の表示形式変換
  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return format(date, 'yyyy年MM月dd日', { locale: ja });
  };

  // 締め切り日の状態に応じた色を設定
  const getDueDateColor = () => {
    if (!card.dueDate) return '';
    
    const now = new Date();
    const dueDate = new Date(card.dueDate);
    
    // 今日が締め切り日
    if (dueDate.toDateString() === now.toDateString()) {
      return 'text-orange-500';
    }
    // 締め切り日過ぎた
    else if (dueDate < now) {
      return 'text-red-500';
    }
    // 締め切り日まだ
    return 'text-green-500';
  };

  return (
    <>
      {isEditing ? (
        <CardEditForm
          card={card}
          onSubmit={handleUpdateCard}
          onCancel={toggleEdit}
        />
      ) : (
        <div
          ref={setNodeRef}
          style={{
            ...style,
            backgroundColor: 'white',
            borderRadius: '3px',
            boxShadow: '0 1px 0 rgba(9, 30, 66, 0.25)',
            padding: '8px',
            marginBottom: '8px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            borderLeft: card.dueDate ? '3px solid #61bd4f' : 'none',
          }}
          onClick={toggleEdit}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f7f8f9';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(9, 30, 66, 0.25)';
            e.currentTarget.style.transform = 'translateY(-3px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.boxShadow = '0 1px 0 rgba(9, 30, 66, 0.25)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          {...attributes}
          {...listeners}
        >
          <div style={{ fontSize: '14px', wordBreak: 'break-word' }}>{card.content}</div>
          
          {card.dueDate && (
            <div style={{ 
              fontSize: '12px', 
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              color: getDueDateColor() === 'text-red-500' ? '#eb5a46' : 
                    getDueDateColor() === 'text-orange-500' ? '#ff9f1a' : '#61bd4f'
            }}>
              <span style={{ marginRight: '4px' }}>📅</span>
              {formatDueDate(card.dueDate)}
            </div>
          )}
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            marginTop: '8px',
            opacity: 0.6,
            transition: 'opacity 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '0.6'}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCard(columnId, card.id);
              }}
              style={{ 
                border: 'none', 
                background: 'none', 
                cursor: 'pointer',
                fontSize: '12px',
                color: '#6b778c',
                padding: '2px 4px',
                borderRadius: '3px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(9, 30, 66, 0.08)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              削除
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Card;