import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Column, Notification } from './types';
import Header from './components/Header';
import Board from './components/Board';
import NotificationSystem from './components/NotificationSystem';
import './App.css';

function App() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // ダミーデータの作成（Firebaseが未設定の場合のためのフォールバック）
  useEffect(() => {
    // Firebase接続前にはダミーデータを表示
    if (!db) {
      setColumns([
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
          cards: []
        },
        {
          id: '3',
          title: '完了',
          order: 2,
          cards: []
        }
      ]);
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, "columns"), orderBy("order"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const columnsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Column[];
        
        setColumns(columnsData);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase connection error:", error);
      // Firebaseに接続できない場合はダミーデータを表示
      setColumns([
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
          cards: []
        }
      ]);
      setLoading(false);
    }
  }, []);

  // 通知
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

  if (loading) {
    return <div className="flex justify-center items-center h-screen">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <Board columns={columns} addNotification={addNotification} />
      </div>
      <NotificationSystem notifications={notifications} />
    </div>
  );
}

export default App;