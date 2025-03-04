
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Plus } from 'lucide-react';

interface BottomNavigationProps {
  onFabClick: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onFabClick }) => {
  const location = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 glassmorphism flex items-center justify-around z-10 border-t border-memorylane-border">
      <Link 
        to="/" 
        className={`flex flex-col items-center justify-center w-20 h-full ${
          location.pathname === '/' ? 'bottom-tab-active' : 'bottom-tab-inactive'
        }`}
      >
        <Home size={22} />
        <span className="text-xs mt-1">Home</span>
      </Link>
      
      <div className="w-20 h-full relative flex items-center justify-center">
        <button 
          onClick={onFabClick}
          className="fab absolute -top-8"
        >
          <Plus size={28} />
        </button>
      </div>
      
      <Link 
        to="/explore" 
        className={`flex flex-col items-center justify-center w-20 h-full ${
          location.pathname === '/explore' ? 'bottom-tab-active' : 'bottom-tab-inactive'
        }`}
      >
        <Compass size={22} />
        <span className="text-xs mt-1">Explore</span>
      </Link>
    </div>
  );
};

export default BottomNavigation;
