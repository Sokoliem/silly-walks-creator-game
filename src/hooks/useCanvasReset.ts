import { useCallback } from 'react';
import { CreatureBody } from '@/types/walk';
import { Level } from '@/types/level';
import { RenderPipeline } from '@/rendering/core/RenderPipeline';

export const useCanvasReset = (
  canvas: HTMLCanvasElement | null,
  creature: CreatureBody | null,
  renderPipeline: RenderPipeline | null,
  level: Level | undefined,
  resetPhysicsCreature: () => void,
  resetGameState: () => void,
  setRenderingReady: (ready: boolean) => void
) => {
  const resetCreature = useCallback(() => {
    resetPhysicsCreature();
    resetGameState();
    setRenderingReady(false);
    
    if (renderPipeline && creature && canvas) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const resetX = level ? 100 : width / 2;
      const resetY = level ? height - 200 : height / 2 - 100;
      
      renderPipeline.clear();
      renderPipeline.addCreature(creature);
      renderPipeline.setCamera(resetX, resetY - 100, 0.8);
      setRenderingReady(true);
    }
  }, [canvas, creature, renderPipeline, level, resetPhysicsCreature, resetGameState, setRenderingReady]);

  return { resetCreature };
};