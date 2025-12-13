
import React from 'react';
import { Theme } from '../types';

interface Props {
  theme: Theme;
  color: string; // Used for Kirby's dynamic coloring
  expression: 'neutral' | 'happy' | 'thinking' | 'surprised' | 'inhale';
  onClick?: () => void;
}

export const GameCharacter: React.FC<Props> = ({ theme, color, expression, onClick }) => {
  const strokeColor = '#000000';
  const blushColor = 'rgba(255, 0, 0, 0.2)';
  
  // Theme specific base configurations
  let bodyColor = color; // Default to dynamic color (Kirby)
  let footColor = '#ef4444'; // Red shoes
  
  if (theme === 'MARIO') {
    bodyColor = '#fca5a5'; // Skin tone-ish / Light Red
    footColor = '#8B4513'; // Brown shoes
  } else if (theme === 'PIKACHU') {
    bodyColor = '#facc15'; // Yellow
    footColor = '#facc15'; 
  } else if (theme === 'CAT') {
    bodyColor = '#f3f4f6'; // White/Grey
    footColor = '#e5e7eb';
  } else if (theme === 'DOG') {
    bodyColor = '#d97706'; // Brown
    footColor = '#92400e';
  }

  const isInhaling = expression === 'inhale';

  return (
    <div 
      className="w-32 h-32 md:w-48 md:h-48 relative transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
      onClick={onClick}
    >
      <svg viewBox="0 0 200 200" className={`w-full h-full drop-shadow-xl ${isInhaling ? 'animate-pulse' : ''}`} style={{ overflow: 'visible' }}>
        
        {/* --- BACK LAYER (Ears/Tails) --- */}
        {theme === 'PIKACHU' && (
          <>
            {/* Left Ear */}
            <path d="M 50 60 L 20 10 L 70 40 Z" fill={bodyColor} stroke={strokeColor} strokeWidth="3" transform={isInhaling ? "rotate(-10 50 60)" : "rotate(-20 50 60)"} />
            <path d="M 20 10 L 35 20 L 40 15 Z" fill="black" /> {/* Tip */}
            {/* Right Ear */}
            <path d="M 150 60 L 180 10 L 130 40 Z" fill={bodyColor} stroke={strokeColor} strokeWidth="3" transform={isInhaling ? "rotate(10 150 60)" : "rotate(20 150 60)"} />
            <path d="M 180 10 L 165 20 L 160 15 Z" fill="black" /> {/* Tip */}
          </>
        )}
        
        {theme === 'CAT' && (
           <>
             <path d="M 40 80 L 30 30 L 90 60 Z" fill={bodyColor} stroke={strokeColor} strokeWidth="3" />
             <path d="M 160 80 L 170 30 L 110 60 Z" fill={bodyColor} stroke={strokeColor} strokeWidth="3" />
           </>
        )}

        {theme === 'DOG' && (
           <>
             <ellipse cx="30" cy="100" rx="20" ry="40" fill={bodyColor} stroke={strokeColor} strokeWidth="3" transform="rotate(-20)" />
             <ellipse cx="170" cy="100" rx="20" ry="40" fill={bodyColor} stroke={strokeColor} strokeWidth="3" transform="rotate(20)" />
           </>
        )}

        {/* --- BODY --- */}
        
        {/* Feet */}
        <ellipse cx="60" cy="170" rx="30" ry="18" fill={footColor} stroke={strokeColor} strokeWidth="3" />
        <ellipse cx="140" cy="170" rx="30" ry="18" fill={footColor} stroke={strokeColor} strokeWidth="3" />
        
        {/* Main Circle */}
        <circle cx="100" cy="100" r="75" fill={bodyColor} stroke={strokeColor} strokeWidth="3" />

        {/* --- THEME SPECIFIC BODY DETAILS (Hats, etc) --- */}

        {theme === 'KIRBY' && (
            <>
               {/* Blue Cap Dome - Raised ~15px (y=65 -> y=50) */}
               <path d="M 35 50 Q 100 0 165 50" fill="#3b82f6" stroke={strokeColor} strokeWidth="3" />
               {/* Cap Brim - Raised ~15px */}
               <path d="M 30 50 Q 100 80 170 50 Q 100 40 30 50 Z" fill="#60a5fa" stroke={strokeColor} strokeWidth="3" />
               {/* White Badge - Raised */}
               <circle cx="100" cy="30" r="11" fill="white" stroke={strokeColor} strokeWidth="2" />
               {/* Kanji 'Kan' - Raised */}
               <text x="100" y="35" fontSize="10" textAnchor="middle" fill="#3b82f6" fontWeight="900" style={{fontFamily: 'sans-serif'}} dy=".3em">漢</text>
            </>
        )}
        
        {theme === 'MARIO' && (
            <>
               {/* Hat - moved even higher up (approx -15px from previous) */}
               <path d="M 25 50 C 25 0, 175 0, 175 50" fill="#ef4444" stroke={strokeColor} strokeWidth="3" />
               <path d="M 20 50 L 180 50 L 180 60 Q 100 70 20 60 Z" fill="#ef4444" stroke={strokeColor} strokeWidth="3" />
               <circle cx="100" cy="30" r="15" fill="white" />
               <text x="100" y="38" fontSize="20" textAnchor="middle" fill="#ef4444" fontWeight="bold">M</text>
            </>
        )}

        {/* --- ARMS --- */}
        {isInhaling ? (
             <>
                <ellipse cx="25" cy="80" rx="20" ry="15" fill={bodyColor} stroke={strokeColor} strokeWidth="3" transform="rotate(-40, 25, 80)" />
                <ellipse cx="175" cy="80" rx="20" ry="15" fill={bodyColor} stroke={strokeColor} strokeWidth="3" transform="rotate(40, 175, 80)" />
             </>
        ) : (
            <>
                <ellipse cx="30" cy="90" rx="20" ry="15" fill={bodyColor} stroke={strokeColor} strokeWidth="3" transform="rotate(-20, 30, 90)" />
                <ellipse cx="170" cy="90" rx="20" ry="15" fill={bodyColor} stroke={strokeColor} strokeWidth="3" transform="rotate(20, 170, 90)" />
            </>
        )}

        {/* --- FACE --- */}

        {/* Cheeks */}
        {expression !== 'inhale' && (
            <>
                <ellipse cx="60" cy="110" rx="12" ry="6" fill={theme === 'PIKACHU' ? '#ef4444' : blushColor} opacity={theme === 'PIKACHU' ? 1 : 1} />
                <ellipse cx="140" cy="110" rx="12" ry="6" fill={theme === 'PIKACHU' ? '#ef4444' : blushColor} opacity={theme === 'PIKACHU' ? 1 : 1} />
            </>
        )}

        {/* Whiskers for Cat */}
        {theme === 'CAT' && (
            <>
                <path d="M 150 100 L 190 90" stroke={strokeColor} strokeWidth="2" />
                <path d="M 150 110 L 190 110" stroke={strokeColor} strokeWidth="2" />
                <path d="M 150 120 L 190 130" stroke={strokeColor} strokeWidth="2" />
                
                <path d="M 50 100 L 10 90" stroke={strokeColor} strokeWidth="2" />
                <path d="M 50 110 L 10 110" stroke={strokeColor} strokeWidth="2" />
                <path d="M 50 120 L 10 130" stroke={strokeColor} strokeWidth="2" />
            </>
        )}

        {/* Eyes & Mouth Logic */}
        
        {/* EYES */}
        {expression === 'neutral' || expression === 'happy' ? (
             <>
                <ellipse cx="75" cy="90" rx="6" ry="12" fill="black" />
                <ellipse cx="75" cy="86" rx="3" ry="5" fill="white" />
                <ellipse cx="125" cy="90" rx="6" ry="12" fill="black" />
                <ellipse cx="125" cy="86" rx="3" ry="5" fill="white" />
             </>
        ) : expression === 'thinking' ? (
             <>
                <ellipse cx="75" cy="90" rx="6" ry="12" fill="black" />
                <path d="M 115 90 L 135 90" stroke="black" strokeWidth="3" /> {/* Wink */}
             </>
        ) : expression === 'surprised' ? (
             <>
                <circle cx="75" cy="90" r="8" fill="black" />
                <circle cx="125" cy="90" r="8" fill="black" />
             </>
        ) : (
            // Inhale Eyes
             <>
                 <path d="M 60 80 L 80 90" stroke="black" strokeWidth="3" />
                 <path d="M 140 80 L 120 90" stroke="black" strokeWidth="3" />
             </>
        )}

        {/* NOSE (Dog/Mario) */}
        {theme === 'DOG' && <circle cx="100" cy="105" r="8" fill="black" />}
        {theme === 'MARIO' && <ellipse cx="100" cy="105" rx="10" ry="8" fill="#fca5a5" stroke={strokeColor} strokeWidth="1" />}

        {/* MUSTACHE (Mario) */}
        {theme === 'MARIO' && (
             <path d="M 70 115 Q 100 105 130 115 Q 130 125 100 120 Q 70 125 70 115" fill="black" />
        )}

        {/* MOUTH */}
        {isInhaling ? (
            <>
             <ellipse cx="100" cy="110" rx="35" ry="30" fill="black" />
             <path d="M 85 110 L 70 110" stroke="white" strokeWidth="2" opacity="0.5" />
             <path d="M 115 110 L 130 110" stroke="white" strokeWidth="2" opacity="0.5" />
            </>
        ) : (
           <>
              {expression === 'neutral' && <path d="M 95 120 Q 100 125 105 120" stroke="black" strokeWidth="2" fill="none" />}
              {expression === 'happy' && <path d="M 85 115 Q 100 140 115 115 Z" fill="#991b1b" />}
              {expression === 'surprised' && <circle cx="100" cy="130" r="10" fill="black" />}
              {expression === 'thinking' && <circle cx="100" cy="130" r="5" fill="black" />}
           </>
        )}

      </svg>
    </div>
  );
};
