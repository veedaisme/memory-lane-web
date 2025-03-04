
import React from 'react';
import Header from '@/components/layout/Header';
import ViewSelector from '@/components/ui/ViewSelector';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useNotes } from '@/context/NoteContext';

const MapView = () => {
  const navigate = useNavigate();
  const { notes, loading } = useNotes();
  
  const viewOptions = [
    { label: 'Timeline', path: '/' },
    { label: 'Map', path: '/map' },
    { label: 'Graph', path: '/graph' }
  ];
  
  const handleCreateNote = () => {
    navigate('/editor');
  };
  
  return (
    <div className="min-h-screen pb-16 pt-14 px-4 bg-memorylane-bg">
      <Header />
      
      <ViewSelector options={viewOptions} />
      
      <div className="mt-6 text-center">
        <div className="glassmorphism p-8 rounded-lg mb-4 animate-fade-in">
          <div className="flex justify-center mb-4">
            <MapPin size={40} className="text-memorylane-accent opacity-30" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Map View</h2>
          <p className="text-memorylane-textSecondary">
            {loading ? 'Loading notes...' : (
              notes.length > 0 
                ? 'In the future, your notes will be displayed here on an interactive map based on location.'
                : 'Create your first note to see it on the map!'
            )}
          </p>
        </div>
      </div>
      
      <BottomNavigation onFabClick={handleCreateNote} />
    </div>
  );
};

export default MapView;
