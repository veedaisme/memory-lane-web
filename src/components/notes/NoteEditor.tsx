import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Tag, X, Save, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Note } from '@/context/NoteContext';
import { toast } from '@/hooks/use-toast';
import { useDisclosure, DisclosureLevel } from '@/context/DisclosureContext';
import { Button } from '@/components/ui/button';

interface NoteEditorProps {
  initialContent: string;
  initialTitle: string;
  initialTags: string[];
  initialLocation?: string;
  onSave: (title: string, content: string, tags: string[], location?: string) => boolean;
  onCancel: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  initialContent,
  initialTitle,
  initialTags,
  initialLocation,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialTitle || '');
  const [content, setContent] = useState(initialContent || '');
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const [tagInput, setTagInput] = useState('');
  const [location, setLocation] = useState<string | undefined>(initialLocation);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  
  const { level, incrementLevel } = useDisclosure();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-focus the content field when the component mounts
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.focus();
    }
  }, []);
  
  // Auto-increment disclosure level based on content length
  useEffect(() => {
    if (content.length > 20 && level === DisclosureLevel.Minimal) {
      incrementLevel();
    } else if (content.length > 50 && level === DisclosureLevel.Standard) {
      incrementLevel();
    }
  }, [content, level, incrementLevel]);
  
  const handleSave = () => {
    // Only save if content is not empty
    if (!content.trim()) {
      toast({
        title: "Cannot save empty note",
        description: "Please add some content to your note before saving.",
        variant: "destructive",
      });
      return;
    }
    
    // Generate title from content if no title provided
    const finalTitle = title.trim() || generateTitleFromContent(content);
    
    try {
      const saveSuccessful = onSave(finalTitle, content, tags, location);
      
      if (saveSuccessful) {
        toast({
          title: "Note saved",
          description: "Your note has been saved successfully.",
          variant: "default",
        });
      }
      
      // Ensure we call onCancel to close the modal
      if (typeof onCancel === 'function') {
        setTimeout(() => {
          onCancel();
        }, 10);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error saving note",
        description: "There was an error saving your note. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    if (tags.includes(tagInput.trim())) {
      toast({
        title: "Tag already exists",
        description: "This tag has already been added to the note.",
        variant: "destructive",
      });
      return;
    }
    
    setTags([...tags, tagInput.trim()]);
    setTagInput('');
  };
  
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle keyboard navigation for progressive disclosure
  const handleContentKeyDown = (e: React.KeyboardEvent) => {
    // Tab key advances to the next disclosure level
    if (e.key === 'Tab' && !e.shiftKey && level !== DisclosureLevel.Full) {
      e.preventDefault(); // Prevent default tab behavior
      incrementLevel();
      
      // Focus appropriate field based on new level
      setTimeout(() => {
        if (level === DisclosureLevel.Minimal) {
          // We're moving to Standard, focus the title field
          const titleField = document.getElementById('note-title');
          if (titleField) titleField.focus();
        } else if (level === DisclosureLevel.Standard) {
          // We're moving to Full, focus the tag input
          const tagField = document.getElementById('tag-input');
          if (tagField) tagField.focus();
        }
      }, 300); // Small delay to allow animation to start
      
      // Show hint toast
      if (level === DisclosureLevel.Minimal) {
        toast({
          title: "Title field revealed",
          description: "You can now add a title to your note.",
          variant: "default",
        });
      } else if (level === DisclosureLevel.Standard) {
        toast({
          title: "Tags and location revealed",
          description: "You can now add tags to organize your note.",
          variant: "default",
        });
      }
    }
  };
  
  // Helper to generate title from content
  const generateTitleFromContent = (text: string): string => {
    // If content is empty, use a default title
    if (!text.trim()) return "Untitled Note";
    
    // Use the first line as the title, up to 50 chars
    const firstLine = text.split('\n')[0].trim();
    
    // If first line is too short, use a default title with timestamp
    if (firstLine.length < 3) {
      return `Note ${new Date().toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
    
    // Truncate if needed
    return firstLine.length > 50 
      ? `${firstLine.substring(0, 47)}...` 
      : firstLine;
  };
  
  // Render different components based on disclosure level
  const renderHeader = () => (
    <div className="py-2 px-4 border-b border-memorylane-border flex items-center justify-end">
      <div className="flex items-center space-x-2">
        {level !== DisclosureLevel.Minimal && (
          <button 
            className="px-4 py-1.5 rounded-full bg-memorylane-border text-memorylane-textSecondary font-medium text-sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (typeof onCancel === 'function') {
                onCancel();
              }
            }}
          >
            Cancel
          </button>
        )}
        <Button 
          variant="default" 
          onClick={(e) => {
            e.preventDefault();
            handleSave();
          }} 
          className="bg-memorylane-primary hover:bg-memorylane-primaryHover text-white py-1.5 h-auto"
          type="button"
        >
          Save
        </Button>
      </div>
    </div>
  );
  
  const renderTitleField = () => (
    <div className={`transition-all duration-500 ease-in-out transform ${
      level === DisclosureLevel.Minimal 
        ? 'opacity-0 h-0 overflow-hidden translate-y-[-10px]' 
        : 'opacity-100 h-auto mb-3 translate-y-0'
    }`}>
      <input
        type="text"
        id="note-title"
        placeholder="Add title (or leave empty for AI-generated title)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-xl font-semibold bg-transparent outline-none border-none placeholder-memorylane-textTertiary py-1"
      />
    </div>
  );
  
  const renderMetadata = () => (
    level === DisclosureLevel.Full && (
      <div className="mb-6 transition-all duration-500 ease-in-out opacity-100 transform translate-y-0 max-h-[300px] overflow-hidden"
        style={{ 
          opacity: level === DisclosureLevel.Full ? 1 : 0,
          maxHeight: level === DisclosureLevel.Full ? '300px' : '0px',
        }}
      >
        {location && (
          <div className="flex items-center text-memorylane-textSecondary mb-4">
            <MapPin size={18} className="mr-2" />
            <span className="text-sm">{location}</span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <div 
              key={tag} 
              className="flex items-center bg-memorylane-tagBg text-memorylane-tagText rounded-full px-3 py-1 text-xs animate-fade-in"
            >
              <span className="text-xs text-memorylane-textSecondary">{tag}</span>
              <button 
                onClick={() => removeTag(tag)}
                className="ml-1 text-memorylane-textTertiary hover:text-memorylane-textSecondary"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          
          <div className="flex items-center bg-memorylane-bg rounded-full px-3 py-1">
            <input
              id="tag-input"
              type="text"
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleAddTag}
              className="text-xs bg-transparent outline-none w-20"
            />
            <button 
              onClick={handleAddTag}
              className="text-memorylane-textTertiary hover:text-memorylane-textSecondary"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    )
  );
  
  // Render expand/collapse button - only show when not at full disclosure
  const renderExpandButton = () => {
    // Only show button when needed (don't show at full disclosure)
    if (level === DisclosureLevel.Full) return null;
    
    return (
      <button
        onClick={incrementLevel}
        className={`mt-3 flex items-center justify-center w-full text-memorylane-textTertiary hover:text-memorylane-textSecondary transition-all duration-300 py-2 rounded-md ${
          level === DisclosureLevel.Minimal 
            ? 'bg-memorylane-bg/30 hover:bg-memorylane-bg/50' 
            : 'bg-memorylane-bg/50 hover:bg-memorylane-bg/70'
        }`}
        aria-label="Show more options"
      >
        <span className="text-xs mr-1">
          {level === DisclosureLevel.Minimal ? 'Show title field' : 'Show tags and location'}
        </span>
        <ChevronDown size={14} className="animate-pulse" />
      </button>
    );
  };
  
  // Render the disclosure indicator that shows the current level
  const renderDisclosureIndicator = () => {
    return (
      <div className="absolute bottom-3 right-3 flex items-center space-x-1.5 transition-opacity duration-300 opacity-80 hover:opacity-100">
        <div 
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            level >= DisclosureLevel.Minimal 
              ? 'bg-memorylane-primary' 
              : 'bg-gray-300'
          }`}
          title="Basic editing"
        />
        <div 
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            level >= DisclosureLevel.Standard 
              ? 'bg-memorylane-primary' 
              : 'bg-gray-300'
          }`}
          title="Add title"
        />
        <div 
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            level >= DisclosureLevel.Full 
              ? 'bg-memorylane-primary' 
              : 'bg-gray-300'
          }`}
          title="Add tags and metadata"
        />
      </div>
    );
  };

  // Dynamic background gradient based on disclosure level
  const getBackgroundGradient = () => {
    switch(level) {
      case DisclosureLevel.Minimal:
        return "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950";
      case DisclosureLevel.Standard:
        return "bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950";
      case DisclosureLevel.Full:
        return "bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-950";
      default:
        return "bg-white dark:bg-gray-900";
    }
  };
  
  return (
    <div className={`flex flex-col h-full animate-fade-in relative transition-all duration-700 ease-in-out ${getBackgroundGradient()}`}>
      {renderHeader()}
      
      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4 subtle-scroll">
        {renderTitleField()}
        
        <textarea
          id="note-content"
          placeholder={level === DisclosureLevel.Minimal ? "Start writing... (Press Tab for more options)" : "Start writing..."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleContentKeyDown}
          className="w-full min-h-[200px] text-memorylane-textPrimary text-base bg-transparent outline-none border-none resize-none placeholder-memorylane-textTertiary pt-0"
          ref={contentRef}
        />
        
        {renderMetadata()}
        {renderExpandButton()}
      </div>
      
      {renderDisclosureIndicator()}
    </div>
  );
};

export default NoteEditor;
