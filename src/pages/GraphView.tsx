import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import ViewSelector from '@/components/ui/ViewSelector';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Network } from 'lucide-react';
import { Note, NoteLocation, useNotes } from '@/context/NoteContext';
import NoteEditorModal from '@/components/notes/NoteEditorModal';
import { useLocation } from '@/hooks/useLocation';

const GraphView = () => {
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
  
  return (
    <div className="min-h-screen pb-16 pt-14 px-4 bg-memorylane-bg">
      <Header />
      
      <ViewSelector options={viewOptions} />
      
      <div className="mt-6 text-center">
        <div className="glassmorphism p-8 rounded-lg mb-4 animate-fade-in">
          <div className="flex justify-center mb-4">
            <Network size={40} className="text-memorylane-accent opacity-30" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Graph View</h2>
          <p className="text-memorylane-textSecondary">
            {loading ? 'Loading notes...' : (
              notes.length > 0 
                ? 'In the future, your notes will be displayed here as an interactive graph, showing connections between related thoughts.'
                : 'Create your first note to see it in the graph view!'
            )}
          </p>
        </div>
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

export default GraphView;
