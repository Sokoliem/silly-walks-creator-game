import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Matter from 'matter-js';
import { PhysicsEngine } from '@/lib/physics';
import { CreatureBody, WalkParameters } from '@/types/walk';
import { Level } from '@/types/level';
import { RenderPipeline } from '@/rendering/core/RenderPipeline';

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
  const engineRef = useRef<PhysicsEngine | null>(null);
  const renderPipelineRef = useRef<RenderPipeline | null>(null);
  const creatureRef = useRef<CreatureBody | null>(null);
  const timeRef = useRef<number>(0);
  const distanceRef = useRef<number>(0);
  const maxDistanceRef = useRef<number>(0);
  const lastFootPositions = useRef<{ left: { x: number; y: number }; right: { x: number; y: number } }>({
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 }
  });
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize physics engine and AAA rendering pipeline
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

    try {
      // Create AAA rendering pipeline
      const renderPipeline = new RenderPipeline(canvas);
      renderPipelineRef.current = renderPipeline;

      // Create physics engine (headless - no visual rendering)
      const engine = new PhysicsEngine();
      engineRef.current = engine;
      
      // Create level terrain
      if (level) {
        engine.createLevel(level, width, height);
        
        // Add terrain to renderer
        level.terrain.forEach((terrain) => {
          renderPipeline.addTerrain(
            terrain.x, 
            terrain.y, 
            terrain.width, 
            terrain.height, 
            terrain.type === 'platform' ? 'platform' : 'ground'
          );
        });

        // Add goal zone
        renderPipeline.addTerrain(
          level.goal.x,
          level.goal.y,
          level.goal.width,
          level.goal.height,
          'goal'
        );
      } else {
        engine.createGround(width, height);
        renderPipeline.addTerrain(0, height - 100, width, 100, 'ground');
      }
      
      // Create creature
      const startX = level ? 100 : width / 2;
      const startY = level ? height - 200 : height / 2 - 100;
      const creature = engine.createCreature(startX, startY);
      creatureRef.current = creature;
      
      // Add creature to renderer
      renderPipeline.addCreature(creature);
      
      // Set initial camera
      renderPipeline.setCamera(startX, startY - 100, 0.8);
      
      // Start rendering pipeline
      renderPipeline.start();
      
      if (onCreatureCreated) {
        onCreatureCreated(creature);
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize AAA rendering pipeline:', error);
      setIsInitialized(false);
    }

    return () => {
      if (renderPipelineRef.current) {
        renderPipelineRef.current.destroy();
      }
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, [isInitialized, onCreatureCreated]);

  // Animation and physics loop
  useEffect(() => {
    if (!isInitialized || !engineRef.current || !creatureRef.current || !renderPipelineRef.current) return;

    let animationId: number;
    
    const animate = () => {
      if (!engineRef.current || !creatureRef.current || !renderPipelineRef.current) return;
      
      if (isPlaying) {
        timeRef.current += 16.666; // ~60fps
        
        // Update physics
        engineRef.current.updateCreatureWalk(
          creatureRef.current, 
          walkParameters, 
          timeRef.current
        );

        // Update visual representation
        renderPipelineRef.current.updateCreature(creatureRef.current);
        
        // Camera following
        renderPipelineRef.current.followCreature(creatureRef.current, 0.05);

        // Particle effects based on creature movement
        updateParticleEffects();

        // Check distance and goal completion for level mode
        if (level && creatureRef.current) {
          const creatureX = creatureRef.current.torso.position.x;
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
      }
      
      // Step physics simulation
      engineRef.current.step();
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isInitialized, isPlaying, walkParameters]);

  const updateParticleEffects = () => {
    if (!creatureRef.current || !renderPipelineRef.current) return;

    const creature = creatureRef.current;
    const leftFootPos = { x: creature.leftCalf.position.x, y: creature.leftCalf.position.y + 12 };
    const rightFootPos = { x: creature.rightCalf.position.x, y: creature.rightCalf.position.y + 12 };

    // Detect foot impacts with ground
    const leftFootSpeed = Math.abs(creature.leftCalf.velocity.y);
    const rightFootSpeed = Math.abs(creature.rightCalf.velocity.y);

    // Create dust particles when feet hit ground (velocity threshold)
    if (leftFootSpeed > 5 && Math.abs(leftFootPos.y - lastFootPositions.current.left.y) > 2) {
      renderPipelineRef.current.createFootstepEffect(leftFootPos.x, leftFootPos.y);
    }
    
    if (rightFootSpeed > 5 && Math.abs(rightFootPos.y - lastFootPositions.current.right.y) > 2) {
      renderPipelineRef.current.createFootstepEffect(rightFootPos.x, rightFootPos.y);
    }

    // Create sweat effect during intense movement
    const torsoSpeed = Math.sqrt(
      creature.torso.velocity.x ** 2 + creature.torso.velocity.y ** 2
    );
    
    if (torsoSpeed > 15 && Math.random() < 0.1) {
      renderPipelineRef.current.createSweatEffect(
        creature.torso.position.x + (Math.random() - 0.5) * 20,
        creature.torso.position.y - 15
      );
    }

    // Update last positions
    lastFootPositions.current.left = leftFootPos;
    lastFootPositions.current.right = rightFootPos;
  };

  // Reset creature position for level mode
  const resetCreature = () => {
    if (!engineRef.current || !creatureRef.current || !canvasRef.current || !renderPipelineRef.current) return;
    
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
    
    // Reset tracking variables
    timeRef.current = 0;
    distanceRef.current = 0;
    maxDistanceRef.current = 0;
    
    // Clear particles and reset camera
    renderPipelineRef.current.clear();
    renderPipelineRef.current.addCreature(creature);
    renderPipelineRef.current.setCamera(resetX, resetY - 100, 0.8);
  };

  // Expose reset function to parent via ref
  useImperativeHandle(ref, () => ({
    resetCreature
  }));

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
            <div className="animate-silly-bounce text-4xl mb-2">🎮</div>
            <p className="text-muted-foreground">Loading AAA graphics engine...</p>
            <div className="mt-2 text-sm text-accent">
              WebGL renderer • Particle systems • Advanced shaders
            </div>
          </div>
        </div>
      )}
    </div>
  );
});