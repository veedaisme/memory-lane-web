import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import ViewSelector from '@/components/ui/ViewSelector';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { MapPin } from 'lucide-react';
import { Note, NoteLocation, useNotes } from '@/context/NoteContext';
import MapComponent from '@/components/map/MapComponent';
import NoteEditorModal from '@/components/notes/NoteEditorModal';
import { useLocation } from '@/hooks/useLocation';

const MapView = () => {
  const { notes, loading, addNote, updateNote } = useNotes();
  const { latitude, longitude, name } = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);
  
  const currentLocation: NoteLocation = {
    latitude,
    longitude,
    name
  };
  
  const viewOptions = [
    { label: 'Timeline', path: '/' },
    { label: 'Map', path: '/map' },
    { label: 'Graph', path: '/graph' }
  ];
  
  const handleCreateNote = () => {
    setSelectedNote(undefined);
    setIsModalOpen(true);
  };
  
  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedNote) {
      updateNote(selectedNote.id, noteData);
    } else {
      addNote(noteData);
    }
  };
  
  const notesWithLocation = notes.filter(note => 
    note.location && note.location.latitude && note.location.longitude
  );
  
  return (
    <div className="min-h-screen pb-16 pt-14 bg-memorylane-bg">
      <Header />
      
      <ViewSelector options={viewOptions} />
      
      <div className="h-[calc(100vh-8rem)]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 rounded-full bg-white/50 animate-pulse flex items-center justify-center">
              <MapPin size={24} className="text-memorylane-accent opacity-50" />
            </div>
            <p className="text-memorylane-textSecondary mt-4">Loading map data...</p>
          </div>
        ) : (
          <MapComponent 
            notes={notesWithLocation} 
            onNoteClick={handleNoteClick} 
          />
        )}
      </div>
      
      <BottomNavigation onFabClick={handleCreateNote} />
      
      <NoteEditorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialNote={selectedNote}
        currentLocation={currentLocation}
      />
    </div>
  );
};

export default MapView;
