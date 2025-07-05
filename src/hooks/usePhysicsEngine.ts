import { useRef, useEffect, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { PhysicsEngine } from '@/lib/physics';
import { CreatureBody } from '@/types/walk';
import { Level } from '@/types/level';

type PhysicsState = 'idle' | 'initializing' | 'ready' | 'error';

export const usePhysicsEngine = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  level?: Level,
  onCreatureCreated?: (creature: CreatureBody) => void
) => {
  const engineRef = useRef<PhysicsEngine | null>(null);
  const creatureRef = useRef<CreatureBody | null>(null);
  const [physicsState, setPhysicsState] = useState<PhysicsState>('idle');
  const [error, setError] = useState<string | null>(null);
  const initializationAttempts = useRef(0);
  const maxRetries = 3;

  const validateCanvas = useCallback((canvas: HTMLCanvasElement): { width: number; height: number; valid: boolean } => {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.clientWidth || canvas.offsetWidth;
    const height = rect.height || canvas.clientHeight || canvas.offsetHeight;
    
    console.log('Canvas validation:', { width, height, clientWidth: canvas.clientWidth, clientHeight: canvas.clientHeight });
    
    const valid = width > 0 && height > 0;
    return { width, height, valid };
  }, []);

  const initializePhysics = useCallback(async (canvas: HTMLCanvasElement) => {
    if (physicsState === 'initializing' || physicsState === 'ready') return;
    
    setPhysicsState('initializing');
    setError(null);
    initializationAttempts.current++;
    
    console.log(`Physics initialization attempt ${initializationAttempts.current}/${maxRetries}`);
    
    try {
      // Validate canvas dimensions
      const { width, height, valid } = validateCanvas(canvas);
      
      if (!valid) {
        throw new Error(`Invalid canvas dimensions: ${width}x${height}`);
      }

      console.log('Creating physics engine with canvas dimensions:', width, 'x', height);
      
      // Create physics engine (headless - no visual rendering)
      const engine = new PhysicsEngine();
      engineRef.current = engine;
      console.log('Physics engine created successfully');
      
      // Create level terrain
      if (level) {
        console.log('Creating level terrain...');
        engine.createLevel(level, width, height);
        console.log('Level terrain created');
      } else {
        console.log('Creating ground terrain...');
        engine.createGround(width, height);
        console.log('Ground terrain created');
      }
      
      // Create creature
      const startX = level ? 100 : width / 2;
      const startY = level ? height - 200 : height / 2 - 100;
      console.log('Creating creature at position:', startX, startY);
      
      const creature = engine.createCreature(startX, startY);
      creatureRef.current = creature;
      console.log('Creature created successfully');
      
      if (onCreatureCreated) {
        onCreatureCreated(creature);
      }
      
      console.log('Physics initialization complete - setting state to ready');
      setPhysicsState('ready');
      initializationAttempts.current = 0; // Reset attempts on success
      
    } catch (error) {
      console.error(`Physics initialization failed (attempt ${initializationAttempts.current}):`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      
      if (initializationAttempts.current < maxRetries) {
        console.log(`Retrying physics initialization in 1 second...`);
        setTimeout(() => {
          initializePhysics(canvas);
        }, 1000);
      } else {
        console.error('Max initialization attempts reached, giving up');
        setPhysicsState('error');
      }
    }
  }, [level, onCreatureCreated, physicsState, validateCanvas]);

  useEffect(() => {
    console.log('usePhysicsEngine: Effect triggered', { 
      hasCanvas: !!canvasRef.current, 
      canvasWidth: canvasRef.current?.clientWidth, 
      canvasHeight: canvasRef.current?.clientHeight,
      physicsState 
    });
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('No canvas available for physics initialization');
      return;
    }

    // Wait for canvas to be properly laid out
    const checkCanvas = () => {
      const { valid } = validateCanvas(canvas);
      
      if (valid && physicsState === 'idle') {
        initializePhysics(canvas);
      } else if (!valid && physicsState === 'idle') {
        console.log('Canvas not ready, retrying in 100ms...');
        setTimeout(checkCanvas, 100);
      }
    };

    // Small delay to ensure canvas is laid out
    setTimeout(checkCanvas, 50);

    return () => {
      if (engineRef.current) {
        console.log('Cleaning up physics engine');
        engineRef.current.destroy();
        engineRef.current = null;
      }
      if (physicsState !== 'idle') {
        setPhysicsState('idle');
      }
    };
  }, [canvasRef, level]);

  const resetCreature = () => {
    if (!engineRef.current || !creatureRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    // Reset creature position
    const creature = creatureRef.current;
    const resetX = level ? 100 : width / 2;
    const resetY = level ? height - 200 : height / 2 - 100;
    
    // Reset all body positions and velocities
    const bodies = [
      creature.torso,
      creature.leftThigh,
      creature.leftCalf,
      creature.rightThigh,
      creature.rightCalf,
      creature.leftArm,
      creature.rightArm
    ];
    
    bodies.forEach((body, index) => {
      Matter.Body.setPosition(body, { 
        x: resetX + (index % 2 === 0 ? -5 : 5), 
        y: resetY + index * 10 
      });
      Matter.Body.setVelocity(body, { x: 0, y: 0 });
      Matter.Body.setAngularVelocity(body, 0);
      Matter.Body.setAngle(body, 0);
    });
  };

  return {
    engine: engineRef.current,
    creature: creatureRef.current,
    isInitialized: physicsState === 'ready',
    physicsState,
    error,
    resetCreature
  };
};