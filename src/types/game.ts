import { WalkParameters } from './walk';

export type GameMode = 'workshop' | 'level_select' | 'parade_ground' | 'results';

export interface LevelProgress {
  levelId: string;
  completed: boolean;
  bestTime: number;
  stars: number; // 0-3 star rating
  attempts: number;
}

export interface GameSession {
  levelId: string;
  walkParameters: WalkParameters;
  startTime: number;
  endTime?: number;
  distance: number;
  maxDistance: number;
  completed: boolean;
  stars: number;
  timeElapsed: number;
}

export interface GameState {
  mode: GameMode;
  currentLevel?: string;
  currentSession?: GameSession;
  walkParameters: WalkParameters;
}

export interface PlayerStats {
  totalStars: number;
  levelsCompleted: number;
  totalAttempts: number;
  bestTimes: Record<string, number>;
  favoriteWalk?: WalkParameters;
}