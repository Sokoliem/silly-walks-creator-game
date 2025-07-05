import { WalkParameters } from '@/types/walk';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface WalkEditorProps {
  parameters: WalkParameters;
  onParametersChange: (params: WalkParameters) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onReset: () => void;
}

export const WalkEditor = ({ 
  parameters, 
  onParametersChange, 
  isPlaying, 
  onPlayToggle, 
  onReset 
}: WalkEditorProps) => {
  
  const updateParameter = (key: keyof WalkParameters, value: number | [number, number]) => {
    onParametersChange({
      ...parameters,
      [key]: value
    });
  };

  return (
    <div className="workshop-panel p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Walk-gorithm Editor
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              onPlayToggle();
              // Play UI click sound
              import('@/lib/audio').then(({ audioManager }) => {
                audioManager.playClick();
              });
            }}
            className="silly-button"
            size="sm"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Walk!'}
          </Button>
          <Button
            onClick={() => {
              onReset();
              // Play UI click sound
              import('@/lib/audio').then(({ audioManager }) => {
                audioManager.playClick();
              });
            }}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-lg text-primary">Hip Movement</h3>
          
          <div className="space-y-3">
            <div>
              <Label>Hip Speed: {parameters.hipSpeed.toFixed(1)}</Label>
              <Slider
                value={[parameters.hipSpeed]}
                onValueChange={([value]) => updateParameter('hipSpeed', value)}
                min={0.1}
                max={8}
                step={0.1}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Hip Angle Range: [{parameters.hipAngleRange[0]}°, {parameters.hipAngleRange[1]}°]</Label>
              <div className="flex gap-2 mt-2">
                <Slider
                  value={[parameters.hipAngleRange[0]]}
                  onValueChange={([value]) => updateParameter('hipAngleRange', [value, parameters.hipAngleRange[1]])}
                  min={-90}
                  max={0}
                  step={5}
                  className="flex-1"
                />
                <Slider
                  value={[parameters.hipAngleRange[1]]}
                  onValueChange={([value]) => updateParameter('hipAngleRange', [parameters.hipAngleRange[0], value])}
                  min={0}
                  max={90}
                  step={5}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-lg text-secondary">Knee Movement</h3>
          
          <div className="space-y-3">
            <div>
              <Label>Knee Speed: {parameters.kneeSpeed.toFixed(1)}</Label>
              <Slider
                value={[parameters.kneeSpeed]}
                onValueChange={([value]) => updateParameter('kneeSpeed', value)}
                min={0.1}
                max={8}
                step={0.1}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Knee Angle Range: [{parameters.kneeAngleRange[0]}°, {parameters.kneeAngleRange[1]}°]</Label>
              <div className="flex gap-2 mt-2">
                <Slider
                  value={[parameters.kneeAngleRange[0]]}
                  onValueChange={([value]) => updateParameter('kneeAngleRange', [value, parameters.kneeAngleRange[1]])}
                  min={-10}
                  max={45}
                  step={5}
                  className="flex-1"
                />
                <Slider
                  value={[parameters.kneeAngleRange[1]]}
                  onValueChange={([value]) => updateParameter('kneeAngleRange', [parameters.kneeAngleRange[0], value])}
                  min={45}
                  max={120}
                  step={5}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-lg text-accent">Timing & Style</h3>
          
          <div className="space-y-3">
            <div>
              <Label>Step Interval: {parameters.stepInterval.toFixed(1)}s</Label>
              <Slider
                value={[parameters.stepInterval]}
                onValueChange={([value]) => updateParameter('stepInterval', value)}
                min={0.3}
                max={3}
                step={0.1}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Bounce Intensity: {parameters.bounceIntensity.toFixed(1)}</Label>
              <Slider
                value={[parameters.bounceIntensity]}
                onValueChange={([value]) => updateParameter('bounceIntensity', value)}
                min={0}
                max={2}
                step={0.1}
                className="mt-2"
              />
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-lg text-muted-foreground">Advanced</h3>
          
          <div className="space-y-3">
            <div>
              <Label>Arm Swing: {parameters.armSwing.toFixed(1)}</Label>
              <Slider
                value={[parameters.armSwing]}
                onValueChange={([value]) => updateParameter('armSwing', value)}
                min={0}
                max={1}
                step={0.1}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Hip Phase Offset: {(parameters.hipPhaseOffset / Math.PI).toFixed(1)}π</Label>
              <Slider
                value={[parameters.hipPhaseOffset]}
                onValueChange={([value]) => updateParameter('hipPhaseOffset', value)}
                min={0}
                max={2 * Math.PI}
                step={0.1}
                className="mt-2"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};