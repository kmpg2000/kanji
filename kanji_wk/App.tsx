
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GameState, GameMode, KanjiProblem, PlayerStats, Theme } from './types';
import { KIRBY_COLORS, ENCOURAGEMENTS } from './constants';
import { problems as problemData } from './problems';
import { GameCharacter } from './components/GameCharacter';
import { MilestoneModal } from './components/MilestoneModal';
import { ScanSuccessModal } from './components/ScanSuccessModal';
import { audio } from './services/audioService';
import { generateQuizFromImage } from './services/geminiService';

// Extended type for internal game state including the mode for each question
interface GameQuestion extends KanjiProblem {
  mode: GameMode;
}

const MAX_HP = 5;
const TIME_LIMIT = 15;

const App: React.FC = () => {
  // Game State
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  
  // Theme State
  const [theme, setTheme] = useState<Theme>('KIRBY');
  const [kirbyColorIndex, setKirbyColorIndex] = useState(0);
  
  const [stats, setStats] = useState<PlayerStats>({ score: 0, streak: 0, totalAnswered: 0, correctCount: 0, hp: MAX_HP });
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [lastMilestoneSeen, setLastMilestoneSeen] = useState(0);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);

  // Animation states
  const [isInhaling, setIsInhaling] = useState(false);
  const [manualExpression, setManualExpression] = useState<'neutral' | 'happy' | 'thinking' | 'surprised' | null>(null);
  const [flyingText, setFlyingText] = useState<string | null>(null);
  const [currentEncouragement, setCurrentEncouragement] = useState<string>("");
  
  // Settings / API
  const [apiKey] = useState(process.env.API_KEY || '');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedProblems, setScannedProblems] = useState<KanjiProblem[] | null>(null);
  
  // Visit Count
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    try {
        const stored = localStorage.getItem('site_visit_count');
        const count = stored ? parseInt(stored, 10) : 0;
        const newCount = count + 1;
        setVisitCount(newCount);
        localStorage.setItem('site_visit_count', newCount.toString());
    } catch (e) {
        console.error("Local storage access failed", e);
    }
  }, []);

  // Sync theme with audio service
  useEffect(() => {
    audio.setTheme(theme);
  }, [theme]);

  // Computed properties for the current question
  const currentQuestion = questions[currentProblemIndex];
  
  // Reset timer when question changes
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
        setTimeLeft(TIME_LIMIT);
    }
  }, [currentProblemIndex, gameState]);

  // Timer Countdown logic
  useEffect(() => {
    if (gameState === GameState.PLAYING && !isInhaling && lastAnswerCorrect === null && timeLeft > 0) {
      const timerId = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && gameState === GameState.PLAYING && !isInhaling && lastAnswerCorrect === null) {
      handleAnswer(null); // Trigger timeout
    }
  }, [timeLeft, gameState, isInhaling, lastAnswerCorrect]);

  // Memoize shuffled options
  const options = useMemo(() => {
    if (!currentQuestion) return [];
    
    let correct = "";
    let wrongs: string[] = [];

    if (currentQuestion.mode === GameMode.READING_TO_KANJI) {
      correct = currentQuestion.target;
      wrongs = currentQuestion.distractors; 
    } else {
      correct = currentQuestion.reading;
      const isKanji = (s: string) => /[\u4e00-\u9faf]/.test(s);
      
      if (currentQuestion.distractors.length > 0 && isKanji(currentQuestion.distractors[0])) {
         const r = currentQuestion.reading;
         const endings = ['い', 'う', 'ん', 'つ', 'ち'];
         const fake1 = r.length > 1 ? r.substring(0, r.length - 1) + endings[Math.floor(Math.random() * endings.length)] : r + "い";
         const fake2 = "お" + r;
         const fake3 = r.split('').reverse().join('');
         
         const set = new Set([fake1, fake2, fake3]);
         set.delete(r);
         while(set.size < 3) {
            set.add(r + endings[Math.floor(Math.random() * endings.length)]);
         }
         wrongs = Array.from(set).slice(0, 3);
      } else {
         wrongs = currentQuestion.distractors;
      }
    }

    const all = [correct, ...wrongs.slice(0, 3)];
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }, [currentQuestion]);

  // Change milestone frequency from 5 to 10
  const currentMilestoneTarget = stats.totalAnswered > 0 && stats.totalAnswered % 10 === 0 ? stats.totalAnswered : 0;
  const isMilestone = currentMilestoneTarget > 0 && 
                      currentMilestoneTarget > lastMilestoneSeen && 
                      gameState === GameState.PLAYING && 
                      lastAnswerCorrect === null &&
                      !isInhaling;

  useEffect(() => {
    if (isMilestone) {
      setGameState(GameState.MILESTONE);
      setLastMilestoneSeen(currentMilestoneTarget);
      if (theme === 'KIRBY') {
        setKirbyColorIndex(prev => (prev + 1) % KIRBY_COLORS.length);
      }
    }
  }, [isMilestone, currentMilestoneTarget, gameState, theme]);


  const handleStart = (rawProblems: KanjiProblem[] = problemData) => {
    if (isScanning) return;
    audio.playSelect();
    
    const shuffled: GameQuestion[] = [...rawProblems]
      .sort(() => 0.5 - Math.random())
      .map(p => ({
        ...p,
        mode: Math.random() > 0.5 ? GameMode.READING_TO_KANJI : GameMode.KANJI_TO_READING
      }));

    setQuestions(shuffled);
    setGameState(GameState.PLAYING);
    setCurrentProblemIndex(0);
    setStats({ score: 0, streak: 0, totalAnswered: 0, correctCount: 0, hp: MAX_HP });
    setKirbyColorIndex(0);
    setLastAnswerCorrect(null);
    setLastMilestoneSeen(0);
    setIsInhaling(false);
    setFlyingText(null);
    setTimeLeft(TIME_LIMIT);
    setCurrentEncouragement("");
  };

  const handleScanStart = () => {
    if (scannedProblems) {
        handleStart(scannedProblems);
        setScannedProblems(null);
    }
  };

  const handleAnswer = (answer: string | null) => {
    if (lastAnswerCorrect !== null || isInhaling) return; 

    const correct = currentQuestion.mode === GameMode.READING_TO_KANJI ? currentQuestion.target : currentQuestion.reading;
    const isCorrect = answer === correct;

    if (isCorrect) {
      setFlyingText(answer); // Set text to fly
      setCurrentEncouragement(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
      setIsInhaling(true);
      setManualExpression(null); // Reset manual expression
      audio.playInhale();
      
      setTimeout(() => {
          setIsInhaling(false);
          setFlyingText(null);
          setLastAnswerCorrect(true);
          audio.playCorrect();
          
          setStats(prev => ({
            ...prev,
            score: prev.score + 100 + (prev.streak * 10),
            streak: prev.streak + 1,
            totalAnswered: prev.totalAnswered + 1,
            correctCount: prev.correctCount + 1
          }));

          setTimeout(() => {
             proceedToNext();
          }, 1500);

      }, 600); 

    } else {
      // Wrong answer or timeout
      audio.playWrong();
      setLastAnswerCorrect(false);
      setManualExpression(null); // Reset manual expression
      setCurrentEncouragement(""); // Clear encouragement on wrong answer
      
      const newHp = stats.hp - 1;

      setStats(prev => ({
        ...prev,
        streak: 0,
        totalAnswered: prev.totalAnswered + 1,
        hp: newHp
      }));

      setTimeout(() => {
        if (newHp <= 0) {
            setGameState(GameState.GAME_OVER);
        } else {
            proceedToNext();
        }
      }, 1500);
    }
  };

  const proceedToNext = () => {
      setLastAnswerCorrect(null);
      if (currentProblemIndex < questions.length - 1) {
          setCurrentProblemIndex(prev => prev + 1);
      } else {
        setGameState(GameState.GAME_OVER);
      }
  };

  const handleMilestoneClose = () => {
    setGameState(GameState.PLAYING);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (files.length > 4) {
        setScanError("写真は 4枚 までにしてね！");
        e.target.value = ''; // Reset selection
        return;
    }

    if (!apiKey) {
        alert("Please set your API Key in the environment.");
        return;
    }

    setIsScanning(true);
    setScanError(null);

    try {
        // Read all files as base64
        const readPromises = Array.from(files).map((file: File) => {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    // Remove "data:image/jpeg;base64," prefix
                    resolve(result.split(',')[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        const base64Images = await Promise.all(readPromises);

        try {
            const newProblems = await generateQuizFromImage(base64Images, apiKey);
            if (newProblems.length > 0) {
                setScannedProblems(newProblems);
            } else {
                setScanError("もんだい が みつからなかったよ...");
            }
        } catch (err) {
            console.error(err);
            setScanError("がぞう の よみこみ に しっぱい したよ...");
        }
    } catch (error) {
        console.error(error);
        setScanError("ファイルの 読み込み エラーだよ");
    } finally {
        setIsScanning(false);
        e.target.value = ''; // Reset input
    }
  };
  
  const handleKirbyClick = () => {
      audio.playSelect();
      const poses: ('neutral' | 'happy' | 'thinking' | 'surprised')[] = ['neutral', 'happy', 'thinking', 'surprised'];
      const next = poses[Math.floor(Math.random() * poses.length)];
      setManualExpression(next);
  };

  // Determine current expression
  const characterExpression = useMemo(() => {
      if (isInhaling) return 'inhale';
      if (lastAnswerCorrect === true) return 'happy';
      if (lastAnswerCorrect === false) return 'surprised';
      if (manualExpression) return manualExpression;
      if (stats.hp === 1) return 'surprised'; // Worried when low HP
      return 'neutral';
  }, [isInhaling, lastAnswerCorrect, manualExpression, stats.hp]);

  // Theme Helpers
  const getThemeStyles = () => {
    switch(theme) {
        case 'MARIO': return { bg: 'bg-red-50', text: 'text-red-500', button: 'bg-red-500 hover:bg-red-400', shadow: 'shadow-[0_8px_0_#991b1b]' };
        case 'PIKACHU': return { bg: 'bg-yellow-50', text: 'text-yellow-600', button: 'bg-yellow-400 hover:bg-yellow-300', shadow: 'shadow-[0_8px_0_#ca8a04]' };
        case 'CAT': return { bg: 'bg-blue-50', text: 'text-blue-500', button: 'bg-blue-400 hover:bg-blue-300', shadow: 'shadow-[0_8px_0_#1e40af]' };
        case 'DOG': return { bg: 'bg-orange-50', text: 'text-orange-500', button: 'bg-orange-400 hover:bg-orange-300', shadow: 'shadow-[0_8px_0_#9a3412]' };
        default: return { bg: 'bg-pink-50', text: 'text-pink-500', button: 'bg-pink-400 hover:bg-pink-300', shadow: 'shadow-[0_8px_0_#be185d]' };
    }
  };
  const themeStyles = getThemeStyles();

  // --- RENDERERS ---

  const renderMenu = () => (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 space-y-6 max-w-lg mx-auto relative overflow-hidden transition-colors duration-500 ${themeStyles.bg}`}>
      
      {/* Visit Count */}
      <div className="absolute top-4 left-4 bg-white/50 px-3 py-1 rounded-full text-xs font-bold text-gray-500 backdrop-blur-sm border border-white/60">
        訪問者数: {visitCount}
      </div>

      <div className="text-center z-10 mt-4">
        <h1 className={`text-5xl md:text-6xl font-cute drop-shadow-md leading-tight mb-2 ${themeStyles.text}`}>
            漢字<br/>吸い込み<br/><span className="text-6xl text-yellow-500 text-stroke-white">大作戦</span>
        </h1>
      </div>
      
      <div className="relative cursor-pointer" onClick={handleKirbyClick}>
          <GameCharacter theme={theme} color={KIRBY_COLORS[0]} expression={manualExpression || 'happy'} />
      </div>

      {/* Theme Selector */}
      <div className="bg-white/60 p-4 rounded-2xl w-full">
          <p className="text-center font-bold text-gray-500 mb-2">キャラクターをえらんでね！</p>
          <div className="flex justify-center gap-3 flex-wrap">
              {(['KIRBY', 'MARIO', 'PIKACHU', 'CAT', 'DOG'] as Theme[]).map(t => (
                  <button 
                    key={t}
                    onClick={() => { 
                        setTheme(t); 
                        setTimeout(() => audio.playSelect(), 50);
                    }}
                    disabled={isScanning}
                    className={`w-12 h-12 rounded-full border-4 flex items-center justify-center shadow-md transition-transform transform hover:scale-110 ${theme === t ? 'border-yellow-400 scale-110 ring-2 ring-yellow-200' : 'border-white opacity-70'} ${isScanning ? 'opacity-30 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: t === 'KIRBY' ? '#f9a8d4' : t === 'MARIO' ? '#ef4444' : t === 'PIKACHU' ? '#facc15' : t === 'CAT' ? '#e5e7eb' : '#d97706' }}
                  >
                      {t === theme && <span className="text-white font-bold">✓</span>}
                  </button>
              ))}
          </div>
      </div>

      <div className="w-full space-y-4 z-10">
        <button 
          onClick={() => handleStart()}
          disabled={isScanning}
          className={`w-full text-white text-3xl font-bold py-6 rounded-full transition-all flex items-center justify-center gap-2 
            ${isScanning 
                ? 'opacity-50 cursor-not-allowed grayscale bg-gray-400 shadow-none' 
                : `active:translate-y-2 active:shadow-none transform hover:scale-105 ${themeStyles.button} ${themeStyles.shadow}`
            }`}
        >
           {isScanning ? (
               <span className="text-xl">AI解析中... まっててね</span>
           ) : (
               <><span className="animate-pulse">★</span> スタート！ <span className="animate-pulse">★</span></>
           )}
        </button>
      </div>

      {/* Settings / Upload */}
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl w-full border-4 border-gray-200 z-10">
        <h3 className="font-bold text-gray-500 mb-3 text-center">もんだい の 設定</h3>
        <label className={`block w-full cursor-pointer rounded-2xl transition-all shadow-[0_4px_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none text-center p-3
            ${isScanning ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-400 hover:bg-blue-300 text-white'}`}>
           {isScanning ? (
               <div className="flex items-center justify-center gap-2">
                   <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                   <span className="font-bold">読み込み中...</span>
               </div>
           ) : (
               <>
                    <span className="font-bold block text-lg">
                        📷 プリントを読み込む (4枚まで)
                    </span>
                    <input 
                        type="file" 
                        accept="image/*" 
                        multiple
                        className="hidden" 
                        onChange={handleFileUpload}
                        disabled={isScanning}
                    />
               </>
           )}
        </label>
        {scanError && (
            <p className="text-red-500 font-bold text-center mt-2 text-sm animate-bounce">
                {scanError}
            </p>
        )}
      </div>

      {/* Background Decors */}
      <div className="absolute top-10 left-[-20px] w-24 h-24 rounded-full bg-white opacity-20 animate-bounce-slow" />
      <div className="absolute bottom-20 right-[-10px] w-32 h-32 rounded-full bg-white opacity-20 animate-bounce-slow" style={{ animationDelay: '1s' }} />
    </div>
  );

  const renderGame = () => {
      if (!currentQuestion) return null;

      // Calculate timer percentage
      const timerPercent = (timeLeft / TIME_LIMIT) * 100;
      let timerColor = 'bg-green-400';
      if (timerPercent < 50) timerColor = 'bg-yellow-400';
      if (timerPercent < 20) timerColor = 'bg-red-400';

      return (
        <div className={`flex flex-col min-h-screen p-4 max-w-lg mx-auto relative ${themeStyles.bg}`}>
            {/* Quit Button */}
            <div className="flex justify-start w-full mb-2">
                 <button 
                    onClick={() => {
                        audio.playSelect();
                        setGameState(GameState.MENU);
                    }}
                    className="bg-white/50 hover:bg-white text-gray-500 hover:text-red-500 text-xs font-bold py-2 px-4 rounded-full transition-all backdrop-blur-sm border-2 border-white/50"
                 >
                    ← やめる
                 </button>
            </div>

            {/* Header: Score & HP */}
            <div className="flex justify-between items-center bg-white/60 backdrop-blur-md p-3 rounded-2xl mb-4 shadow-sm border-2 border-white">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400">SCORE</span>
                    <span className={`text-2xl font-black ${themeStyles.text}`}>{stats.score}</span>
                </div>
                
                {/* HP Display */}
                <div className="flex gap-1">
                    {[...Array(MAX_HP)].map((_, i) => (
                        <span key={i} className={`text-2xl transition-all ${i < stats.hp ? 'scale-100' : 'scale-75 opacity-30 grayscale'}`}>
                            {i < stats.hp ? '❤️' : '💔'}
                        </span>
                    ))}
                </div>
            </div>

            {/* Timer Bar */}
            <div className="w-full bg-gray-200 h-4 rounded-full mb-6 overflow-hidden border-2 border-white shadow-inner">
                <div 
                    className={`h-full transition-all duration-1000 ease-linear ${timerColor}`} 
                    style={{ width: `${timerPercent}%` }}
                />
            </div>

            {/* Question Card */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                <div className="bg-white rounded-3xl p-8 shadow-[0_8px_0_rgba(0,0,0,0.1)] w-full mb-8 text-center relative border-4 border-white">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                         もんだい {stats.totalAnswered + 1}
                    </div>
                    
                    <p className="text-2xl md:text-3xl font-bold text-gray-700 leading-relaxed mb-4">
                        {currentQuestion.sentence.split('___').map((part, i, arr) => (
                            <React.Fragment key={i}>
                                {part}
                                {i < arr.length - 1 && (
                                    <span className="inline-block border-b-4 border-dashed border-gray-400 mx-2 min-w-[3rem] text-center text-gray-300">?</span>
                                )}
                            </React.Fragment>
                        ))}
                    </p>
                    
                    <p className="text-lg font-bold text-gray-400">
                        {currentQuestion.mode === GameMode.READING_TO_KANJI 
                            ? `「${currentQuestion.reading}」は どれ？` 
                            : `「${currentQuestion.target}」の よみかた は？`
                        }
                    </p>
                </div>

                {/* Character Interaction Area */}
                <div className="relative mb-8 h-48 w-48 flex items-center justify-center group">
                    {/* Flying text animation */}
                    {flyingText && (
                         <div className={`absolute z-20 text-4xl font-black text-white stroke-black text-stroke-2 animate-ping ${isInhaling ? 'scale-0 transition-transform duration-500' : ''}`}>
                             {flyingText}
                         </div>
                    )}
                    
                    {/* Encouragement Bubble (Correct Answer) */}
                    {lastAnswerCorrect === true && currentEncouragement && (
                        <div className="absolute -top-16 -right-24 md:-right-32 bg-white rounded-2xl p-4 shadow-xl border-4 border-yellow-400 transform rotate-6 z-30 animate-bounce text-center min-w-[140px]">
                            <p className="text-lg md:text-xl font-cute text-pink-500 leading-tight">{currentEncouragement}</p>
                            <div className="absolute left-0 bottom-[-10px] w-6 h-6 bg-white border-r-4 border-b-4 border-yellow-400 transform rotate-45 translate-x-4"></div>
                        </div>
                    )}

                    {/* "Click Me if Tired" Bubble (Interactive Hint) */}
                    {!isInhaling && lastAnswerCorrect !== true && (
                        <div className="absolute -bottom-4 -right-24 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg border-2 border-gray-200 transform -rotate-3 transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none z-20 w-36">
                             <p className="text-xs text-gray-500 text-center font-bold">
                                疲れたら<br/>私をクリックしてね！
                             </p>
                             <div className="absolute -left-2 top-1/2 w-4 h-4 bg-white border-l-2 border-b-2 border-gray-200 transform rotate-45 -translate-y-1/2"></div>
                        </div>
                    )}
                    
                    <div 
                        className={`transition-transform duration-500 cursor-pointer ${isInhaling ? 'scale-110' : ''}`}
                        onClick={handleKirbyClick}
                    >
                        <GameCharacter 
                            theme={theme}
                            color={KIRBY_COLORS[kirbyColorIndex]} 
                            expression={characterExpression} 
                        />
                    </div>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-2 gap-4 w-full">
                    {options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(option)}
                            disabled={lastAnswerCorrect !== null || isInhaling}
                            className={`
                                relative py-4 px-2 rounded-xl text-xl font-bold shadow-[0_4px_0_rgba(0,0,0,0.1)] transition-all transform flex items-center justify-center
                                ${lastAnswerCorrect !== null 
                                    ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' 
                                    : 'bg-white hover:bg-yellow-50 active:translate-y-1 active:shadow-none hover:scale-105 text-gray-700'
                                }
                            `}
                        >
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg font-black text-gray-300">
                                {['A', 'B', 'C', 'D'][idx]}
                            </span>
                            <span>{option}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      );
  };

  const renderGameOver = () => (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 text-center max-w-lg mx-auto ${themeStyles.bg}`}>
        <div className="bg-white rounded-3xl p-8 shadow-xl w-full border-4 border-gray-100">
            <h2 className="text-4xl font-cute mb-6 text-gray-700">
                {stats.hp <= 0 ? "ざんねん..." : "ゲームクリア！"}
            </h2>
            
            <div className="flex justify-center mb-6">
                <GameCharacter 
                    theme={theme}
                    color={KIRBY_COLORS[kirbyColorIndex]} 
                    expression={stats.hp <= 0 ? 'surprised' : 'happy'} 
                />
            </div>

            <div className="space-y-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-500 text-sm font-bold">スコア</p>
                    <p className={`text-4xl font-black ${themeStyles.text}`}>{stats.score}</p>
                </div>
                <div className="flex gap-4">
                     <div className="flex-1 bg-gray-50 rounded-xl p-3">
                        <p className="text-gray-500 text-xs font-bold">せいかい</p>
                        <p className="text-2xl font-bold text-gray-700">{stats.correctCount} <span className="text-sm">もん</span></p>
                     </div>
                     <div className="flex-1 bg-gray-50 rounded-xl p-3">
                        <p className="text-gray-500 text-xs font-bold">れんぞく</p>
                        <p className="text-2xl font-bold text-gray-700">{stats.streak} <span className="text-sm">かい</span></p>
                     </div>
                </div>
            </div>

            <button
                onClick={() => {
                    audio.playSelect();
                    setGameState(GameState.MENU);
                }}
                className={`w-full text-white font-bold py-4 px-8 rounded-2xl shadow-[0_6px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all text-xl mb-3 ${themeStyles.button}`}
            >
                もういちど あそぶ
            </button>
            
            <button
                onClick={() => {
                    audio.playSelect();
                    setGameState(GameState.MENU);
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-500 font-bold py-3 px-8 rounded-2xl transition-all text-lg"
            >
                やめる (Title)
            </button>
        </div>
    </div>
  );

  return (
    <>
        {scannedProblems && (
            <ScanSuccessModal 
                count={scannedProblems.length}
                theme={theme}
                color={KIRBY_COLORS[kirbyColorIndex]}
                onStart={handleScanStart}
                onCancel={() => setScannedProblems(null)}
            />
        )}

        {gameState === GameState.MENU && renderMenu()}
        {gameState === GameState.PLAYING && renderGame()}
        {gameState === GameState.MILESTONE && (
            <MilestoneModal 
                message="すごい！休憩タイム！" 
                theme={theme}
                color={KIRBY_COLORS[kirbyColorIndex]}
                onClose={handleMilestoneClose} 
            />
        )}
        {gameState === GameState.GAME_OVER && renderGameOver()}
    </>
  );
};

export default App;
