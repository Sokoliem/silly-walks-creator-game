import { useRef } from 'react';
import { CreatureBody } from '@/types/walk';
import { RenderPipeline } from '@/rendering/core/RenderPipeline';

export const useParticleEffects = (renderPipeline: RenderPipeline | null) => {
  const lastFootPositions = useRef<{ 
    left: { x: number; y: number }; 
    right: { x: number; y: number } 
  }>({
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 }
  });

  const updateParticleEffects = (creature: CreatureBody) => {
    if (!renderPipeline) return;

    const leftFootPos = { 
      x: creature.leftCalf.position.x, 
      y: creature.leftCalf.position.y + 12 
    };
    const rightFootPos = { 
      x: creature.rightCalf.position.x, 
      y: creature.rightCalf.position.y + 12 
    };

    // Detect foot impacts with ground
    const leftFootSpeed = Math.abs(creature.leftCalf.velocity.y);
    const rightFootSpeed = Math.abs(creature.rightCalf.velocity.y);

    // Create dust particles when feet hit ground (velocity threshold)
    if (leftFootSpeed > 5 && Math.abs(leftFootPos.y - lastFootPositions.current.left.y) > 2) {
      renderPipeline.createFootstepEffect(leftFootPos.x, leftFootPos.y);
    }
    
    if (rightFootSpeed > 5 && Math.abs(rightFootPos.y - lastFootPositions.current.right.y) > 2) {
      renderPipeline.createFootstepEffect(rightFootPos.x, rightFootPos.y);
    }

    // Create sweat effect during intense movement
    const torsoSpeed = Math.sqrt(
      creature.torso.velocity.x ** 2 + creature.torso.velocity.y ** 2
    );
    
    if (torsoSpeed > 15 && Math.random() < 0.1) {
      renderPipeline.createSweatEffect(
        creature.torso.position.x + (Math.random() - 0.5) * 20,
        creature.torso.position.y - 15
      );
    }

    // Update last positions
    lastFootPositions.current.left = leftFootPos;
    lastFootPositions.current.right = rightFootPos;
  };

  const resetEffects = () => {
    lastFootPositions.current = {
      left: { x: 0, y: 0 },
      right: { x: 0, y: 0 }
    };
  };

  return {
    updateParticleEffects,
    resetEffects
  };
};