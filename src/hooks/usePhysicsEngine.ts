import { useRef, useEffect, useState } from 'react';
import Matter from 'matter-js';
import { PhysicsEngine } from '@/lib/physics';
import { CreatureBody } from '@/types/walk';
import { Level } from '@/types/level';

export const usePhysicsEngine = (
  canvas: HTMLCanvasElement | null,
  level?: Level,
  onCreatureCreated?: (creature: CreatureBody) => void
) => {
  const engineRef = useRef<PhysicsEngine | null>(null);
  const creatureRef = useRef<CreatureBody | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!canvas || isInitialized) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    try {
      console.log('Initializing physics engine...');
      // Create physics engine (headless - no visual rendering)
      const engine = new PhysicsEngine();
      engineRef.current = engine;
      console.log('Physics engine created successfully');
      
      // Create level terrain
      if (level) {
        engine.createLevel(level, width, height);
        console.log('Level terrain created');
      } else {
        engine.createGround(width, height);
        console.log('Ground created');
      }
      
      // Create creature
      const startX = level ? 100 : width / 2;
      const startY = level ? height - 200 : height / 2 - 100;
      const creature = engine.createCreature(startX, startY);
      creatureRef.current = creature;
      console.log('Creature created successfully');
      
      if (onCreatureCreated) {
        onCreatureCreated(creature);
      }
      
      console.log('Physics initialization complete - setting initialized to true');
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize physics engine:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      setIsInitialized(false);
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, [canvas, isInitialized, level, onCreatureCreated]);

  const resetCreature = () => {
    if (!engineRef.current || !creatureRef.current || !canvas) return;
    
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
    isInitialized,
    resetCreature
  };
};