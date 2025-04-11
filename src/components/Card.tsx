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
          style={style}
          className="bg-white rounded shadow p-3 mb-2 cursor-move hover:shadow-md border-l-4 border-blue-400 transition-all"
          onClick={toggleEdit}
          {...attributes}
          {...listeners}
        >
          <div className="text-gray-700">{card.content}</div>
          
          {card.dueDate && (
            <div className={`text-xs mt-2 flex items-center ${getDueDateColor()}`}>
              <span className="mr-1">📅</span>
              {formatDueDate(card.dueDate)}
            </div>
          )}
          
          <div className="flex justify-end mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCard(columnId, card.id);
              }}
              className="text-xs text-gray-500 hover:text-red-500"
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