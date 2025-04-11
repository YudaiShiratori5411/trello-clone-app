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

  // Firebase接続とデータ取得
  useEffect(() => {
    // Firebaseが未設定の場合のダミーデータ
    if (!db) {
      console.log("Firebase DBが未設定です。ダミーデータを使用します。");
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
      console.log("Firebaseからデータを取得します");
      const q = query(collection(db, "columns"), orderBy("order"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const columnsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Column[];
        
        console.log("取得したデータ:", columnsData);
        setColumns(columnsData);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Firebaseエラー:", error);
      setLoading(false);
    }
  }, []);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-blue-600">
        <div className="text-white text-2xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="bg-gradient-to-br from-blue-500 to-blue-700 min-h-[calc(100vh-64px)]">
        <Board columns={columns} addNotification={addNotification} />
      </main>
      <NotificationSystem notifications={notifications} />
    </div>
  );
}

export default App;