import React from 'react';
import { MapPin } from 'lucide-react';
import { Note } from '@/context/NoteContext';
import { getRelativeTimeString } from '@/utils/dateUtils';
import FormattedContent from './FormattedContent';

interface NoteCardProps {
  note: Note;
  onClick: (note: Note) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
  const { title, content, createdAt, location } = note;
  
  // Truncate content for preview
  const contentPreview = content.length > 120 ? 
    `${content.substring(0, 120)}...` : 
    content;
  
  // Use the title or generate one from content
  const displayTitle = title || (content.length > 25 ? 
    `${content.substring(0, 25)}...` : 
    content);
  
  return (
    <div 
      className="note-card p-4 mb-4 animate-fade-in cursor-pointer active:animate-scale-out" 
      onClick={() => onClick(note)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-memorylane-textPrimary text-base">
          {displayTitle}
        </h3>
        <span className="text-xs text-memorylane-textTertiary">
          {getRelativeTimeString(createdAt)}
        </span>
      </div>
      
      <FormattedContent 
        content={contentPreview} 
        className="text-memorylane-textSecondary text-sm mb-3"
      />
      
      {location && (
        <div className="flex items-center">
          <MapPin size={14} className="text-memorylane-textTertiary mr-1" />
          <span className="text-xs text-memorylane-textTertiary">
            {location.name}
          </span>
        </div>
      )}
    </div>
  );
};

export default NoteCard;
