import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Lock, Star, Clock, Target } from 'lucide-react';
import { LEVELS } from '@/data/levels';
import { useProgress } from '@/hooks/useProgress';
import { WalkParameters } from '@/types/walk';

interface LevelSelectProps {
  walkParameters?: WalkParameters;
}

const LevelSelect = ({ walkParameters }: LevelSelectProps) => {
  const navigate = useNavigate();
  const { progress, isLevelUnlocked } = useProgress();

  const handleLevelStart = (levelId: string) => {
    navigate(`/parade-ground/${levelId}`, { 
      state: { walkParameters } 
    });
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'bg-primary/20 text-primary';
      case 2: return 'bg-accent/20 text-accent';
      case 3: return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };

  const renderStars = (stars: number) => {
    return (
      <div className="flex gap-1 mt-2">
        {[1, 2, 3].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= stars 
                ? 'fill-primary text-primary' 
                : 'text-muted-foreground/50'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="absolute top-4 left-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workshop
        </Button>
        
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Choose Your Challenge
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Test your silly walk in increasingly ridiculous challenges. 
          Complete levels to unlock new adventures!
        </p>
      </div>

      {/* Level Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LEVELS.map((level) => {
          const levelProgress = progress[level.id];
          const unlocked = isLevelUnlocked(level.id, LEVELS);
          
          return (
            <Card 
              key={level.id} 
              className={`relative transition-all duration-300 ${
                unlocked 
                  ? 'hover:shadow-glow cursor-pointer border-primary/20' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => unlocked && handleLevelStart(level.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      {!unlocked && <Lock className="w-4 h-4" />}
                      {level.name}
                    </CardTitle>
                    <Badge className={getDifficultyColor(level.difficulty)}>
                      {level.difficulty === 1 ? 'Easy' : level.difficulty === 2 ? 'Medium' : 'Hard'}
                    </Badge>
                  </div>
                  
                  {levelProgress?.completed && renderStars(levelProgress.stars)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <CardDescription className="text-sm">
                  {level.description}
                </CardDescription>

                {/* Level Stats */}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Par: {level.parTime}s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>{level.goal.minDistance}m</span>
                  </div>
                </div>

                {/* Personal Best */}
                {levelProgress?.completed && (
                  <div className="text-xs text-primary bg-primary/10 p-2 rounded">
                    Best: {levelProgress.bestTime.toFixed(1)}s | Attempts: {levelProgress.attempts}
                  </div>
                )}

                {/* Action Button */}
                {unlocked && (
                  <Button 
                    className="w-full silly-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLevelStart(level.id);
                    }}
                  >
                    {levelProgress?.completed ? 'Play Again' : 'Start Challenge'}
                  </Button>
                )}
              </CardContent>

              {/* Locked Overlay */}
              {!unlocked && (
                <div className="absolute inset-0 bg-muted/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Complete previous level</p>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LevelSelect;