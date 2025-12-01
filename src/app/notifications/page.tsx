'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Flame, Heart, MessageCircle, UserPlus } from 'lucide-react';

const mockNotifications = [
  {
    id: '1',
    type: 'reaction',
    icon: Flame,
    color: 'text-accent-coral',
    message: 'Sarah and 23 others reacted 🔥 to your moment',
    time: '2m ago',
    read: false,
  },
  {
    id: '2',
    type: 'comment',
    icon: MessageCircle,
    color: 'text-accent-mint',
    message: 'Mike commented on your heist submission',
    time: '15m ago',
    read: false,
  },
  {
    id: '3',
    type: 'follow',
    icon: UserPlus,
    color: 'text-accent-lilac',
    message: 'Emma started following you',
    time: '1h ago',
    read: true,
  },
  {
    id: '4',
    type: 'like',
    icon: Heart,
    color: 'text-energy-pink',
    message: 'Your poll reached 100 votes!',
    time: '3h ago',
    read: true,
  },
];

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-secondary/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center gap-2">
                <Bell className="w-6 h-6 text-accent-mint" />
                <h1 className="text-text-primary font-bold text-xl">
                  Notifications
                </h1>
              </div>
            </div>
            <button className="text-accent-mint text-sm font-medium hover:underline">
              Mark all read
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-2">
          {mockNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-bg-card rounded-xl p-4 border transition-all hover:border-white/20 cursor-pointer ${
                notification.read ? 'border-white/10' : 'border-accent-mint/30 bg-accent-mint/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full bg-bg-primary ${notification.color}`}>
                  <notification.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm">{notification.message}</p>
                  <p className="text-text-muted text-xs mt-1">{notification.time}</p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-accent-mint flex-shrink-0 mt-2" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state (hidden when there are notifications) */}
        {mockNotifications.length === 0 && (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-text-primary font-bold text-lg mb-2">
              No notifications yet
            </h3>
            <p className="text-text-secondary text-sm">
              We'll notify you when something exciting happens!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
