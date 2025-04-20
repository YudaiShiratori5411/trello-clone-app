import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// window.deleteCard の型定義を追加
declare global {
  interface Window {
    deleteCard?: {
      columnId: string;
      cardId: string;
      clicked: boolean;
    };
  }
}

interface CardProps {
  card: {
    id: string;
    content: string;
    dueDate: string | null;
  };
  columnId: string;
  onDeleteCard: (columnId: string, cardId: string) => void;
  onUpdateCard: (columnId: string, cardId: string, content: string, dueDate: string | null) => void;
}

function Card({ card, columnId, onDeleteCard, onUpdateCard }: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(card.content);
  const [editDueDate, setEditDueDate] = useState(card.dueDate || '');
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: card.id,
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSubmit = () => {
    if (editContent.trim()) {
      onUpdateCard(columnId, card.id, editContent, editDueDate || null);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditContent(card.content);
    setEditDueDate(card.dueDate || '');
    setIsEditing(false);
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDueDateColor = () => {
    if (!card.dueDate) return '';
    
    const now = new Date();
    const dueDate = new Date(card.dueDate);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    
    if (diffDays < 0) return '#eb5a46';  // 赤
    if (diffDays < 1) return '#ff9f1a';  // オレンジ
    return '#61bd4f';  // 緑
  };

  return (
    <>
      {isEditing ? (
        <div style={{
          backgroundColor: 'white',
          padding: '8px',
          marginBottom: '8px',
          borderRadius: '3px',
          boxShadow: '0 1px 0 rgba(9, 30, 66, 0.25)'
        }}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              marginBottom: '8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              resize: 'none'
            }}
            rows={3}
            autoFocus
          />
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b778c' }}>
              期限日:
            </label>
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '6px', 
                border: '1px solid #ddd', 
                borderRadius: '3px',
                fontSize: '14px'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              style={{
                backgroundColor: '#5aac44',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onClick={handleSubmit}
            >
              保存
            </button>
            <button
              style={{
                backgroundColor: '#ea2525',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onClick={handleCancel}
            >
              キャンセル
            </button>
          </div>
        </div>
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
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
            borderLeft: card.dueDate ? `3px solid ${getDueDateColor()}` : 'none',
          }}
          onClick={() => setIsEditing(true)}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f7f8f9';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(9, 30, 66, 0.25)';
            e.currentTarget.style.transform = `${CSS.Transform.toString(transform) || ''} translateY(-2px)`;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.boxShadow = '0 1px 0 rgba(9, 30, 66, 0.25)';
            e.currentTarget.style.transform = CSS.Transform.toString(transform) || '';
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
              color: getDueDateColor()
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
          onMouseOver={(e) => {
            e.stopPropagation();
            e.currentTarget.style.opacity = '1';
          }}
          onMouseOut={(e) => {
            e.stopPropagation();
            e.currentTarget.style.opacity = '0.6';
          }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('削除ボタンがクリックされました', columnId, card.id);
                
                // window.deleteCardの初期化
                if (!window.deleteCard) {
                  window.deleteCard = {
                    columnId: '',
                    cardId: '',
                    clicked: false
                  };
                }
                
                window.deleteCard.columnId = columnId;
                window.deleteCard.cardId = card.id;
                window.deleteCard.clicked = true;
                
                console.log('削除情報をwindowオブジェクトに設定しました', window.deleteCard);
              }}
              style={{ 
                border: '1px solid red',
                background: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '2px 4px',
                borderRadius: '3px'
              }}
              onMouseOver={(e) => {
                e.stopPropagation();
                e.currentTarget.style.backgroundColor = 'rgba(9, 30, 66, 0.08)';
              }}
              onMouseOut={(e) => {
                e.stopPropagation();
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              削除する
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Card;