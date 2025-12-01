'use client';

import { useState } from 'react';
import { Home, PlusCircle, Users, Trophy, Camera } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const navItems = [
    { icon: Home, label: 'Feed', path: '/feed' },
    { icon: Trophy, label: 'Heist', path: '/heist' },
    { icon: Users, label: 'Squads', path: '/squads' },
    { icon: Trophy, label: 'Athletics', path: '/athletics' },
  ];

  const handleCreateClick = () => {
    setShowCreateMenu(!showCreateMenu);
  };

  const handleCreateMoment = () => {
    setShowCreateMenu(false);
    router.push('/capture');
  };

  const handleCreatePoll = () => {
    setShowCreateMenu(false);
    router.push('/poll/create');
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-20">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center p-2 rounded-lg ${
                  isActive ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}

          <div className="relative">
            <button
              onClick={handleCreateClick}
              className="flex flex-col items-center p-2 rounded-lg text-gray-600 hover:text-primary-600"
            >
              <PlusCircle className="w-6 h-6" />
              <span className="text-xs mt-1">Create</span>
            </button>

            {showCreateMenu && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-max">
                <button
                  onClick={handleCreateMoment}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Moment
                </button>
                <button
                  onClick={handleCreatePoll}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Poll
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showCreateMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-0 z-10"
          onClick={() => setShowCreateMenu(false)}
        />
      )}
    </>
  );
}