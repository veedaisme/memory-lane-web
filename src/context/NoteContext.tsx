
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';
import { generateNoteEmbedding, storeNoteEmbedding } from '@/utils/embeddingUtils';

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
          const parsedNotes: Note[] = data.map(note => ({
            id: note.id,
            title: note.title,
            content: note.content || '',
            createdAt: new Date(note.created_at),
            updatedAt: new Date(note.updated_at),
            location: parseLocation(note.location),
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

  // Helper function to safely parse location data
  const parseLocation = (locationData: Json | null): NoteLocation => {
    if (!locationData) {
      return {
        latitude: 0,
        longitude: 0,
        name: 'Unknown Location'
      };
    }
    
    try {
      // Handle both string and object formats
      if (typeof locationData === 'string') {
        const parsed = JSON.parse(locationData);
        return {
          latitude: parsed.latitude || 0,
          longitude: parsed.longitude || 0,
          name: parsed.name || 'Unknown Location'
        };
      } else if (typeof locationData === 'object') {
        return {
          latitude: (locationData as any).latitude || 0,
          longitude: (locationData as any).longitude || 0,
          name: (locationData as any).name || 'Unknown Location'
        };
      }
    } catch (e) {
      console.error('Error parsing location data:', e);
    }
    
    return {
      latitude: 0,
      longitude: 0,
      name: 'Unknown Location'
    };
  };

  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    try {
      // Step 1: Create the note without embedding first
      const { data, error } = await supabase
        .from('notes')
        .insert({
          title: note.title,
          content: note.content,
          location: note.location as unknown as Json,
          tags: note.tags,
          user_id: user.id
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
          content: data.content || '',
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          location: parseLocation(data.location),
          tags: data.tags || [],
        };
        
        setNotes(prev => [newNote, ...prev]);
        
        toast({
          title: 'Note saved',
          description: 'Your memory has been saved successfully.',
        });
        
        // Step 2: Generate and store the embedding asynchronously
        try {
          console.log('Starting embedding generation for note:', data.id);
          
          const embedding = await generateNoteEmbedding({
            title: note.title,
            content: note.content
          });
          
          console.log('Embedding generated successfully:', {
            noteId: data.id,
            embeddingLength: embedding.length,
            sampleValues: embedding.slice(0, 3) // Log first few values for debugging
          });
          
          await storeNoteEmbedding(data.id, embedding);
          console.log('Embedding generated and stored for note:', data.id);
        } catch (embeddingError) {
          console.error('Error generating or storing embedding:', embeddingError);
          // Don't show error to user as the note was saved successfully
          // But log detailed error for debugging
          if (embeddingError instanceof Error) {
            console.error('Embedding error details:', {
              message: embeddingError.message,
              stack: embeddingError.stack
            });
          }
        }
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
      if (updatedFields.location !== undefined) dbFields.location = updatedFields.location as unknown as Json;
      if (updatedFields.tags !== undefined) dbFields.tags = updatedFields.tags;
      
      const { error } = await supabase
        .from('notes')
        .update(dbFields)
        .eq('id', id);
        
      if (error) {
        console.error('Error updating note:', error);
        toast({
          title: 'Error updating note',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      // If title or content was updated, regenerate the embedding
      if (updatedFields.title !== undefined || updatedFields.content !== undefined) {
        try {
          // Get the current note to ensure we have complete data for embedding
          const { data: currentNote } = await supabase
            .from('notes')
            .select('title, content')
            .eq('id', id)
            .single();
          
          if (currentNote) {
            const embedding = await generateNoteEmbedding({
              title: currentNote.title,
              content: currentNote.content || ''
            });
            
            await storeNoteEmbedding(id, embedding);
            console.log('Updated embedding for note:', id);
          }
        } catch (embeddingError) {
          console.error('Error updating embedding:', embeddingError);
          // Don't show error to user as the note was updated successfully
        }
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
        .eq('id', id);
        
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
