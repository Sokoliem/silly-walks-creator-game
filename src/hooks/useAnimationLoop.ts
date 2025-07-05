import { useEffect } from 'react';
import { CreatureBody, WalkParameters } from '@/types/walk';
import { PhysicsEngine } from '@/lib/physics';
import { RenderPipeline } from '@/rendering/core/RenderPipeline';

export const useAnimationLoop = (
  isInitialized: boolean,
  isPlaying: boolean,
  walkParameters: WalkParameters,
  engine: PhysicsEngine | null,
  creature: CreatureBody | null,
  renderPipeline: RenderPipeline | null,
  updateParticleEffects: (creature: CreatureBody) => void,
  updateGameState: (creature: CreatureBody) => void
) => {
  useEffect(() => {
    if (!isInitialized || !engine || !creature || !renderPipeline) return;

    let animationId: number;
    
    const animate = () => {
      if (!engine || !creature || !renderPipeline) return;
      
      if (isPlaying) {
        // Update physics
        engine.updateCreatureWalk(creature, walkParameters, Date.now());
        
        // Update visual representation
        renderPipeline.updateCreature(creature);
        
        // Camera following
        renderPipeline.followCreature(creature, 0.05);

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
  }, [isInitialized, isPlaying, walkParameters, engine, creature, renderPipeline, updateParticleEffects, updateGameState]);
};