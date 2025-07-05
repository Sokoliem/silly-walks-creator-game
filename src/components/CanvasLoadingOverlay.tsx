interface CanvasLoadingOverlayProps {
  isInitialized: boolean;
  renderingReady: boolean;
  physicsState: string;
  error: string | null;
}

export const CanvasLoadingOverlay = ({ 
  isInitialized, 
  renderingReady, 
  physicsState, 
  error 
}: CanvasLoadingOverlayProps) => {
  if (isInitialized && renderingReady) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-2xl">
      <div className="text-center">
        <div className="animate-silly-bounce text-4xl mb-2">
          {physicsState === 'error' ? '⚠️' : '🎮'}
        </div>
        <p className="text-muted-foreground">
          {physicsState === 'error' ? 'Physics engine error' : 
           physicsState === 'initializing' ? 'Initializing physics engine...' :
           !isInitialized ? 'Preparing physics simulation...' : 
           'Loading AAA graphics engine...'}
        </p>
        {error && (
          <p className="mt-1 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="mt-2 text-sm text-accent">
          {physicsState === 'error' ? 'Check console for details' :
           physicsState === 'initializing' ? 'Creating creatures and terrain...' :
           isInitialized ? 'WebGL renderer • Particle systems • Advanced shaders' : 
           'Physics simulation • Creature dynamics'}
        </div>
        {physicsState === 'initializing' && (
          <div className="mt-3">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
              <div className="animate-spin w-3 h-3 border border-primary border-t-transparent rounded-full mr-2"></div>
              Setting up physics world...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};