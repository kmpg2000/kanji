
import React from 'react';

interface Props {
  color: string;
  expression: 'neutral' | 'happy' | 'thinking' | 'surprised' | 'inhale';
  onClick?: () => void;
}

export const KirbyCharacter: React.FC<Props> = ({ color, expression, onClick }) => {
  // Simple color adaptation for darker strokes
  const strokeColor = '#000000';
  const blushColor = 'rgba(255, 0, 0, 0.2)';
  const footColor = '#ef4444'; // Red shoes usually

  return (
    <div 
      className="w-32 h-32 md:w-48 md:h-48 relative transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
      onClick={onClick}
    >
      <svg viewBox="0 0 200 200" className={`w-full h-full drop-shadow-xl ${expression === 'inhale' ? 'animate-pulse' : ''}`}>
        {/* Left Foot */}
        <ellipse cx="60" cy="170" rx="30" ry="18" fill={footColor} stroke={strokeColor} strokeWidth="3" />
        {/* Right Foot */}
        <ellipse cx="140" cy="170" rx="30" ry="18" fill={footColor} stroke={strokeColor} strokeWidth="3" />
        
        {/* Body */}
        <circle cx="100" cy="100" r="75" fill={color} stroke={strokeColor} strokeWidth="3" />
        
        {/* Arms */}
        {expression === 'inhale' ? (
             <>
                <ellipse cx="25" cy="80" rx="20" ry="15" fill={color} stroke={strokeColor} strokeWidth="3" transform="rotate(-40, 25, 80)" />
                <ellipse cx="175" cy="80" rx="20" ry="15" fill={color} stroke={strokeColor} strokeWidth="3" transform="rotate(40, 175, 80)" />
             </>
        ) : (
            <>
                <ellipse cx="30" cy="90" rx="20" ry="15" fill={color} stroke={strokeColor} strokeWidth="3" transform="rotate(-20, 30, 90)" />
                <ellipse cx="170" cy="90" rx="20" ry="15" fill={color} stroke={strokeColor} strokeWidth="3" transform="rotate(20, 170, 90)" />
            </>
        )}

        {/* Blush */}
        {expression !== 'inhale' && (
            <>
                <ellipse cx="60" cy="110" rx="12" ry="6" fill={blushColor} />
                <ellipse cx="140" cy="110" rx="12" ry="6" fill={blushColor} />
            </>
        )}

        {/* Eyes & Mouth based on expression */}
        {expression === 'neutral' && (
          <>
            <ellipse cx="75" cy="80" rx="6" ry="12" fill="black" />
            <ellipse cx="75" cy="76" rx="3" ry="5" fill="white" />
            <ellipse cx="125" cy="80" rx="6" ry="12" fill="black" />
            <ellipse cx="125" cy="76" rx="3" ry="5" fill="white" />
            <path d="M 95 120 Q 100 125 105 120" stroke="black" strokeWidth="2" fill="none" />
          </>
        )}

        {expression === 'happy' && (
          <>
            <path d="M 65 80 Q 75 70 85 80" stroke="black" strokeWidth="3" fill="none" />
            <path d="M 115 80 Q 125 70 135 80" stroke="black" strokeWidth="3" fill="none" />
            <path d="M 85 115 Q 100 140 115 115 Z" fill="#991b1b" />
          </>
        )}

        {expression === 'thinking' && (
          <>
            <ellipse cx="75" cy="80" rx="6" ry="12" fill="black" />
             {/* Winking/Thinking eye */}
            <path d="M 115 80 L 135 80" stroke="black" strokeWidth="3" />
            <circle cx="100" cy="120" r="5" fill="black" />
          </>
        )}
        
        {expression === 'surprised' && (
          <>
            <circle cx="75" cy="80" r="8" fill="black" />
            <circle cx="125" cy="80" r="8" fill="black" />
            <circle cx="100" cy="120" r="10" fill="black" />
          </>
        )}

        {expression === 'inhale' && (
          <>
             {/* Wide open mouth */}
             <ellipse cx="100" cy="100" rx="35" ry="30" fill="black" />
             {/* Focused eyes */}
             <path d="M 60 70 L 80 80" stroke="black" strokeWidth="3" />
             <path d="M 140 70 L 120 80" stroke="black" strokeWidth="3" />
             
             {/* Wind lines (simple representation) */}
             <path d="M 85 100 L 70 100" stroke="white" strokeWidth="2" opacity="0.5" />
             <path d="M 115 100 L 130 100" stroke="white" strokeWidth="2" opacity="0.5" />
          </>
        )}
      </svg>
    </div>
  );
};
