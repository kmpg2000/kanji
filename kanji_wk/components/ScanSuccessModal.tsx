
import React, { useEffect } from 'react';
import { GameCharacter } from './GameCharacter';
import { audio } from '../services/audioService';
import { Theme } from '../types';

interface Props {
  count: number;
  theme: Theme;
  color: string;
  onStart: () => void;
  onCancel: () => void;
}

export const ScanSuccessModal: React.FC<Props> = ({ count, theme, color, onStart, onCancel }) => {
  useEffect(() => {
    audio.playMilestone();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full border-4 border-green-400 shadow-[0_10px_0_rgba(0,0,0,0.2)] animate-bounce-slow text-center relative overflow-hidden">
        
        {/* Decor */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-200 to-transparent" />

        <h2 className="text-2xl md:text-3xl font-cute text-green-500 mb-4 drop-shadow-md">よみこみ かんりょう！</h2>
        
        <div className="flex justify-center mb-4">
           <GameCharacter theme={theme} color={color} expression="happy" />
        </div>

        <p className="text-xl font-bold text-gray-700 mb-2">
            AIが <span className="text-3xl text-pink-500">{count}</span> もん の<br/>
            もんだい を つくったよ！
        </p>
        <p className="text-sm font-bold text-gray-400 mb-8">
            さっそく あそんでみる？
        </p>
        
        <div className="space-y-3">
            <button
            onClick={() => {
                audio.playSelect();
                onStart();
            }}
            className="w-full bg-pink-500 hover:bg-pink-400 text-white font-bold py-4 px-6 rounded-2xl shadow-[0_6px_0_#9d174d] active:shadow-[0_2px_0_#9d174d] active:translate-y-1 transition-all text-xl"
            >
            あそぶ！ (Start)
            </button>
            
            <button
            onClick={() => {
                audio.playSelect();
                onCancel();
            }}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-500 font-bold py-3 px-6 rounded-2xl transition-all text-sm"
            >
            やめる (Cancel)
            </button>
        </div>
      </div>
    </div>
  );
};
