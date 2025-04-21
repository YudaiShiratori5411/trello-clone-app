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
    <div style={{ minHeight: '100vh', backgroundColor: '#0079bf', padding: '16px' }}>
      <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Trello風タスク管理アプリ</h1>
      
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '20px' }}>
        {columns.map(column => (
          <div key={column.id} style={{ 
            backgroundColor: '#ebecf0', 
            borderRadius: '8px', 
            padding: '12px', 
            minWidth: '280px', 
            maxWidth: '280px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>{column.title}</h2>
              <button
                onClick={() => handleDeleteColumn(column.id)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '18px', 
                  cursor: 'pointer', 
                  color: '#6b778c'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '12px', maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}>
              {column.cards.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b778c', padding: '12px' }}>
                  カードがありません
                </div>
              ) : (
                column.cards.map(card => (
                  <div 
                    key={card.id} 
                    style={{ 
                      backgroundColor: 'white', 
                      borderRadius: '4px', 
                      padding: '10px', 
                      marginBottom: '8px', 
                      boxShadow: '0 1px 0 rgba(9,30,66,0.25)',
                      cursor: 'pointer',
                      borderLeft: card.dueDate ? '4px solid #61bd4f' : 'none'
                    }}
                    onClick={() => handleEditCard(column.id, card)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>{card.content}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(column.id, card.id);
                        }}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          color: '#6b778c',
                          marginLeft: '8px'
                        }}
                      >
                        削除
                      </button>
                    </div>
                    {card.dueDate && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6b778c', 
                        marginTop: '8px', 
                        display: 'flex', 
                        alignItems: 'center' 
                      }}>
                        <span style={{ marginRight: '4px' }}>📅</span>
                        {new Date(card.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            <div style={{ paddingTop: '12px', borderTop: '1px solid #ddd' }}>
              <input
                type="text"
                value={newCardContents[column.id] || ''}
                onChange={(e) => 
                  setNewCardContents({
                    ...newCardContents,
                    [column.id]: e.target.value
                  })
                }
                style={{ 
                  width: '95%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  marginBottom: '8px' 
                }}
                placeholder="新しいカードを追加"
              />
              <button
                onClick={() => handleAddCard(column.id)}
                style={{ 
                  backgroundColor: '#0079bf', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  padding: '8px 12px', 
                  width: '100%', 
                  cursor: 'pointer' 
                }}
                disabled={!newCardContents[column.id]?.trim()}
              >
                追加
              </button>
            </div>
          </div>
        ))}
        
        <div style={{ 
          backgroundColor: '#ebecf0', 
          borderRadius: '8px', 
          padding: '12px', 
          minWidth: '280px', 
          maxWidth: '280px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>新しいリストを追加</h2>
          <input
            type="text"
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            style={{ 
              width: '95%', 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              marginBottom: '8px' 
            }}
            placeholder="リスト名を入力"
          />
          <button
            onClick={handleAddColumn}
            style={{ 
              backgroundColor: '#5aac44', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              padding: '8px 12px', 
              width: '100%', 
              cursor: 'pointer' 
            }}
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