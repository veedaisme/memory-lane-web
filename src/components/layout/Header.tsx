
import React from 'react';
import { Bell, User } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showNotificationIcon?: boolean;
  showProfileIcon?: boolean;
  leftAction?: React.ReactNode;
  rightActions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ 
  title = 'Memory Lane',
  showNotificationIcon = true,
  showProfileIcon = true,
  leftAction,
  rightActions 
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 glassmorphism px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        {leftAction ? (
          leftAction
        ) : (
          <h1 className="text-lg font-medium text-memorylane-textPrimary">{title}</h1>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        {rightActions || (
          <>
            {showNotificationIcon && (
              <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 active:bg-black/10 transition-colors">
                <Bell size={20} className="text-memorylane-textSecondary" />
              </button>
            )}
            {showProfileIcon && (
              <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 active:bg-black/10 transition-colors">
                <User size={20} className="text-memorylane-textSecondary" />
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
