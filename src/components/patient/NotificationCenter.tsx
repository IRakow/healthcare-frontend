import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Check } from 'lucide-react';

interface Notification {
  id: number;
  type: 'reminder' | 'alert' | 'info';
  message: string;
  timestamp: string;
}

const iconMap = {
  reminder: <Bell className="text-blue-500 w-5 h-5" />,
  alert: <AlertTriangle className="text-red-500 w-5 h-5" />,
  info: <Check className="text-green-500 w-5 h-5" />
};

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // TODO: Replace with Supabase pull
    setNotifications([
      {
        id: 1,
        type: 'reminder',
        message: "Time to log today's lunch photo.",
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        type: 'alert',
        message: 'You missed your hydration goal yesterday.',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 3,
        type: 'info',
        message: 'You completed your weekly meditation goal. Great job!',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      }
    ]);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow space-y-5"
    >
      <h3 className="text-xl font-semibold text-gray-800">Notifications</h3>
      <ul className="space-y-3">
        {notifications.map((n) => (
          <li key={n.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border shadow-sm">
            {iconMap[n.type]}
            <div>
              <p className="text-sm text-gray-800">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(n.timestamp).toLocaleString()}</p>
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};