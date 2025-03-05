import React, { useState, useEffect } from 'react';
import { MapPin, Tag, X, Save } from 'lucide-react';
import { useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { Note, NoteLocation } from '@/context/NoteContext';
import { generateTitleFromContent } from '@/utils/titleGenerator';
import { useToast } from '@/hooks/use-toast';

interface NoteEditorProps {
  initialNote?: Note;
  currentLocation: NoteLocation;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  initialNote,
  currentLocation,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [tags, setTags] = useState<string[]>(initialNote?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [location, setLocation] = useState<NoteLocation>(
    initialNote?.location || currentLocation
  );
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { toast } = useToast();
  
  // Auto-focus content field when component mounts
  useEffect(() => {
    const contentField = document.getElementById('note-content');
    if (contentField) {
      contentField.focus();
    }
  }, []);
  
  const handleSave = async () => {
    // Don't save empty notes
    if (!content.trim()) {
      onCancel();
      return;
    }
    
    try {
      // If title is empty, generate one with AI
      let finalTitle = title;
      if (!title.trim()) {
        setIsGeneratingTitle(true);
        finalTitle = await generateTitleFromContent(content);
        setTitle(finalTitle);
        setIsGeneratingTitle(false);
      }
      
      onSave({
        title: finalTitle,
        content,
        tags,
        location,
      });
      
      navigate(-1);
    } catch (error) {
      console.error('Error saving note:', error);
      setIsGeneratingTitle(false);
      
      // Fallback: if title generation fails but content exists, use first few words
      if (!title.trim()) {
        const words = content.trim().split(' ');
        const truncatedContent = words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
        setTitle(truncatedContent);
      }
      
      // Save with whatever title we have
      onSave({
        title: title || content.substring(0, 40) + '...',
        content,
        tags,
        location,
      });
      
      navigate(-1);
    }
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && tagInput) {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-white animate-fade-in">
      <div className="p-4 border-b border-memorylane-border flex items-center justify-between">
        <button 
          onClick={onCancel}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-memorylane-border"
        >
          <X size={22} className="text-memorylane-textSecondary" />
        </button>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={onCancel}
            className="px-4 py-2 rounded-full bg-memorylane-border text-memorylane-textSecondary font-medium text-sm"
          >
            Draft
          </button>
          <button 
            onClick={handleSave}
            disabled={isGeneratingTitle}
            className="px-4 py-2 rounded-full bg-memorylane-accent text-white font-medium text-sm flex items-center disabled:opacity-75"
          >
            {isGeneratingTitle ? (
              <>
                <span className="mr-2">Thinking</span>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </>
            ) : (
              <>
                <Save size={16} className="mr-1" />
                Save
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 subtle-scroll">
        <input
          type="text"
          id="note-title"
          placeholder="Add title (or leave empty for AI-generated title)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-xl font-semibold mb-4 bg-transparent outline-none border-none placeholder-memorylane-textTertiary"
        />
        
        <textarea
          id="note-content"
          placeholder="Start writing..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[200px] text-memorylane-textPrimary text-base bg-transparent outline-none border-none resize-none placeholder-memorylane-textTertiary"
        />
        
        <div className="mt-6 pt-4 border-t border-memorylane-border">
          <div className="flex items-center text-memorylane-textSecondary mb-4">
            <MapPin size={18} className="mr-2" />
            <span className="text-sm">{location.name}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-memorylane-textSecondary">
              <Tag size={18} className="mr-2" />
              <span className="text-sm">Tags</span>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <div 
                  key={tag}
                  className="flex items-center bg-memorylane-bg rounded-full px-3 py-1"
                >
                  <span className="text-xs text-memorylane-textSecondary">{tag}</span>
                  <button 
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-memorylane-textTertiary hover:text-memorylane-textSecondary"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <div className="flex items-center bg-memorylane-bg rounded-full px-3 py-1">
                <input
                  type="text"
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleAddTag}
                  className="text-xs bg-transparent outline-none w-20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
