
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import ViewSelector from '@/components/ui/ViewSelector';
import NoteCard from '@/components/notes/NoteCard';
import { useNotes, Note } from '@/context/NoteContext';
import { BookOpen } from 'lucide-react';

const Index = () => {
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
  
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
      <div className="w-16 h-16 rounded-full bg-memorylane-bg flex items-center justify-center mb-4">
        <BookOpen size={28} className="text-memorylane-accent" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No memories yet</h2>
      <p className="text-memorylane-textSecondary mb-6 max-w-xs">
        Tap the + button below to create your first note and start capturing your thoughts.
      </p>
      <button
        onClick={handleCreateNote}
        className="px-6 py-2 bg-memorylane-accent text-white rounded-full font-medium"
      >
        Create your first note
      </button>
    </div>
  );
  
  return (
    <div className="min-h-screen pb-16 pt-14 px-4 bg-memorylane-bg">
      <Header />
      
      <ViewSelector options={viewOptions} />
      
      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40">
            <div className="w-20 h-20 rounded-full bg-white/50 animate-pulse flex items-center justify-center">
              <BookOpen size={24} className="text-memorylane-accent opacity-50" />
            </div>
            <p className="text-memorylane-textSecondary mt-4">Loading your memories...</p>
          </div>
        ) : notes.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onClick={handleNoteClick} />
            ))}
          </div>
        )}
      </div>
      
      <BottomNavigation onFabClick={handleCreateNote} />
    </div>
  );
};

export default Index;
