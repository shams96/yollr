'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Settings, Trophy, Gift, Tag } from 'lucide-react';

interface FeedHeaderProps {
  campus: any;
}

export function FeedHeader({ campus }: FeedHeaderProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {campus?.logo_url ? (
            <img
              src={campus.logo_url}
              alt={campus.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {campus?.name?.[0] || 'Y'}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {campus?.name || 'Yollr'}
            </h1>
            <p className="text-xs text-gray-500">Campus Feed</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-600 hover:text-primary-600 rounded-full hover:bg-primary-50"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push('/mystery-boxes')}
            className="p-2 text-gray-600 hover:text-primary-600 rounded-full hover:bg-primary-50"
            title="Mystery Boxes"
          >
            <Gift className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push('/sponsor-offers')}
            className="p-2 text-gray-600 hover:text-primary-600 rounded-full hover:bg-primary-50"
            title="Sponsor Offers"
          >
            <Tag className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push('/settings')}
            className="p-2 text-gray-600 hover:text-primary-600 rounded-full hover:bg-primary-50"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showNotifications && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Notifications</h3>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">No new notifications</div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}