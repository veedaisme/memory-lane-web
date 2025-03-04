
import React, { useState } from 'react';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
              <div className="relative">
                <button 
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 active:bg-black/10 transition-colors"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <User size={20} className="text-memorylane-textSecondary" />
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 glassmorphism rounded-md shadow-lg py-1 z-20">
                    <div className="px-4 py-2 border-b border-memorylane-border">
                      <p className="text-sm font-medium text-memorylane-textPrimary truncate">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center px-4 py-2 text-sm text-memorylane-textSecondary hover:bg-black/5"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
