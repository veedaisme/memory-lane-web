import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import NoteEditor from './NoteEditor';
import { Note, NoteLocation } from '@/context/NoteContext';

interface NoteEditorModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialNote?: Note;
  currentLocation: NoteLocation;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  onOpenChange,
  initialNote,
  currentLocation,
  onSave,
}) => {
  const handleSave = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    onSave(note);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[90vw] max-w-[900px] h-[85vh] max-h-[800px] p-0 rounded-xl shadow-2xl border-none overflow-hidden" 
        style={{ 
          background: 'linear-gradient(to bottom, #ffffff, #f8f8f8)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15), 0 1px 8px rgba(0, 0, 0, 0.12)',
        }}
      >
        <NoteEditor
          initialNote={initialNote}
          currentLocation={currentLocation}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NoteEditorModal; 