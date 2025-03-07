import React, { useState, useRef, useEffect } from "react";
import { useNotes, Note, NoteLocation } from "@/context/NoteContext";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import NoteEditor from "@/components/notes/NoteEditor";
import { DisclosureProvider } from "@/context/DisclosureContext";
import { VisuallyHidden } from '@/components/ui/visually-hidden';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialNote?: Note;
  currentLocation?: NoteLocation;
}

const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  onClose,
  initialNote,
  currentLocation,
}) => {
  const { addNote, updateNote } = useNotes();
  // Track our own open state to ensure we can control closing properly
  const [open, setOpen] = useState(isOpen);
  const isMountedRef = useRef(true);
  
  // Sync with parent's isOpen prop
  useEffect(() => {
    if (isOpen !== open) {
      setOpen(isOpen);
    }
  }, [isOpen]);
  
  // Track component mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Safe version of onClose that checks if component is still mounted
  const safeClose = () => {
    if (isMountedRef.current) {
      setOpen(false);
      // Use a small timeout to ensure state updates before calling onClose
      setTimeout(() => {
        if (isMountedRef.current && typeof onClose === 'function') {
          onClose();
        }
      }, 10);
    }
  };

  const handleSave = (title: string, content: string, tags: string[], location?: string) => {
    // Ensure content is not empty
    if (!content.trim()) {
      return false;
    }
    
    const noteLocation: NoteLocation = location ? 
      { name: location, latitude: 0, longitude: 0 } : 
      currentLocation || { name: 'Unknown Location', latitude: 0, longitude: 0 };
    
    if (initialNote) {
      // Update existing note
      updateNote(initialNote.id, {
        title,
        content,
        tags,
        location: noteLocation,
      });
    } else {
      // Create new note
      addNote({
        title,
        content,
        tags,
        location: noteLocation,
      });
    }
    
    // Close the modal safely
    safeClose();
    return true;
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          // Don't call safeClose here, just update our internal state
          // The parent component will handle the actual closing
          setTimeout(() => {
            if (isMountedRef.current && typeof onClose === 'function') {
              onClose();
            }
          }, 10);
        }
      }}
    >
      <DialogContent 
        className="sm:max-w-[550px] p-0 overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 shadow-lg shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-800"
        style={{ 
          borderRadius: '16px',
          maxHeight: 'calc(100vh - 40px)',
        }}
        hideCloseButton={true}
      >
        <DialogTitle>
          <VisuallyHidden>
            {initialNote ? 'Edit Note' : 'Create New Note'}
          </VisuallyHidden>
        </DialogTitle>
        <DialogDescription>
          <VisuallyHidden>
            {initialNote ? 'Edit your existing note' : 'Create a new note in Memory Lane'}
          </VisuallyHidden>
        </DialogDescription>
        
        <DisclosureProvider isEditMode={!!initialNote}>
          <NoteEditor 
            initialContent={initialNote?.content || ""}
            initialTitle={initialNote?.title || ""}
            initialTags={initialNote?.tags || []}
            initialLocation={initialNote?.location?.name || ""}
            onSave={handleSave}
            onCancel={safeClose}
          />
        </DisclosureProvider>
      </DialogContent>
    </Dialog>
  );
};

export default NoteEditorModal; 