import { useEffect, useRef, useState } from 'react';
import { RenderPipeline } from '@/rendering/core/RenderPipeline';
import { CreatureBody } from '@/types/walk';
import { Level } from '@/types/level';

export const useRenderPipeline = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  isInitialized: boolean,
  creature: CreatureBody | null,
  level?: Level
) => {
  const renderPipelineRef = useRef<RenderPipeline | null>(null);
  const [renderingReady, setRenderingReady] = useState(false);

  useEffect(() => {
    console.log('useRenderPipeline: Effect triggered', { 
      hasCanvas: !!canvasRef.current, 
      isInitialized, 
      hasExistingPipeline: !!renderPipelineRef.current 
    });
    
    const canvas = canvasRef.current;
    if (!canvas || !isInitialized || renderPipelineRef.current) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    // Ensure canvas has proper dimensions before WebGL init
    if (width === 0 || height === 0) {
      console.warn('Canvas has zero dimensions, delaying render initialization');
      return;
    }
    
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
      
      console.log('AAA rendering pipeline initialization complete - setting rendering ready');
      setRenderingReady(true);
    } catch (error) {
      console.error('Failed to initialize AAA rendering pipeline:', error);
      console.error('Render error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Render error stack:', error instanceof Error ? error.stack : 'No stack trace');
      setRenderingReady(false);
    }

    return () => {
      if (renderPipelineRef.current) {
        renderPipelineRef.current.destroy();
      }
      setRenderingReady(false);
    };
  }, [canvasRef, isInitialized, creature, level]);

  return {
    renderPipeline: renderPipelineRef.current,
    renderingReady,
    setRenderingReady
  };
};