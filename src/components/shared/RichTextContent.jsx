import React from 'react';

export default function RichTextContent({ text }) {
  if (!text) return null;
  
  // Regular expression to match URLs
  const urlRegex = /(\bhttps?:\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
  
  // Split the text by URLs
  const parts = text.split(urlRegex);
  
  return (
    <span className="whitespace-pre-line">
      {parts.map((part, i) => {
        // Check if the part is a URL
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline break-words"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        // Regular text
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}