import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Matter from 'matter-js';
import { CreatureBody, WalkParameters } from '@/types/walk';
import { Level } from '@/types/level';
import { RenderPipeline } from '@/rendering/core/RenderPipeline';
import { usePhysicsEngine } from '@/hooks/usePhysicsEngine';
import { useParticleEffects } from '@/hooks/useParticleEffects';
import { useGameLogic } from '@/hooks/useGameLogic';
import { ErrorBoundary } from './ErrorBoundary';

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
  const renderPipelineRef = useRef<RenderPipeline | null>(null);
  
  // Use custom hooks for separated concerns
  const { engine, creature, isInitialized, resetCreature: resetPhysicsCreature } = usePhysicsEngine(
    canvasRef.current,
    level,
    onCreatureCreated
  );
  
  const { updateGameState, resetGameState } = useGameLogic(
    level,
    onGameComplete,
    onDistanceUpdate
  );

  // Initialize AAA rendering pipeline
  useEffect(() => {
    if (!canvasRef.current || !isInitialized || renderPipelineRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    // Set canvas resolution
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    try {
      console.log('Creating AAA rendering pipeline...');
      console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
      
      // Create AAA rendering pipeline
      const renderPipeline = new RenderPipeline(canvas);
      renderPipelineRef.current = renderPipeline;
      console.log('RenderPipeline created successfully');
      
      // Add terrain to renderer
      if (level) {
        console.log('Adding level terrain...');
        level.terrain.forEach((terrain) => {
          renderPipeline.addTerrain(
            terrain.x, 
            terrain.y, 
            terrain.width, 
            terrain.height, 
            terrain.type === 'platform' ? 'platform' : 'ground'
          );
        });

        renderPipeline.addTerrain(
          level.goal.x,
          level.goal.y,
          level.goal.width,
          level.goal.height,
          'goal'
        );
        console.log('Level terrain added');
      } else {
        console.log('Adding ground terrain...');
        renderPipeline.addTerrain(0, height - 100, width, 100, 'ground');
        console.log('Ground terrain added');
      }
      
      // Add creature to renderer if available
      if (creature) {
        console.log('Adding creature to renderer...');
        renderPipeline.addCreature(creature);
        const startX = level ? 100 : width / 2;
        const startY = level ? height - 200 : height / 2 - 100;
        renderPipeline.setCamera(startX, startY - 100, 0.8);
        renderPipeline.start();
        console.log('Creature added and rendering started');
      }
      console.log('AAA rendering pipeline initialization complete');
    } catch (error) {
      console.error('Failed to initialize AAA rendering pipeline:', error);
      console.error('Render error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Render error stack:', error instanceof Error ? error.stack : 'No stack trace');
    }

    return () => {
      if (renderPipelineRef.current) {
        renderPipelineRef.current.destroy();
      }
    };
  }, [isInitialized, creature, level]);

  const { updateParticleEffects } = useParticleEffects(renderPipelineRef.current);

  // Animation and physics loop
  useEffect(() => {
    if (!isInitialized || !engine || !creature || !renderPipelineRef.current) return;

    let animationId: number;
    
    const animate = () => {
      if (!engine || !creature || !renderPipelineRef.current) return;
      
      if (isPlaying) {
        // Update physics
        engine.updateCreatureWalk(creature, walkParameters, Date.now());
        
        // Update visual representation
        renderPipelineRef.current.updateCreature(creature);
        
        // Camera following
        renderPipelineRef.current.followCreature(creature, 0.05);

        // Particle effects
        updateParticleEffects(creature);

        // Game logic
        updateGameState(creature);
      }
      
      // Step physics simulation
      engine.step();
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isInitialized, isPlaying, walkParameters, engine, creature, updateParticleEffects, updateGameState]);

  // Combined reset function
  const resetCreature = () => {
    resetPhysicsCreature();
    resetGameState();
    
    if (renderPipelineRef.current && creature) {
      const canvas = canvasRef.current;
      if (canvas) {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const resetX = level ? 100 : width / 2;
        const resetY = level ? height - 200 : height / 2 - 100;
        
        renderPipelineRef.current.clear();
        renderPipelineRef.current.addCreature(creature);
        renderPipelineRef.current.setCamera(resetX, resetY - 100, 0.8);
      }
    }
  };

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
        
        {!isInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-2xl">
            <div className="text-center">
              <div className="animate-silly-bounce text-4xl mb-2">🎮</div>
              <p className="text-muted-foreground">Loading AAA graphics engine...</p>
              <div className="mt-2 text-sm text-accent">
                WebGL renderer • Particle systems • Advanced shaders
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
});