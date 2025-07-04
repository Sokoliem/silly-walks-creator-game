import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { PhysicsEngine } from '@/lib/physics';
import { CreatureBody, WalkParameters } from '@/types/walk';

interface PhysicsCanvasProps {
  walkParameters: WalkParameters;
  isPlaying: boolean;
  onCreatureCreated?: (creature: CreatureBody) => void;
  className?: string;
}

export const PhysicsCanvas = ({ 
  walkParameters, 
  isPlaying, 
  onCreatureCreated,
  className = "" 
}: PhysicsCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PhysicsEngine | null>(null);
  const creatureRef = useRef<CreatureBody | null>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);
  
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
    
    // Create ground
    engine.createGround(width, height);
    
    // Create creature
    const creature = engine.createCreature(width / 2, height / 2 - 100);
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

  // Reset creature position when needed
  const resetCreature = () => {
    if (!engineRef.current || !creatureRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    // Reset creature position
    const creature = creatureRef.current;
    const resetX = width / 2;
    const resetY = height / 2 - 100;
    
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
  };

  // Expose reset function to parent
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      (canvas as any).resetCreature = resetCreature;
    }
  }, []);

  return (
    <div className={`creature-canvas ${className}`}>
      <canvas 
        ref={canvasRef}
        className="w-full h-full rounded-2xl"
        style={{ minHeight: '400px' }}
      />
      
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-2xl">
          <div className="text-center">
            <div className="animate-silly-bounce text-4xl mb-2">🚶‍♂️</div>
            <p className="text-muted-foreground">Loading physics engine...</p>
          </div>
        </div>
      )}
    </div>
  );
};