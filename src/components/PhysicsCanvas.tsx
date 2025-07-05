import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Matter from 'matter-js';
import { PhysicsEngine } from '@/lib/physics';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PhysicsEngine | null>(null);
  const creatureRef = useRef<CreatureBody | null>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const distanceRef = useRef<number>(0);
  const maxDistanceRef = useRef<number>(0);
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize physics engine
  useEffect(() => {
    if (!canvasRef.current || isInitialized) return;

    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    // Set canvas resolution
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    // Create physics engine
    const engine = new PhysicsEngine();
    engineRef.current = engine;
    
    // Setup renderer
    engine.setupRenderer(canvas, width, height);
    
    // Create ground and level terrain
    if (level) {
      engine.createLevel(level, width, height);
    } else {
      engine.createGround(width, height);
    }
    
    // Create creature
    const startX = level ? 100 : width / 2;
    const startY = level ? height - 200 : height / 2 - 100;
    const creature = engine.createCreature(startX, startY);
    creatureRef.current = creature;
    
    if (onCreatureCreated) {
      onCreatureCreated(creature);
    }
    
    setIsInitialized(true);

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, [isInitialized, onCreatureCreated]);

  // Animation loop
  useEffect(() => {
    if (!isInitialized || !engineRef.current || !creatureRef.current) return;

    const animate = () => {
      if (!engineRef.current || !creatureRef.current) return;
      
      if (isPlaying) {
        timeRef.current += 16.666; // ~60fps
        engineRef.current.updateCreatureWalk(
          creatureRef.current, 
          walkParameters, 
          timeRef.current
        );

        // Check distance and goal completion for level mode
        if (level && creatureRef.current) {
          const creatureX = creatureRef.current.torso.position.x;
          const distance = Math.max(0, creatureX - 100); // Starting position
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
      }
      
      engineRef.current.step();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isInitialized, isPlaying, walkParameters]);

  // Reset creature position for level mode
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
    
    timeRef.current = 0;
    distanceRef.current = 0;
    maxDistanceRef.current = 0;
  };

  // Expose reset function to parent via ref
  useImperativeHandle(ref, () => ({
    resetCreature
  }));

  // Also expose via canvas for backward compatibility
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      (canvas as any).resetCreature = resetCreature;
    }
  }, []);

  // Use AAA renderer for enhanced graphics
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