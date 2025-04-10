import { useState } from 'react';

interface AddColumnFormProps {
  onAddColumn: (title: string) => void;
}

function AddColumnForm({ onAddColumn }: AddColumnFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddColumn(title);
      setTitle('');
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded w-72 h-12 flex items-center justify-center"
      >
        + 新しいリストを追加
      </button>
    );
  }

  return (
    <div className="bg-gray-200 p-3 rounded w-72">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="リスト名を入力"
          className="w-full p-2 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded"
          >
            追加
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-1 px-3 rounded"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddColumnForm;