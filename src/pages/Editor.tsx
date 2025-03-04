
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NoteEditor from '@/components/notes/NoteEditor';
import { useNotes } from '@/context/NoteContext';
import { useLocation } from '@/hooks/useLocation';

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const { getNote, addNote, updateNote } = useNotes();
  const navigate = useNavigate();
  const { latitude, longitude, name, loading } = useLocation();
  
  const note = id ? getNote(id) : undefined;
  
  const handleSave = (noteData: any) => {
    if (id && note) {
      updateNote(id, noteData);
    } else {
      addNote(noteData);
    }
  };
  
  const handleCancel = () => {
    navigate(-1);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-pulse-soft">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-white">
      <NoteEditor
        initialNote={note}
        currentLocation={{ latitude, longitude, name }}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default Editor;
