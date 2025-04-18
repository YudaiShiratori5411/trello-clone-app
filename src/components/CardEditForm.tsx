import { useState } from 'react';

interface CardEditFormProps {
  card: {
    id: string;
    content: string;
    dueDate: string | null;
  };
  onSubmit: (content: string, dueDate: string | null) => void;
  onCancel: () => void;
}

function CardEditForm({ card, onSubmit, onCancel }: CardEditFormProps) {
  const [content, setContent] = useState(card.content);
  const [dueDate, setDueDate] = useState(card.dueDate || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(content, dueDate || null);
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 bg-white rounded shadow">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 mb-2 border rounded resize-none"
        placeholder="カード内容を入力"
        rows={3}
        autoFocus
      />
      <div className="mb-2">
        <label className="block text-sm text-gray-600 mb-1">期限：</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full p-1 border rounded"
        />
      </div>
      <div className="flex justify-between">
        <button
          type="submit"
          style={{
            backgroundColor: '#5aac44',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          保存
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            backgroundColor: '#ea2525',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}

export default CardEditForm;