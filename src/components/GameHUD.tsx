import { useEffect, useState } from 'react';
import { Clock, Target, Trophy } from 'lucide-react';

interface GameHUDProps {
  startTime: number;
  distance: number;
  maxDistance: number;
  targetDistance: number;
  isActive: boolean;
  className?: string;
}

export const GameHUD = ({ 
  startTime, 
  distance, 
  maxDistance, 
  targetDistance,
  isActive,
  className = "" 
}: GameHUDProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min((maxDistance / targetDistance) * 100, 100);

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 ${className}`}>
      <div className="workshop-panel p-4">
        <div className="flex justify-between items-center gap-6">
          {/* Timer */}
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-lg font-mono font-semibold">
              {formatTime(elapsedTime)}
            </span>
          </div>

          {/* Distance Progress */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">
                Distance: {Math.round(maxDistance)}m / {targetDistance}m
              </span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Star Rating Preview */}
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-accent" />
            <div className="flex gap-1">
              {[1, 2, 3].map((star) => (
                <div
                  key={star}
                  className={`w-4 h-4 rounded-sm transition-colors ${
                    progressPercent >= star * 33.33 && elapsedTime <= 30
                      ? 'bg-primary'
                      : 'bg-muted/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};