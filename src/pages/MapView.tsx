
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import ViewSelector from '@/components/ui/ViewSelector';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Note, useNotes } from '@/context/NoteContext';
import MapComponent from '@/components/map/MapComponent';

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
  
  const handleNoteClick = (note: Note) => {
    navigate(`/editor/${note.id}`);
  };
  
  const notesWithLocation = notes.filter(note => 
    note.location && note.location.latitude && note.location.longitude
  );
  
  const renderMapContent = () => {
    if (loading) {
      return (
        <div className="glassmorphism p-8 rounded-lg mb-4 animate-fade-in text-center">
          <div className="flex justify-center mb-4">
            <MapPin size={40} className="text-memorylane-accent opacity-30" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Loading Map</h2>
          <p className="text-memorylane-textSecondary">
            Retrieving your memories...
          </p>
        </div>
      );
    }
    
    if (notesWithLocation.length === 0) {
      return (
        <div className="glassmorphism p-8 rounded-lg mb-4 animate-fade-in text-center">
          <div className="flex justify-center mb-4">
            <MapPin size={40} className="text-memorylane-accent opacity-30" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Memories on the Map</h2>
          <p className="text-memorylane-textSecondary">
            {notes.length > 0 
              ? 'Your notes don\'t have location data. Create a note with location to see it on the map.'
              : 'Create your first note to see it on the map!'}
          </p>
        </div>
      );
    }
    
    return (
      <div className="h-[70vh] glassmorphism p-1 rounded-lg mb-4 animate-fade-in">
        <MapComponent notes={notesWithLocation} onNoteClick={handleNoteClick} />
      </div>
    );
  };
  
  return (
    <div className="min-h-screen pb-16 pt-14 px-4 bg-memorylane-bg">
      <Header />
      
      <ViewSelector options={viewOptions} />
      
      <div className="mt-6">
        {renderMapContent()}
      </div>
      
      <BottomNavigation onFabClick={handleCreateNote} />
    </div>
  );
};

export default MapView;
