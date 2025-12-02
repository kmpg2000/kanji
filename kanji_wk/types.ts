export interface KanjiProblem {
  id: string;
  sentence: string; // The sentence with a blank, e.g., "___をする"
  target: string;   // The Kanji answer, e.g., "練習"
  reading: string;  // The reading, e.g., "れんしゅう"
  distractors: string[]; // Wrong answers (Kanji or Kana depending on mode)
}

export enum GameMode {
  READING_TO_KANJI = 'READING_TO_KANJI', // Show Hiragana, pick Kanji
  KANJI_TO_READING = 'KANJI_TO_READING', // Show Kanji, pick Hiragana
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  MILESTONE = 'MILESTONE', // The 5-question break
  GAME_OVER = 'GAME_OVER',
  SCANNING = 'SCANNING', // AI processing
}

export type Theme = 'KIRBY' | 'MARIO' | 'PIKACHU' | 'CAT' | 'DOG';

export interface PlayerStats {
  score: number;
  streak: number;
  totalAnswered: number;
  correctCount: number;
  hp: number;
}