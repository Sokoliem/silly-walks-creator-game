import { EnvironmentalEffect } from '@/types/level';
import { Cloud, CloudRain, CloudSnow, Wind } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface EnvironmentalIndicatorProps {
  effects: EnvironmentalEffect[];
}

export const EnvironmentalIndicator = ({ effects }: EnvironmentalIndicatorProps) => {
  if (!effects || effects.length === 0) return null;

  const getEffectIcon = (type: string) => {
    switch (type) {
      case 'wind':
        return <Wind className="w-4 h-4" />;
      case 'rain':
        return <CloudRain className="w-4 h-4" />;
      case 'snow':
        return <CloudSnow className="w-4 h-4" />;
      default:
        return <Cloud className="w-4 h-4" />;
    }
  };

  const getEffectColor = (type: string, intensity: number) => {
    const alpha = Math.min(intensity, 1);
    switch (type) {
      case 'wind':
        return `rgba(135, 206, 235, ${alpha})`;
      case 'rain':
        return `rgba(70, 130, 180, ${alpha})`;
      case 'snow':
        return `rgba(255, 255, 255, ${alpha})`;
      default:
        return `rgba(128, 128, 128, ${alpha})`;
    }
  };

  return (
    <Card className="p-3 mb-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Weather:</span>
        <div className="flex gap-2">
          {effects.map((effect, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-sm"
              style={{ 
                backgroundColor: getEffectColor(effect.type, effect.intensity),
                color: effect.type === 'snow' ? '#333' : '#fff'
              }}
            >
              {getEffectIcon(effect.type)}
              <span className="capitalize">{effect.type}</span>
              <span className="text-xs">
                {Math.round(effect.intensity * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};