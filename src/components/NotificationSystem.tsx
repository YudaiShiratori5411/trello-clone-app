import { Notification } from '../types';

interface NotificationSystemProps {
  notifications: Notification[];
}

function NotificationSystem({ notifications }: NotificationSystemProps) {
  // 通知タイプに応じたスタイルを返す
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getNotificationStyle(notification.type)} text-white rounded shadow-lg p-4 mb-2 min-w-[250px] max-w-md animate-fadeIn`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
}

export default NotificationSystem;