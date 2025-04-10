import { useState } from 'react';
import { Card } from '../types';

interface CardEditFormProps {
  card: Card;
  onSubmit: (content: string, dueDate: string | null) => void;
  onCancel: () => void;
}

function CardEditForm({ card, onSubmit, onCancel }: CardEditFormProps) {
  const [content, setContent] = useState(card.content);
  const [dueDate, setDueDate] = useState(card.dueDate || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content, dueDate || null);
    }
  };

  return (
    <div className="bg-white p-2 rounded shadow mb-2">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] mb-2"
          autoFocus
        />
        
        <div className="mb-2">
          <label className="block text-sm text-gray-700 mb-1">期限日:</label>
          <input
            type="date"
            value={dueDate ? dueDate.split('T')[0] : ''}
            onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded"
          >
            保存
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-1 px-3 rounded"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}

export default CardEditForm;