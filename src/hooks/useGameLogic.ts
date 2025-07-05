import { useRef } from 'react';
import { CreatureBody } from '@/types/walk';
import { Level } from '@/types/level';

export const useGameLogic = (
  level?: Level,
  onGameComplete?: (success: boolean, finalDistance: number) => void,
  onDistanceUpdate?: (distance: number, maxDistance: number) => void
) => {
  const timeRef = useRef<number>(0);
  const distanceRef = useRef<number>(0);
  const maxDistanceRef = useRef<number>(0);

  const updateGameState = (creature: CreatureBody) => {
    timeRef.current += 16.666; // ~60fps

    // Check distance and goal completion for level mode
    if (level && creature) {
      const creatureX = creature.torso.position.x;
      const distance = Math.max(0, creatureX - 100);
      distanceRef.current = distance;
      maxDistanceRef.current = Math.max(maxDistanceRef.current, distance);
      
      if (onDistanceUpdate) {
        onDistanceUpdate(distance, maxDistanceRef.current);
      }

      // Check goal completion
      const goalReached = creatureX >= level.goal.x && 
                        creatureX <= level.goal.x + level.goal.width &&
                        maxDistanceRef.current >= level.goal.minDistance;
      
      if (goalReached && onGameComplete) {
        onGameComplete(true, maxDistanceRef.current);
      }
    }
  };

  const resetGameState = () => {
    timeRef.current = 0;
    distanceRef.current = 0;
    maxDistanceRef.current = 0;
  };

  return {
    updateGameState,
    resetGameState,
    gameTime: timeRef.current,
    distance: distanceRef.current,
    maxDistance: maxDistanceRef.current
  };
};