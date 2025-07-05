import { WalkParameters } from '@/types/walk';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap, Clock, Waves } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParameterVisualizerProps {
  parameters: WalkParameters;
  isRealTime?: boolean;
}

export const ParameterVisualizer = ({ parameters, isRealTime = false }: ParameterVisualizerProps) => {
  const getIntensityColor = (value: number, max: number) => {
    const intensity = value / max;
    if (intensity > 0.8) return 'bg-destructive';
    if (intensity > 0.6) return 'bg-accent';
    if (intensity > 0.4) return 'bg-primary';
    return 'bg-secondary';
  };

  const visualizeRange = (range: [number, number], min: number, max: number) => {
    const total = max - min;
    const start = ((range[0] - min) / total) * 100;
    const width = ((range[1] - range[0]) / total) * 100;
    
    return { start, width };
  };

  const getWalkStyle = () => {
    if (parameters.hipSpeed > 5 || parameters.kneeSpeed > 5) return { name: 'High Energy', icon: Zap, color: 'text-accent' };
    if (parameters.bounceIntensity > 1.5) return { name: 'Bouncy & Fun', icon: TrendingUp, color: 'text-primary' };
    if (parameters.stepInterval > 1.5) return { name: 'Slow & Deliberate', icon: Clock, color: 'text-secondary' };
    return { name: 'Balanced & Smooth', icon: Waves, color: 'text-muted-foreground' };
  };

  const walkStyle = getWalkStyle();

  return (
    <Card className={cn(
      "feature-panel p-6 space-y-6 transition-all duration-300",
      isRealTime && "border-primary/50 shadow-glow animate-pulse"
    )}>
      <div className="flex items-center justify-between">
        <h3 className="heading-secondary text-accent">Parameter Overview</h3>
        {isRealTime && (
          <Badge variant="secondary" className="animate-pulse">
            Live Preview
          </Badge>
        )}
      </div>
      
      <div className="space-y-6">
        {/* Speed Indicators */}
        <div className="space-y-4">
          <div className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            Movement Speeds
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Hip Speed</span>
                <span className={cn(
                  "font-mono font-semibold transition-all duration-200",
                  isRealTime && "text-primary animate-pulse"
                )}>
                  {parameters.hipSpeed.toFixed(1)}
                </span>
              </div>
              <Progress 
                value={(parameters.hipSpeed / 8) * 100} 
                className={cn(
                  "h-3 transition-all duration-300",
                  isRealTime && "animate-pulse"
                )}
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Knee Speed</span>
                <span className={cn(
                  "font-mono font-semibold transition-all duration-200",
                  isRealTime && "text-secondary animate-pulse"
                )}>
                  {parameters.kneeSpeed.toFixed(1)}
                </span>
              </div>
              <Progress 
                value={(parameters.kneeSpeed / 8) * 100} 
                className={cn(
                  "h-3 transition-all duration-300",
                  isRealTime && "animate-pulse"
                )}
              />
            </div>
          </div>
        </div>

        {/* Range Visualizers */}
        <div className="space-y-4">
          <div className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Movement Ranges
          </div>
          
          {/* Hip Angle Range */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Hip Range</span>
              <span>[{parameters.hipAngleRange[0]}°, {parameters.hipAngleRange[1]}°]</span>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              {(() => {
                const { start, width } = visualizeRange(parameters.hipAngleRange, -90, 90);
                return (
                  <div 
                    className="absolute h-full bg-primary rounded-full"
                    style={{ 
                      left: `${start}%`, 
                      width: `${width}%` 
                    }}
                  />
                );
              })()}
            </div>
          </div>

          {/* Knee Angle Range */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Knee Range</span>
              <span>[{parameters.kneeAngleRange[0]}°, {parameters.kneeAngleRange[1]}°]</span>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              {(() => {
                const { start, width } = visualizeRange(parameters.kneeAngleRange, -10, 120);
                return (
                  <div 
                    className="absolute h-full bg-secondary rounded-full"
                    style={{ 
                      left: `${start}%`, 
                      width: `${width}%` 
                    }}
                  />
                );
              })()}
            </div>
          </div>
        </div>

        {/* Style Metrics */}
        <div className="space-y-4">
          <div className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-secondary" />
            Style Characteristics
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className={cn(
              "p-3 bg-gradient-subtle rounded-lg text-center transition-all duration-200 hover-lift",
              isRealTime && "animate-pulse border border-primary/20"
            )}>
              <div className="text-xs text-muted-foreground mb-1">Timing</div>
              <div className="text-mono text-secondary font-bold">
                {parameters.stepInterval.toFixed(1)}s
              </div>
            </div>
            <div className={cn(
              "p-3 bg-gradient-subtle rounded-lg text-center transition-all duration-200 hover-lift",
              isRealTime && "animate-pulse border border-primary/20"
            )}>
              <div className="text-xs text-muted-foreground mb-1">Bounce</div>
              <div className="text-mono text-primary font-bold">
                {parameters.bounceIntensity.toFixed(1)}
              </div>
            </div>
            <div className={cn(
              "p-3 bg-gradient-subtle rounded-lg text-center transition-all duration-200 hover-lift",
              isRealTime && "animate-pulse border border-primary/20"
            )}>
              <div className="text-xs text-muted-foreground mb-1">Arms</div>
              <div className="text-mono text-accent font-bold">
                {parameters.armSwing.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Walk Style Assessment */}
        <div className={cn(
          "p-4 bg-gradient-primary/10 rounded-xl border border-primary/20 transition-all duration-300",
          isRealTime && "border-primary/40 shadow-glow animate-pulse"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <walkStyle.icon className={cn("w-4 h-4", walkStyle.color)} />
            <div className="text-sm font-semibold text-primary">Walk Style Analysis</div>
          </div>
          <div className="flex items-center justify-between">
            <div className={cn("text-sm font-medium", walkStyle.color)}>
              {walkStyle.name}
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs transition-all duration-200",
                isRealTime && "animate-bounce"
              )}
            >
              {isRealTime ? 'Updating...' : 'Current Style'}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};