import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PhysicsCanvas } from '@/components/PhysicsCanvas';
import { GameHUD } from '@/components/GameHUD';
import { ArrowLeft, RotateCcw, Play, Pause, Trophy, Star } from 'lucide-react';
import { EnvironmentalIndicator } from '@/components/EnvironmentalIndicator';
import { LEVELS } from '@/data/levels';
import { useProgress } from '@/hooks/useProgress';
import { WalkParameters, DEFAULT_WALK_PARAMETERS } from '@/types/walk';
import { GameSession } from '@/types/game';
import { toast } from 'sonner';

const ParadeGround = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { saveProgress, getLevelProgress } = useProgress();
  
  const [walkParameters] = useState<WalkParameters>(
    location.state?.walkParameters || DEFAULT_WALK_PARAMETERS
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [showResults, setShowResults] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const level = LEVELS.find(l => l.id === levelId);
  
  useEffect(() => {
    if (!level) {
      navigate('/level-select');
      return;
    }
  }, [level, navigate]);

  const startGame = () => {
    const session: GameSession = {
      levelId: levelId!,
      walkParameters,
      startTime: Date.now(),
      distance: 0,
      maxDistance: 0,
      completed: false,
      stars: 0,
      timeElapsed: 0
    };
    
    setGameSession(session);
    setIsPlaying(true);
    setShowResults(false);
    
    // Reset creature position
    const canvas = canvasRef.current as any;
    if (canvas && canvas.resetCreature) {
      canvas.resetCreature();
    }
    
    toast("Game started! Walk to the goal zone!");
  };

  const stopGame = () => {
    setIsPlaying(false);
    if (gameSession && !gameSession.completed) {
      toast("Game paused. Click play to continue.");
    }
  };

  const resetGame = () => {
    setIsPlaying(false);
    setGameSession(null);
    setShowResults(false);
    
    const canvas = canvasRef.current as any;
    if (canvas && canvas.resetCreature) {
      canvas.resetCreature();
    }
    
    toast("Game reset!");
  };

  const handleGameComplete = (success: boolean, finalDistance: number) => {
    if (!gameSession || !level) return;

    const endTime = Date.now();
    const timeElapsed = (endTime - gameSession.startTime) / 1000;
    
    // Calculate stars based on performance
    let stars = 0;
    if (success) {
      stars = 1; // Base star for completion
      if (timeElapsed <= level.parTime) stars = 2; // Bonus for good time
      if (timeElapsed <= level.parTime * 0.8) stars = 3; // Bonus for excellent time
    }

    const completedSession: GameSession = {
      ...gameSession,
      endTime,
      timeElapsed,
      distance: finalDistance,
      maxDistance: Math.max(gameSession.maxDistance, finalDistance),
      completed: success,
      stars
    };

    setGameSession(completedSession);
    setIsPlaying(false);
    setShowResults(true);

    // Save progress
    const currentProgress = getLevelProgress(levelId!);
    const newProgress = {
      ...currentProgress,
      attempts: currentProgress.attempts + 1,
      completed: success || currentProgress.completed,
      bestTime: success ? Math.min(currentProgress.bestTime, timeElapsed) : currentProgress.bestTime,
      stars: Math.max(currentProgress.stars, stars)
    };
    
    saveProgress(levelId!, newProgress);

    // Play completion sound
    if (success) {
      import('@/lib/audio').then(({ audioManager }) => {
        audioManager.playSuccess();
      });
      toast(`Level completed! ${stars} stars earned!`);
    } else {
      toast("Keep trying! You'll get it next time!");
    }
  };

  const calculateStars = (timeElapsed: number): number => {
    if (!level) return 0;
    if (timeElapsed <= level.parTime * 0.8) return 3;
    if (timeElapsed <= level.parTime) return 2;
    return 1;
  };

  if (!level) {
    return <div>Level not found</div>;
  }

  return (
    <div className="min-h-screen p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate('/level-select')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Levels
        </Button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">{level.name}</h1>
          <p className="text-sm text-muted-foreground">{level.description}</p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              resetGame();
              // Play UI click sound
              import('@/lib/audio').then(({ audioManager }) => {
                audioManager.playClick();
              });
            }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={() => {
              if (isPlaying) {
                stopGame();
              } else {
                startGame();
              }
              // Play UI click sound
              import('@/lib/audio').then(({ audioManager }) => {
                audioManager.playClick();
              });
            }}
            className="silly-button"
          >
            {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isPlaying ? 'Pause' : 'Start'}
          </Button>
        </div>
      </div>

      {/* Environmental Effects Indicator */}
      {level.environment && level.environment.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <EnvironmentalIndicator effects={level.environment} />
        </div>
      )}

      {/* Game HUD */}
      {gameSession && (
        <GameHUD
          startTime={gameSession.startTime}
          distance={gameSession.distance}
          maxDistance={gameSession.maxDistance}
          targetDistance={level.goal.minDistance}
          isActive={isPlaying}
        />
      )}

      {/* Game Canvas */}
      <div className="max-w-7xl mx-auto">
        <PhysicsCanvas
          walkParameters={walkParameters}
          isPlaying={isPlaying}
          level={level}
          onGameComplete={handleGameComplete}
          onDistanceUpdate={(distance, maxDistance) => {
            if (gameSession) {
              setGameSession({
                ...gameSession,
                distance,
                maxDistance: Math.max(gameSession.maxDistance, maxDistance)
              });
            }
          }}
          className="h-[600px]"
          ref={canvasRef}
        />
      </div>

      {/* Results Modal */}
      {showResults && gameSession && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle>
                {gameSession.completed ? 'Level Complete!' : 'Try Again!'}
              </CardTitle>
              <CardDescription>
                {gameSession.completed 
                  ? `Great job! You reached the goal in ${gameSession.timeElapsed.toFixed(1)} seconds.`
                  : `You made it ${gameSession.maxDistance.toFixed(0)}m. Keep practicing!`
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {gameSession.completed && (
                <div className="text-center">
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= gameSession.stars
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground/50'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {gameSession.stars} out of 3 stars
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate('/level-select');
                    // Play UI click sound
                    import('@/lib/audio').then(({ audioManager }) => {
                      audioManager.playClick();
                    });
                  }}
                  className="flex-1"
                >
                  Level Select
                </Button>
                <Button
                  onClick={() => {
                    startGame();
                    // Play UI click sound
                    import('@/lib/audio').then(({ audioManager }) => {
                      audioManager.playClick();
                    });
                  }}
                  className="flex-1 silly-button"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ParadeGround;