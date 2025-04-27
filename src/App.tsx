import { useState, useEffect } from 'react';
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

// カラムの色定義
const getColumnColor = (title: string) => {
  const colors = {
    'To Do': {
      bg: '#e3f2fd',
      header: '#2196f3',
      text: '#0d47a1'
    },
    '進行中': {
      bg: '#fff8e1',
      header: '#ffc107',
      text: '#ff6f00'
    },
    '完了': {
      bg: '#e8f5e9',
      header: '#4caf50',
      text: '#1b5e20'
    },
    'default': {
      bg: '#ebecf0',
      header: '#5e6c84',
      text: '#172b4d'
    }
  };
  
  return colors[title as keyof typeof colors] || colors.default;
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
  useEffect(() => {
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
  }, [columns]);

  // 期限日の色を取得する関数
  const getDueDateColor = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    
    if (diffDays < 0) return '#eb5a46'; // 期限切れ：赤
    if (diffDays < 1) return '#f2d600'; // 今日期限：黄色
    return '#61bd4f'; // 期限あり：緑
  };

  // 期限日のボーダーを取得する関数
  const getDueDateBorder = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    
    if (diffDays < 0) return '3px solid #eb5a46'; // 期限切れ：赤
    if (diffDays < 1) return '3px solid #f2d600'; // 今日期限：黄色
    return '3px solid #61bd4f'; // 期限あり：緑
  };

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0079bf', padding: '16px' }}>
      <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Trello風タスク管理アプリ</h1>
      
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        overflowX: 'auto', 
        paddingBottom: '20px',
        width: 'calc(100vw - 32px)', /* 画面幅からpadding分を引く */
        boxSizing: 'border-box'      /* paddingを幅に含める */
      }}>
        {columns.map(column => {
          const columnColor = getColumnColor(column.title);
          
          return (
            <div 
              key={column.id} 
              style={{ 
                backgroundColor: columnColor.bg, 
                borderRadius: '8px', 
                padding: '0',  /* パディングを0にして上部バーのために余白を空ける */
                minWidth: '270px', 
                maxWidth: '270px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                flex: '0 0 auto',  /* 幅を固定して伸縮しないように */
                maxHeight: 'calc(100vh - 100px)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                overflow: 'hidden'  /* 角丸を保つため */
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              {/* カラムのヘッダー部分に色付きバーを追加 */}
              <div style={{ 
                backgroundColor: columnColor.header, 
                height: '6px', 
                width: '100%' 
              }}></div>
              
              <div style={{ padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h2 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: columnColor.text 
                  }}>
                    {column.title}
                  </h2>
                  <button
                    onClick={() => handleDeleteColumn(column.id)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      fontSize: '18px', 
                      cursor: 'pointer', 
                      color: '#6b778c',
                      width: '24px',
                      height: '24px',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(9, 30, 66, 0.08)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    ×
                  </button>
                </div>
                
                <div style={{ 
                  overflowY: 'auto', 
                  marginBottom: '12px',
                  flexGrow: 1,
                  paddingRight: '2px',
                  maxHeight: 'calc(100vh - 220px)'
                }}>
                  {column.cards.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#6b778c', 
                      padding: '12px',
                      fontSize: '13px' 
                    }}>
                      カードがありません
                    </div>
                  ) : (
                    column.cards.map(card => (
                      <div 
                        key={card.id} 
                        style={{ 
                          backgroundColor: 'white',
                          borderRadius: '3px',
                          boxShadow: '0 1px 0 rgba(9, 30, 66, 0.25)',
                          padding: '8px 10px',
                          marginBottom: '8px',
                          cursor: 'pointer',
                          borderLeft: card.dueDate ? getDueDateBorder(card.dueDate) : `3px solid ${columnColor.header}`, // カラムの色を使用
                          transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                          position: 'relative'
                        }}
                        onClick={() => handleEditCard(column.id, card)}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 3px 5px rgba(9, 30, 66, 0.2)';
                          const deleteButton = e.currentTarget.querySelector('.delete-button') as HTMLElement;
                          if (deleteButton) deleteButton.style.opacity = '1';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 1px 0 rgba(9, 30, 66, 0.25)';
                          const deleteButton = e.currentTarget.querySelector('.delete-button') as HTMLElement;
                          if (deleteButton) deleteButton.style.opacity = '0';
                        }}
                      >
                        <div style={{ fontSize: '14px', marginBottom: '4px', wordBreak: 'break-word', paddingRight: '20px' }}>
                          {card.content}
                        </div>
                        
                        {card.dueDate && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: getDueDateColor(card.dueDate),
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: '8px'
                          }}>
                            <span style={{ marginRight: '4px' }}>📅</span>
                            {new Date(card.dueDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                        
                        <button
                          className="delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCard(column.id, card.id);
                          }}
                          style={{ 
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: 'none',
                            border: 'none',
                            borderRadius: '3px',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            color: '#6b778c',
                            opacity: '0',
                            transition: 'opacity 0.15s ease-in-out, background-color 0.15s ease-in-out',
                            cursor: 'pointer'
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
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
                
                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(9, 30, 66, 0.13)' }}>
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
                      border: '1px solid #dfe1e6', 
                      borderRadius: '3px', 
                      marginBottom: '8px',
                      fontSize: '14px'
                    }}
                    placeholder="新しいカードを追加"
                  />
                  <button
                    onClick={() => handleAddCard(column.id)}
                    style={{ 
                      backgroundColor: columnColor.header, // カラムの色を使用 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '3px', 
                      padding: '8px 12px', 
                      width: '100%', 
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '14px',
                      transition: 'background-color 0.15s ease-in-out'
                    }}
                    onMouseOver={(e) => {
                      // ホバー時に少し暗くする
                      e.currentTarget.style.filter = 'brightness(0.9)';
                    }}
                    onMouseOut={(e) => {
                      // ホバー解除時に元に戻す
                      e.currentTarget.style.filter = 'brightness(1)';
                    }}
                    disabled={!newCardContents[column.id]?.trim()}
                  >
                    追加
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* 新しいリストを追加するフォーム */}
        <div 
          style={{ 
            backgroundColor: '#ebecf0', 
            borderRadius: '8px', 
            padding: '0', 
            minWidth: '270px', 
            maxWidth: '270px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            flex: '0 0 auto',
            height: 'fit-content',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            overflow: 'hidden'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
        >
          {/* 新規リスト追加のヘッダーバー */}
          <div style={{ 
            backgroundColor: '#5e6c84', 
            height: '6px', 
            width: '100%' 
          }}></div>
          
          <div style={{ padding: '12px' }}>
            <h2 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '12px',
              color: '#172b4d'
            }}>
              新しいリストを追加
            </h2>
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              style={{ 
                width: '95%', 
                padding: '8px', 
                border: '1px solid #dfe1e6', 
                borderRadius: '3px', 
                marginBottom: '8px',
                fontSize: '14px'
              }}
              placeholder="リスト名を入力"
            />
            <button
              onClick={handleAddColumn}
              style={{ 
                backgroundColor: '#5aac44', 
                color: 'white', 
                border: 'none', 
                borderRadius: '3px', 
                padding: '8px 12px', 
                width: '100%', 
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                transition: 'background-color 0.15s ease-in-out'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#519839';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#5aac44';
              }}
              disabled={!newColumnTitle.trim()}
            >
              追加
            </button>
          </div>
        </div>
      </div>
      
      {/* 編集モーダル */}
      {editingCard && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#172b4d' }}>カードを編集</h2>
            
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: '#172b4d' }}>
              内容
            </label>
            <textarea
              value={editingCard.content}
              onChange={(e) => setEditingCard({...editingCard, content: e.target.value})}
              style={{
                width: '100%',
                height: '100px',
                padding: '8px',
                border: '1px solid #dfe1e6',
                borderRadius: '3px',
                marginBottom: '16px',
                fontSize: '14px',
                resize: 'vertical'
              }}
              placeholder="カードの内容を入力"
            />
            
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: '#172b4d' }}>
              期限日
            </label>
            <input
              type="date"
              value={editingCard.dueDate || ''}
              onChange={(e) => setEditingCard({...editingCard, dueDate: e.target.value || null})}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #dfe1e6',
                borderRadius: '3px',
                marginBottom: '16px',
                fontSize: '14px'
              }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={handleCancelEdit}
                style={{
                  backgroundColor: '#ebecf0',
                  color: '#172b4d',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '14px',
                  transition: 'background-color 0.15s ease-in-out'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#dfe1e6';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ebecf0';
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleUpdateCard}
                style={{
                  backgroundColor: '#0079bf',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '14px',
                  transition: 'background-color 0.15s ease-in-out'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#026aa7';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#0079bf';
                }}
                disabled={!editingCard.content.trim()}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 通知システム */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 1000
      }}>
        {notifications.map(notification => (
          <div 
            key={notification.id}
            style={{
              backgroundColor: notification.type === 'success' ? '#5aac44' : '#eb5a46',
              color: 'white',
              padding: '10px 16px',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              maxWidth: '300px',
              animation: 'fadeIn 0.3s ease-in-out',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;