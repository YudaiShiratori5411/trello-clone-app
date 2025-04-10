import { useState } from 'react';

interface CardFormProps {
  onSubmit: (content: string) => void;
  onCancel: () => void;
}

function CardForm({ onSubmit, onCancel }: CardFormProps) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  return (
    <div className="bg-white p-2 rounded shadow mb-2">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="カードの内容を入力"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
          autoFocus
        />
        <div className="flex space-x-2 mt-2">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded"
          >
            追加
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

export default CardForm;