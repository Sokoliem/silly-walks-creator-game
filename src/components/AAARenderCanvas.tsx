import { useRef, forwardRef, useImperativeHandle } from 'react';
import { CreatureBody, WalkParameters } from '@/types/walk';
import { Level } from '@/types/level';
import { usePhysicsEngine } from '@/hooks/usePhysicsEngine';
import { useParticleEffects } from '@/hooks/useParticleEffects';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useRenderPipeline } from '@/hooks/useRenderPipeline';
import { useAnimationLoop } from '@/hooks/useAnimationLoop';
import { useCanvasReset } from '@/hooks/useCanvasReset';
import { ErrorBoundary } from './ErrorBoundary';
import { CanvasLoadingOverlay } from './CanvasLoadingOverlay';

interface AAARenderCanvasProps {
  walkParameters: WalkParameters;
  isPlaying: boolean;
  onCreatureCreated?: (creature: CreatureBody) => void;
  level?: Level;
  onGameComplete?: (success: boolean, finalDistance: number) => void;
  onDistanceUpdate?: (distance: number, maxDistance: number) => void;
  className?: string;
}

export const AAARenderCanvas = forwardRef<any, AAARenderCanvasProps>(({ 
  walkParameters, 
  isPlaying, 
  onCreatureCreated,
  level,
  onGameComplete,
  onDistanceUpdate,
  className = "" 
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use custom hooks for separated concerns
  const { engine, creature, isInitialized, physicsState, error, resetCreature: resetPhysicsCreature } = usePhysicsEngine(
    canvasRef.current,
    level,
    onCreatureCreated
  );
  
  const { updateGameState, resetGameState } = useGameLogic(
    level,
    onGameComplete,
    onDistanceUpdate
  );

  // Initialize rendering pipeline
  const { renderPipeline, renderingReady, setRenderingReady } = useRenderPipeline(
    canvasRef.current,
    isInitialized,
    creature,
    level
  );

  // Initialize particle effects
  const { updateParticleEffects } = useParticleEffects(renderPipeline);

  // Initialize animation loop
  useAnimationLoop(
    isInitialized,
    isPlaying,
    walkParameters,
    engine,
    creature,
    renderPipeline,
    updateParticleEffects,
    updateGameState
  );

  // Initialize reset functionality
  const { resetCreature } = useCanvasReset(
    canvasRef.current,
    creature,
    renderPipeline,
    level,
    resetPhysicsCreature,
    resetGameState,
    setRenderingReady
  );

  // Expose reset function to parent via ref
  useImperativeHandle(ref, () => ({
    resetCreature
  }));

  return (
    <ErrorBoundary>
      <div className={`creature-canvas ${className}`}>
        <canvas 
          ref={canvasRef}
          className="w-full h-full rounded-2xl"
          style={{ minHeight: '400px' }}
        />
        
        <CanvasLoadingOverlay
          isInitialized={isInitialized}
          renderingReady={renderingReady}
          physicsState={physicsState}
          error={error}
        />
      </div>
    </ErrorBoundary>
  );
});