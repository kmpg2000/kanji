import React, { useEffect } from 'react';
import { GameCharacter } from './GameCharacter';
import { audio } from '../services/audioService';
import { Theme } from '../types';

interface Props {
  message: string;
  theme: Theme;
  color: string;
  onClose: () => void;
}

export const MilestoneModal: React.FC<Props> = ({ message, theme, color, onClose }) => {
  useEffect(() => {
    audio.playMilestone();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full border-4 border-yellow-400 shadow-[0_10px_0_rgba(0,0,0,0.2)] animate-bounce-slow text-center relative overflow-hidden">
        
        {/* Decor */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-200 to-transparent" />

        <h2 className="text-3xl font-cute text-yellow-500 mb-6 drop-shadow-md">LEVEL UP!</h2>
        
        <div className="flex justify-center mb-6">
           <GameCharacter theme={theme} color={color} expression="happy" />
        </div>

        <p className="text-2xl font-bold text-gray-700 mb-8">{message}</p>
        
        <button
          onClick={() => {
            audio.playSelect();
            onClose();
          }}
          className="w-full bg-pink-500 hover:bg-pink-400 text-white font-bold py-4 px-6 rounded-2xl shadow-[0_6px_0_#9d174d] active:shadow-[0_2px_0_#9d174d] active:translate-y-1 transition-all text-xl"
        >
          つぎへ Go!
        </button>
      </div>
    </div>
  );
};