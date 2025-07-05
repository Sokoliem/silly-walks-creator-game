import { WalkParameters } from '@/types/walk';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ParameterVisualizerProps {
  parameters: WalkParameters;
}

export const ParameterVisualizer = ({ parameters }: ParameterVisualizerProps) => {
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

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold text-lg text-accent">Parameter Overview</h3>
      
      <div className="space-y-3">
        {/* Speed Indicators */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Movement Speeds</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Hip Speed</span>
                <span>{parameters.hipSpeed.toFixed(1)}</span>
              </div>
              <Progress 
                value={(parameters.hipSpeed / 8) * 100} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Knee Speed</span>
                <span>{parameters.kneeSpeed.toFixed(1)}</span>
              </div>
              <Progress 
                value={(parameters.kneeSpeed / 8) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </div>

        {/* Range Visualizers */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Movement Ranges</div>
          
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
        <div className="space-y-2">
          <div className="text-sm font-medium">Style Characteristics</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-muted/50 rounded">
              <div className="text-xs text-muted-foreground">Timing</div>
              <div className="text-sm font-semibold">{parameters.stepInterval.toFixed(1)}s</div>
            </div>
            <div className="p-2 bg-muted/50 rounded">
              <div className="text-xs text-muted-foreground">Bounce</div>
              <div className="text-sm font-semibold">{parameters.bounceIntensity.toFixed(1)}</div>
            </div>
            <div className="p-2 bg-muted/50 rounded">
              <div className="text-xs text-muted-foreground">Arms</div>
              <div className="text-sm font-semibold">{parameters.armSwing.toFixed(1)}</div>
            </div>
          </div>
        </div>

        {/* Walk Style Assessment */}
        <div className="p-3 bg-gradient-primary/10 rounded-lg border border-primary/20">
          <div className="text-sm font-medium text-primary mb-1">Walk Style Analysis</div>
          <div className="text-xs text-muted-foreground">
            {parameters.hipSpeed > 5 || parameters.kneeSpeed > 5 ? 'High Energy' : 
             parameters.bounceIntensity > 1.5 ? 'Bouncy & Fun' :
             parameters.stepInterval > 1.5 ? 'Slow & Deliberate' :
             'Balanced & Smooth'}
          </div>
        </div>
      </div>
    </Card>
  );
};