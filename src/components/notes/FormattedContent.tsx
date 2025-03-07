import React from 'react';

interface FormattedContentProps {
  content: string;
  className?: string;
}

const FormattedContent: React.FC<FormattedContentProps> = ({ content, className = '' }) => {
  // Parse and format the content
  const parseFormattedContent = (text: string): string => {
    // Replace markdown-style formatting with HTML
    let formattedText = text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Underline
      .replace(/_(.*?)_/g, '<u>$1</u>')
      // Bullet lists
      .replace(/^\* (.*?)$/gm, '<li>$1</li>')
      // Numbered lists
      .replace(/^\d+\. (.*?)$/gm, '<li>$1</li>')
      // Alignment blocks
      .replace(/^::: (left|center|right)\n([\s\S]*?)\n:::/gm, (_, align, content) => {
        return `<div style="text-align: ${align}">${content}</div>`;
      });
    
    // Wrap lists in ul/ol tags
    formattedText = formattedText
      .replace(/<li>(.*?)<\/li>/g, (match) => {
        if (match.includes('* ')) {
          return `<ul>${match}</ul>`;
        } else {
          return `<ol>${match}</ol>`;
        }
      });
    
    return formattedText;
  };

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: parseFormattedContent(content) }}
    />
  );
};

export default FormattedContent; 