import { forwardRef } from 'react';
import { CreatureBody, WalkParameters } from '@/types/walk';
import { Level } from '@/types/level';
import { AAARenderCanvas } from './AAARenderCanvas';

interface PhysicsCanvasProps {
  walkParameters: WalkParameters;
  isPlaying: boolean;
  onCreatureCreated?: (creature: CreatureBody) => void;
  level?: Level; // Optional level for gameplay mode
  onGameComplete?: (success: boolean, finalDistance: number) => void;
  onDistanceUpdate?: (distance: number, maxDistance: number) => void;
  className?: string;
}

export const PhysicsCanvas = forwardRef<any, PhysicsCanvasProps>(({ 
  walkParameters, 
  isPlaying, 
  onCreatureCreated,
  level,
  onGameComplete,
  onDistanceUpdate,
  className = "" 
}, ref) => {
  return (
    <AAARenderCanvas
      ref={ref}
      walkParameters={walkParameters}
      isPlaying={isPlaying}
      onCreatureCreated={onCreatureCreated}
      level={level}
      onGameComplete={onGameComplete}
      onDistanceUpdate={onDistanceUpdate}
      className={className}
    />
  );
});