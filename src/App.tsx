import { useState } from 'react';
import './App.css';

// windowオブジェクトの型定義拡張（Card.tsxとの連携用）
declare global {
  interface Window {
    deleteCard?: {
      columnId: string;
      cardId: string;
      clicked: boolean;
    };
  }
}

type Card = {
  id: string;
  content: string;
  dueDate: string | null;
  createdAt: string;
};

type Column = {
  id: string;
  title: string;
  order: number;
  cards: Card[];
};

type Notification = {
  id: string;
  type: 'success' | 'error';
  message: string;
};

function App() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: '1',
      title: 'To Do',
      order: 0,
      cards: [
        { 
          id: '101', 
          content: '中国語検定1級対策',
          createdAt: new Date().toISOString(),
          dueDate: null
        },
        { 
          id: '102', 
          content: '日文中訳',
          createdAt: new Date().toISOString(),
          dueDate: null
        }
      ]
    },
    {
      id: '2',
      title: '進行中',
      order: 1,
      cards: [
        { 
          id: '201', 
          content: 'リスニング問題2問',
          createdAt: new Date().toISOString(),
          dueDate: null
        }
      ]
    },
    {
      id: '3',
      title: '完了',
      order: 2,
      cards: []
    }
  ]);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // 各カラムの新しいカード入力値
  const [newCardContents, setNewCardContents] = useState<Record<string, string>>({
    '1': '',
    '2': '',
    '3': ''
  });
  
  // 新しいカラム名
  const [newColumnTitle, setNewColumnTitle] = useState('');
  
  // 編集中のカード情報
  const [editingCard, setEditingCard] = useState<{
    columnId: string;
    cardId: string;
    content: string;
    dueDate: string | null;
  } | null>(null);
  
  // windowオブジェクトから削除情報を監視する
  useState(() => {
    const checkDeleteRequest = setInterval(() => {
      if (window.deleteCard && window.deleteCard.clicked) {
        const { columnId, cardId } = window.deleteCard;
        console.log('削除リクエストを検出:', columnId, cardId);
        
        handleDeleteCard(columnId, cardId);
        
        // リクエスト情報をリセット
        window.deleteCard.clicked = false;
      }
    }, 500);
    
    return () => clearInterval(checkDeleteRequest);
  });

  // 通知の追加
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    setNotifications([...notifications, { id, ...notification }]);
    
    // 5秒後に通知を削除
    setTimeout(() => {
      setNotifications(prevNotifications => 
        prevNotifications.filter(n => n.id !== id)
      );
    }, 5000);
  };
  
  // カード削除機能
  const handleDeleteCard = (columnId: string, cardId: string) => {
    console.log('削除処理が呼び出されました:', columnId, cardId);
    
    const updatedColumns = columns.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          cards: column.cards.filter(card => card.id !== cardId)
        };
      }
      return column;
    });
    
    setColumns(updatedColumns);
    addNotification({
      type: 'success',
      message: 'カードを削除しました'
    });
  };
  
  // カード追加機能
  const handleAddCard = (columnId: string) => {
    const content = newCardContents[columnId]?.trim();
    if (!content) return;
    
    const newCard: Card = {
      id: Date.now().toString(),
      content,
      createdAt: new Date().toISOString(),
      dueDate: null
    };
    
    const updatedColumns = columns.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          cards: [...column.cards, newCard]
        };
      }
      return column;
    });
    
    setColumns(updatedColumns);
    
    // 入力フィールドをクリア
    setNewCardContents({
      ...newCardContents,
      [columnId]: ''
    });
    
    addNotification({
      type: 'success',
      message: 'カードを追加しました'
    });
  };
  
  // カラム追加機能
  const handleAddColumn = () => {
    const title = newColumnTitle.trim();
    if (!title) return;
    
    const newColumn: Column = {
      id: Date.now().toString(),
      title,
      order: columns.length,
      cards: []
    };
    
    setColumns([...columns, newColumn]);
    
    // カラム追加後、新しいカードの入力状態も更新
    setNewCardContents({
      ...newCardContents,
      [newColumn.id]: ''
    });
    
    // 入力フィールドをクリア
    setNewColumnTitle('');
    
    addNotification({
      type: 'success',
      message: 'リストを追加しました'
    });
  };
  
  // カラム削除機能
  const handleDeleteColumn = (columnId: string) => {
    setColumns(columns.filter(column => column.id !== columnId));
    
    // 関連するカード入力状態も削除
    const updatedNewCardContents = { ...newCardContents };
    delete updatedNewCardContents[columnId];
    setNewCardContents(updatedNewCardContents);
    
    addNotification({
      type: 'success',
      message: 'リストを削除しました'
    });
  };
  
  // カード編集開始
  const handleEditCard = (columnId: string, card: Card) => {
    setEditingCard({
      columnId,
      cardId: card.id,
      content: card.content,
      dueDate: card.dueDate
    });
  };
  
  // カード更新
  const handleUpdateCard = () => {
    if (!editingCard) return;
    
    const { columnId, cardId, content, dueDate } = editingCard;
    
    if (!content.trim()) {
      addNotification({
        type: 'error',
        message: 'カード内容を入力してください'
      });
      return;
    }
    
    const updatedColumns = columns.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          cards: column.cards.map(card => {
            if (card.id === cardId) {
              return {
                ...card,
                content: content.trim(),
                dueDate
              };
            }
            return card;
          })
        };
      }
      return column;
    });
    
    setColumns(updatedColumns);
    setEditingCard(null);
    
    addNotification({
      type: 'success',
      message: 'カードを更新しました'
    });
  };
  
  // 編集キャンセル
  const handleCancelEdit = () => {
    setEditingCard(null);
  };

  // カードの期限日に基づく色を取得
  const getDueDateColor = (dueDate: string | null) => {
    if (!dueDate) return '';
    
    const now = new Date();
    const dueDateObj = new Date(dueDate);
    const diffTime = dueDateObj.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    
    if (diffDays < 0) return 'border-l-4 border-red-500';  // 期限切れ
    if (diffDays < 1) return 'border-l-4 border-yellow-500';  // 24時間以内
    return 'border-l-4 border-green-500';  // 期限あり
  };

  return (
    <div className="min-h-screen bg-blue-600 p-4">
      <h1 className="text-white text-2xl mb-4">Trello風タスク管理アプリ</h1>
      
      {/* カラム一覧 */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <div key={column.id} className="bg-gray-100 rounded p-4 min-w-[280px] max-w-[280px] h-fit">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">{column.title}</h2>
              <button
                onClick={() => handleDeleteColumn(column.id)}
                className="text-red-500 hover:text-red-700 font-bold text-xl"
              >
                ×
              </button>
            </div>
            
            {/* カード一覧 */}
            <div className="mb-3 max-h-[calc(100vh-250px)] overflow-y-auto">
              {column.cards.length === 0 ? (
                <div className="text-gray-500 text-center py-2">
                  カードがありません
                </div>
              ) : (
                column.cards.map(card => (
                  <div 
                    key={card.id} 
                    className={`bg-white rounded p-3 mb-2 shadow cursor-pointer hover:shadow-md hover:translate-y-[-2px] transition-all ${getDueDateColor(card.dueDate)}`}
                    onClick={() => handleEditCard(column.id, card)}
                  >
                    <div className="flex justify-between">
                      <div className="flex-grow">
                        <p className="break-words">{card.content}</p>
                        {card.dueDate && (
                          <div className="text-xs text-gray-600 mt-1 flex items-center">
                            <span className="mr-1">📅</span>
                            {new Date(card.dueDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(column.id, card.id);
                        }}
                        className="ml-2 bg-red-500 text-white rounded text-xs p-1 h-6 hover:bg-red-600"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* カード追加フォーム */}
            <div className="pt-3 border-t border-gray-300">
              <input
                type="text"
                value={newCardContents[column.id] || ''}
                onChange={(e) => 
                  setNewCardContents({
                    ...newCardContents,
                    [column.id]: e.target.value
                  })
                }
                className="w-full p-2 border rounded mb-2"
                placeholder="新しいカードを追加"
              />
              <button
                onClick={() => handleAddCard(column.id)}
                className="bg-blue-500 text-white px-3 py-1 rounded w-full hover:bg-blue-600 transition-colors"
                disabled={!newCardContents[column.id]?.trim()}
              >
                追加
              </button>
            </div>
          </div>
        ))}
        
        {/* 新しいカラムを追加するフォーム */}
        <div className="bg-gray-100 rounded p-4 min-w-[280px] max-w-[280px] h-fit">
          <h2 className="text-lg font-semibold mb-3">新しいリストを追加</h2>
          <input
            type="text"
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            placeholder="リスト名を入力"
          />
          <button
            onClick={handleAddColumn}
            className="bg-green-500 text-white px-3 py-1 rounded w-full hover:bg-green-600 transition-colors"
            disabled={!newColumnTitle.trim()}
          >
            追加
          </button>
        </div>
      </div>
      
      {/* 編集モーダル */}
      {editingCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded p-4 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-3">カードを編集</h2>
            
            <textarea
              value={editingCard.content}
              onChange={(e) => setEditingCard({...editingCard, content: e.target.value})}
              className="w-full p-2 border rounded mb-3"
              rows={3}
              placeholder="カードの内容"
            />
            
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">期限日：</label>
              <input
                type="date"
                value={editingCard.dueDate || ''}
                onChange={(e) => setEditingCard({...editingCard, dueDate: e.target.value || null})}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelEdit}
                className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleUpdateCard}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                disabled={!editingCard.content.trim()}
              >
                更新
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 通知システム */}
      <div className="fixed bottom-4 right-4 space-y-2 z-40">
        {notifications.map(notification => (
          <div 
            key={notification.id}
            className={`p-3 rounded shadow-lg max-w-xs transition-all duration-500 
              ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;