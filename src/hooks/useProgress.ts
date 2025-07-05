import { useState, useEffect } from 'react';
import { LevelProgress, PlayerStats } from '@/types/game';

const PROGRESS_STORAGE_KEY = 'silly-walks-progress';
const STATS_STORAGE_KEY = 'silly-walks-stats';

export const useProgress = () => {
  const [progress, setProgress] = useState<Record<string, LevelProgress>>({});
  const [stats, setStats] = useState<PlayerStats>({
    totalStars: 0,
    levelsCompleted: 0,
    totalAttempts: 0,
    bestTimes: {}
  });

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
    const savedStats = localStorage.getItem(STATS_STORAGE_KEY);
    
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
    
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  const saveProgress = (levelId: string, levelProgress: LevelProgress) => {
    const newProgress = { ...progress, [levelId]: levelProgress };
    setProgress(newProgress);
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(newProgress));
    
    // Update stats
    const newStats = {
      ...stats,
      totalStars: Object.values(newProgress).reduce((sum, p) => sum + p.stars, 0),
      levelsCompleted: Object.values(newProgress).filter(p => p.completed).length,
      totalAttempts: Object.values(newProgress).reduce((sum, p) => sum + p.attempts, 0),
      bestTimes: { ...stats.bestTimes, [levelId]: levelProgress.bestTime }
    };
    
    setStats(newStats);
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(newStats));
  };

  const getLevelProgress = (levelId: string): LevelProgress => {
    return progress[levelId] || {
      levelId,
      completed: false,
      bestTime: Infinity,
      stars: 0,
      attempts: 0
    };
  };

  const isLevelUnlocked = (levelId: string, allLevels: any[]): boolean => {
    const levelIndex = allLevels.findIndex(l => l.id === levelId);
    if (levelIndex === 0) return true; // First level always unlocked
    
    const previousLevel = allLevels[levelIndex - 1];
    return progress[previousLevel?.id]?.completed || false;
  };

  return {
    progress,
    stats,
    saveProgress,
    getLevelProgress,
    isLevelUnlocked
  };
};