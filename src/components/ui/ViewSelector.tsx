
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface ViewOption {
  label: string;
  path: string;
}

interface ViewSelectorProps {
  options: ViewOption[];
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ options }) => {
  const location = useLocation();
  
  return (
    <div className="flex items-center justify-center p-2 mx-auto my-4 bg-white/70 backdrop-blur-sm w-auto rounded-full shadow-sm border border-white/50 max-w-[90%]">
      <div className="flex items-center space-x-1 p-0.5">
        {options.map((option) => {
          const isActive = location.pathname === option.path;
          return (
            <Link
              key={option.path}
              to={option.path}
              className={`view-selector-option ${
                isActive ? 'view-selector-active animate-scale-in' : 'view-selector-inactive'
              }`}
            >
              {option.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ViewSelector;
