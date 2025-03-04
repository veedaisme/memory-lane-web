
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface NoteLocation {
  latitude: number;
  longitude: number;
  name: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  location: NoteLocation;
  tags: string[];
}

interface NoteContextType {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
  loading: boolean;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
};

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) {
        setNotes([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching notes:', error);
          toast({
            title: 'Error fetching notes',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }
        
        if (data) {
          const parsedNotes = data.map(note => ({
            id: note.id,
            title: note.title,
            content: note.content,
            createdAt: new Date(note.created_at),
            updatedAt: new Date(note.updated_at),
            location: note.location || {
              latitude: 0,
              longitude: 0,
              name: 'Unknown Location'
            },
            tags: note.tags || [],
          }));
          
          setNotes(parsedNotes);
        }
      } catch (error) {
        console.error('Failed to load notes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user, toast]);

  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: note.title,
          content: note.content,
          location: note.location,
          tags: note.tags,
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error adding note:', error);
        toast({
          title: 'Error adding note',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      if (data) {
        const newNote: Note = {
          id: data.id,
          title: data.title,
          content: data.content,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          location: data.location,
          tags: data.tags || [],
        };
        
        setNotes(prev => [newNote, ...prev]);
        
        toast({
          title: 'Note saved',
          description: 'Your memory has been saved successfully.',
        });
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const updateNote = async (id: string, updatedFields: Partial<Note>) => {
    if (!user) return;
    
    try {
      // Convert from frontend model to database model
      const dbFields: any = {};
      
      if (updatedFields.title !== undefined) dbFields.title = updatedFields.title;
      if (updatedFields.content !== undefined) dbFields.content = updatedFields.content;
      if (updatedFields.location !== undefined) dbFields.location = updatedFields.location;
      if (updatedFields.tags !== undefined) dbFields.tags = updatedFields.tags;
      
      const { error } = await supabase
        .from('notes')
        .update(dbFields)
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error updating note:', error);
        toast({
          title: 'Error updating note',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      setNotes(prev =>
        prev.map(note =>
          note.id === id
            ? { ...note, ...updatedFields, updatedAt: new Date() }
            : note
        )
      );
      
      toast({
        title: 'Note updated',
        description: 'Your memory has been updated successfully.',
      });
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error deleting note:', error);
        toast({
          title: 'Error deleting note',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      setNotes(prev => prev.filter(note => note.id !== id));
      
      toast({
        title: 'Note deleted',
        description: 'Your memory has been deleted.',
      });
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const getNote = (id: string) => {
    return notes.find(note => note.id === id);
  };

  return (
    <NoteContext.Provider value={{ notes, addNote, updateNote, deleteNote, getNote, loading }}>
      {children}
    </NoteContext.Provider>
  );
};
