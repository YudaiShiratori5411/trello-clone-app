import { useState, useEffect } from 'react';
import './App.css';

interface Card {
  id: string;
  text: string;
}

interface List {
  id: string;
  title: string;
  cards: Card[];
}

function App() {
  const [lists, setLists] = useState<List[]>([
    { id: '1', title: 'To Do', cards: [
      { id: '1-1', text: '中国語検定1級対策' },
      { id: '1-2', text: '日文中訳' }
    ]},
    { id: '2', title: '進行中', cards: [
      { id: '2-1', text: 'リスニング問題2問' }
    ]},
    { id: '3', title: '完了', cards: [] }
  ]);
  
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newCardContents, setNewCardContents] = useState<{ [key: string]: string }>({});

  // リストを追加する関数
  const addList = () => {
    if (newListTitle.trim() === '') return;
    
    const newList: List = {
      id: Date.now().toString(),
      title: newListTitle,
      cards: []
    };
    
    setLists([...lists, newList]);
    setNewListTitle('');
    setShowNewListForm(false);
  };

  // カードを追加する関数
  const addCard = (listId: string) => {
    const cardContent = newCardContents[listId];
    if (!cardContent || cardContent.trim() === '') return;
    
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          cards: [...list.cards, { id: `${listId}-${Date.now()}`, text: cardContent }]
        };
      }
      return list;
    });
    
    setLists(updatedLists);
    setNewCardContents({...newCardContents, [listId]: ''});
  };

  // リストを閉じる関数
  const closeList = (listId: string) => {
    const updatedLists = lists.filter(list => list.id !== listId);
    setLists(updatedLists);
  };

  return (
    <div className="app-container" style={{ padding: '20px', backgroundColor: '#0079bf', minHeight: '100vh' }}>
      <div className="header-container" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: 'white', margin: 0 }}>Trello風タスク管理アプリ</h1>
        <button 
          className="add-list-button" 
          style={{ 
            marginLeft: '15px', 
            fontSize: '14px', 
            padding: '5px 10px', 
            background: 'rgba(255, 255, 255, 0.3)',
            border: 'none',
            borderRadius: '3px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
          onClick={() => setShowNewListForm(!showNewListForm)}
        >
          {showNewListForm ? '- リストを追加' : '+ リストを追加'}
        </button>
      </div>

      <div className="lists-container" style={{ display: 'flex', overflowX: 'auto', gap: '10px' }}>
        {lists.map(list => (
          <div key={list.id} className="list" style={{ 
            minWidth: '272px', 
            backgroundColor: list.title === '完了' ? '#ebecf0' : list.title === '進行中' ? '#fcf7d9' : '#ebecf0',
            borderRadius: '3px',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>{list.title}</h2>
              <button onClick={() => closeList(list.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
            </div>

            <div className="cards-container" style={{ marginBottom: 'auto' }}>
              {list.cards.map(card => (
                <div key={card.id} className="card" style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '3px', 
                  padding: '10px', 
                  marginBottom: '8px',
                  boxShadow: '0 1px 0 rgba(9,30,66,.25)',
                  borderLeft: '3px solid #0079bf'
                }}>
                  {card.text}
                </div>
              ))}

              {list.cards.length === 0 && (
                <div style={{ color: '#5e6c84', padding: '8px 0' }}>
                  カードがありません
                </div>
              )}
            </div>

            <div className="add-card-container" style={{ marginTop: '10px' }}>
              <input
                type="text"
                placeholder="新しいカードを追加"
                value={newCardContents[list.id] || ''}
                onChange={(e) => setNewCardContents({...newCardContents, [list.id]: e.target.value})}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  boxSizing: 'border-box', 
                  border: '1px solid #dfe1e6',
                  borderRadius: '3px',
                  marginBottom: '8px'
                }}
              />
              <button 
                onClick={() => addCard(list.id)}
                style={{ 
                  width: '100%',
                  padding: '8px', 
                  backgroundColor: list.title === '完了' ? '#5aac44' : list.title === '進行中' ? '#f2b01e' : '#0079bf',
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                追加
              </button>
            </div>
          </div>
        ))}

        {showNewListForm && (
          <div className="new-list-form" style={{ 
            minWidth: '272px', 
            backgroundColor: 'white', 
            borderRadius: '3px',
            padding: '10px'
          }}>
            <input
              type="text"
              placeholder="リスト名を入力"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px', 
                boxSizing: 'border-box', 
                border: '1px solid #dfe1e6',
                borderRadius: '3px',
                marginBottom: '8px'
              }}
              autoFocus
            />
            <button 
              onClick={addList}
              style={{ 
                width: '100%',
                padding: '8px', 
                backgroundColor: '#5aac44',
                color: 'white', 
                border: 'none', 
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              追加
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;