import { useEffect, useRef, useState } from 'react';
import { WalkParameters } from '@/types/walk';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

interface VisualTimelineProps {
  parameters: WalkParameters;
  isPlaying: boolean;
  onPlayToggle: () => void;
}

export const VisualTimeline = ({ parameters, isPlaying, onPlayToggle }: VisualTimelineProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawTimeline = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      
      // Draw timeline background
      ctx.fillStyle = 'hsl(var(--muted))';
      ctx.fillRect(0, centerY - 2, width, 4);
      
      // Draw time markers
      ctx.fillStyle = 'hsl(var(--muted-foreground))';
      ctx.font = '12px system-ui';
      for (let i = 0; i <= 10; i++) {
        const x = (i / 10) * width;
        ctx.fillRect(x - 1, centerY - 8, 2, 16);
        ctx.fillText(`${i}s`, x - 8, centerY + 28);
      }
      
      // Calculate sine waves for different parameters
      const timeScale = width / 10; // 10 seconds visible
      
      // Hip movement wave
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const t = x / timeScale;
        const hipAngle = Math.sin(t * parameters.hipSpeed + parameters.hipPhaseOffset) * 
          (parameters.hipAngleRange[1] - parameters.hipAngleRange[0]) / 2;
        const y = centerY - 60 + hipAngle * 0.5;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // Knee movement wave
      ctx.strokeStyle = 'hsl(var(--secondary))';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const t = x / timeScale;
        const kneeAngle = Math.sin(t * parameters.kneeSpeed) * 
          (parameters.kneeAngleRange[1] - parameters.kneeAngleRange[0]) / 2;
        const y = centerY + 60 + kneeAngle * 0.3;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // Draw current time indicator
      const currentX = (time % 10) * timeScale;
      ctx.strokeStyle = 'hsl(var(--accent))';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(currentX, 20);
      ctx.lineTo(currentX, height - 20);
      ctx.stroke();
      
      // Add labels
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText('Hip Movement', 10, 30);
      ctx.fillText('Knee Movement', 10, height - 10);
    };

    const animate = () => {
      if (isPlaying) {
        setCurrentTime(prev => prev + 0.016); // 60fps
        drawTimeline(currentTime);
        animationRef.current = requestAnimationFrame(animate);
      } else {
        drawTimeline(currentTime);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [parameters, isPlaying, currentTime]);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-accent">Visual Timeline</h3>
        <Button
          onClick={onPlayToggle}
          variant="outline"
          size="sm"
          className="hover-scale"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
      </div>
      
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="w-full border border-border rounded-lg bg-background"
        style={{ maxHeight: '200px' }}
      />
      
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Time: {currentTime.toFixed(1)}s</span>
        <span>Step Interval: {parameters.stepInterval.toFixed(1)}s</span>
      </div>
    </Card>
  );
};