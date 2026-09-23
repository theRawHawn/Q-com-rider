import React from 'react';
import { Home, Calendar, Navigation, DollarSign, User } from 'lucide-react';
import { useTask } from '../../context/TaskContext';

export type NavTab = 'home' | 'shifts' | 'navigation' | 'earnings' | 'history' | 'profile';

interface MobileBottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenNotifications?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const { activeTask } = useTask();

  const navItems = [
    {
      id: 'home' as NavTab,
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
      action: () => onChangeTab('home'),
    },
    {
      id: 'shifts' as NavTab,
      label: 'Shifts',
      icon: <Calendar className="w-5 h-5" />,
      action: () => onChangeTab('shifts'),
    },
    {
      id: 'navigation' as NavTab,
      label: activeTask ? 'Active' : 'Trips',
      icon: <Navigation className="w-5 h-5" />,
      badge: !!activeTask,
      action: () => onChangeTab('navigation'),
    },
    {
      id: 'earnings' as NavTab,
      label: 'Earnings',
      icon: <DollarSign className="w-5 h-5" />,
      action: () => onChangeTab('earnings'),
    },
    {
      id: 'profile' as NavTab,
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      action: () => onChangeTab('profile'),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 px-2 py-1.5 shadow-lg">
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`relative flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'text-[#f25100] font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-800 font-medium'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#f25100] ring-2 ring-white animate-pulse" />
                )}
              </div>
              <span className="text-[10px] leading-tight mt-1 tracking-tight truncate max-w-full">
                {item.label}
              </span>
              {isActive && (
                <div className="w-4 h-0.5 bg-[#f25100] rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
