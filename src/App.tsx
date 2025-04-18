import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Column, Notification } from './types';
import Header from './components/Header';
import Board from './components/Board';
import NotificationSystem from './components/NotificationSystem';
import './App.css';

// グローバルなwindowの型拡張
declare global {
  interface Window {
    deleteCard?: {
      columnId: string;
      cardId: string;
      clicked: boolean;
    };
  }
}

function App() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingDummyData, setIsUsingDummyData] = useState(true); // 常にtrueに設定

  // Firebase接続とデータ取得
  useEffect(() => {
    // 強制的にダミーデータモードに設定
    console.log("ダミーデータモードを強制的に使用します");
    setIsUsingDummyData(true);
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
        cards: [
          {
            id: '201',
            content: 'リスニング問題2問',
            createdAt: new Date().toISOString(),
            dueDate: null
          },
          {
            id: '202',
            content: 'a',
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
    setLoading(false);
    return;

    // 以下のFirebase接続コードは実行されません
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

  // windowオブジェクトから削除情報を監視する
  useEffect(() => {
    const checkDeleteRequest = setInterval(() => {
      if (window.deleteCard && window.deleteCard.clicked) {
        const { columnId, cardId } = window.deleteCard;
        console.log('削除リクエストを検出:', columnId, cardId);
        
        // カードを削除する処理
        const updatedColumns = columns.map(col => {
          if (col.id === columnId) {
            return {
              ...col,
              cards: col.cards.filter(card => card.id !== cardId)
            };
          }
          return col;
        });
        
        setColumns(updatedColumns);
        
        // 通知を表示
        addNotification({
          type: 'success',
          message: 'カードを削除しました'
        });
        
        // リクエスト情報をリセット
        window.deleteCard.clicked = false;
      }
    }, 500);
    
    return () => clearInterval(checkDeleteRequest);
  }, [columns]);

  // ローカルでのカラム更新（ダミーデータ用）
  const handleLocalUpdate = (updatedColumns: Column[]) => {
    console.log("App内のhandleLocalUpdate関数が呼び出されました");
    console.log("更新前:", columns);
    console.log("更新後:", updatedColumns);
    setColumns(updatedColumns);
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
        <Board 
          columns={columns} 
          addNotification={addNotification}
          isUsingDummyData={isUsingDummyData}
          onUpdateColumns={handleLocalUpdate}
        />
      </main>
      <NotificationSystem notifications={notifications} />
    </div>
  );
}

export default App;