import { WalkParameters } from '@/types/walk';
import { EnhancedSlider } from '@/components/ui/enhanced-slider';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { FloatingTooltip } from '@/components/ui/floating-tooltip';
import { Play, Pause, RotateCcw, Eye, EyeOff, Info } from 'lucide-react';
import { VisualTimeline } from './VisualTimeline';
import { WalkTemplates } from './WalkTemplates';
import { ParameterVisualizer } from './ParameterVisualizer';
import { useState, useCallback, useEffect } from 'react';

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [previewValues, setPreviewValues] = useState<Partial<WalkParameters>>({});
  
  const updateParameter = useCallback((key: keyof WalkParameters, value: number | [number, number]) => {
    onParametersChange({
      ...parameters,
      [key]: value
    });
  }, [parameters, onParametersChange]);

  const handleParameterPreview = useCallback((key: keyof WalkParameters, value: number[]) => {
    setPreviewValues(prev => ({
      ...prev,
      [key]: Array.isArray(parameters[key]) ? value : value[0]
    }));
  }, [parameters]);

  const handleReset = async () => {
    onReset();
    setResetSuccess(true);
    
    // Reset success state after delay
    setTimeout(() => setResetSuccess(false), 2000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case ' ': // Space
            e.preventDefault();
            onPlayToggle();
            break;
          case 'r': // Ctrl+R
            e.preventDefault();
            handleReset();
            break;
          case 'a': // Ctrl+A
            e.preventDefault();
            setShowAdvanced(!showAdvanced);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayToggle, handleReset, showAdvanced]);

  return (
    <div className="workshop-panel p-6 space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-3">
          <h2 className="heading-secondary">
            Walk-gorithm Editor
          </h2>
          <FloatingTooltip 
            content={
              <div className="space-y-2">
                <div className="font-semibold">Keyboard Shortcuts:</div>
                <div className="text-xs space-y-1">
                  <div><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Space</kbd> Play/Pause</div>
                  <div><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+R</kbd> Reset</div>
                  <div><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+A</kbd> Toggle Advanced</div>
                </div>
              </div>
            }
          >
            <Info className="w-4 h-4 text-muted-foreground hover:text-primary cursor-help transition-colors" />
          </FloatingTooltip>
        </div>
        <div className="flex gap-2">
          <LoadingButton
            onClick={() => {
              onPlayToggle();
              // Play UI click sound
              import('@/lib/audio').then(({ audioManager }) => {
                audioManager.playClick();
              });
            }}
            className="silly-button hover-lift"
            size="sm"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Walk!'}
          </LoadingButton>
          <LoadingButton
            onClick={handleReset}
            className="button-ghost hover-lift"
            size="sm"
            successState={resetSuccess}
            loadingText="Resetting..."
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </LoadingButton>
        </div>
      </div>

      {/* Enhanced Controls Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 animate-fade-in-up [animation-delay:0.1s]">
        <VisualTimeline 
          parameters={{ ...parameters, ...previewValues }}
          isPlaying={isPlaying}
          onPlayToggle={onPlayToggle}
        />
        <WalkTemplates 
          currentParameters={parameters}
          onParametersChange={onParametersChange}
        />
        <ParameterVisualizer 
          parameters={{ ...parameters, ...previewValues }}
          isRealTime={Object.keys(previewValues).length > 0}
        />
      </div>

      {/* Advanced Toggle */}
      <div className="flex justify-center animate-fade-in-up [animation-delay:0.2s]">
        <LoadingButton
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="button-ghost hover-lift"
        >
          {showAdvanced ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {showAdvanced ? 'Hide' : 'Show'} Advanced Parameters
        </LoadingButton>
      </div>

      {showAdvanced && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="feature-panel p-6 space-y-6 hover-lift">
          <h3 className="heading-secondary text-primary flex items-center gap-2">
            🦵 Hip Movement
          </h3>
          
          <div className="space-y-6">
            <EnhancedSlider
              label="Hip Speed"
              unit=""
              value={[parameters.hipSpeed]}
              onValueChange={([value]) => updateParameter('hipSpeed', value)}
              onValuePreview={(value) => handleParameterPreview('hipSpeed', value)}
              min={0.1}
              max={8}
              step={0.1}
              gradientTrack
              showTicks
              tickCount={8}
            />
            
            <div className="space-y-4">
              <Label className="text-sm font-medium">Hip Angle Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <EnhancedSlider
                  label="Min Angle"
                  unit="°"
                  value={[parameters.hipAngleRange[0]]}
                  onValueChange={([value]) => updateParameter('hipAngleRange', [value, parameters.hipAngleRange[1]])}
                  onValuePreview={(value) => handleParameterPreview('hipAngleRange', [value[0], parameters.hipAngleRange[1]])}
                  min={-90}
                  max={0}
                  step={5}
                  gradientTrack
                />
                <EnhancedSlider
                  label="Max Angle"
                  unit="°"
                  value={[parameters.hipAngleRange[1]]}
                  onValueChange={([value]) => updateParameter('hipAngleRange', [parameters.hipAngleRange[0], value])}
                  onValuePreview={(value) => handleParameterPreview('hipAngleRange', [parameters.hipAngleRange[0], value[0]])}
                  min={0}
                  max={90}
                  step={5}
                  gradientTrack
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="feature-panel p-6 space-y-6 hover-lift">
          <h3 className="heading-secondary text-secondary flex items-center gap-2">
            🦵 Knee Movement
          </h3>
          
          <div className="space-y-6">
            <EnhancedSlider
              label="Knee Speed"
              unit=""
              value={[parameters.kneeSpeed]}
              onValueChange={([value]) => updateParameter('kneeSpeed', value)}
              onValuePreview={(value) => handleParameterPreview('kneeSpeed', value)}
              min={0.1}
              max={8}
              step={0.1}
              gradientTrack
              showTicks
              tickCount={8}
            />
            
            <div className="space-y-4">
              <Label className="text-sm font-medium">Knee Angle Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <EnhancedSlider
                  label="Min Angle"
                  unit="°"
                  value={[parameters.kneeAngleRange[0]]}
                  onValueChange={([value]) => updateParameter('kneeAngleRange', [value, parameters.kneeAngleRange[1]])}
                  onValuePreview={(value) => handleParameterPreview('kneeAngleRange', [value[0], parameters.kneeAngleRange[1]])}
                  min={-10}
                  max={45}
                  step={5}
                  gradientTrack
                />
                <EnhancedSlider
                  label="Max Angle"
                  unit="°"
                  value={[parameters.kneeAngleRange[1]]}
                  onValueChange={([value]) => updateParameter('kneeAngleRange', [parameters.kneeAngleRange[0], value])}
                  onValuePreview={(value) => handleParameterPreview('kneeAngleRange', [parameters.kneeAngleRange[0], value[0]])}
                  min={45}
                  max={120}
                  step={5}
                  gradientTrack
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="feature-panel p-6 space-y-6 hover-lift">
          <h3 className="heading-secondary text-accent flex items-center gap-2">
            ⏱️ Timing & Style
          </h3>
          
          <div className="space-y-6">
            <EnhancedSlider
              label="Step Interval"
              unit="s"
              value={[parameters.stepInterval]}
              onValueChange={([value]) => updateParameter('stepInterval', value)}
              onValuePreview={(value) => handleParameterPreview('stepInterval', value)}
              min={0.3}
              max={3}
              step={0.1}
              gradientTrack
              showTicks
              tickCount={6}
            />
            
            <EnhancedSlider
              label="Bounce Intensity"
              unit=""
              value={[parameters.bounceIntensity]}
              onValueChange={([value]) => updateParameter('bounceIntensity', value)}
              onValuePreview={(value) => handleParameterPreview('bounceIntensity', value)}
              min={0}
              max={2}
              step={0.1}
              gradientTrack
              showTicks
              tickCount={4}
            />
          </div>
        </Card>

        <Card className="feature-panel p-6 space-y-6 hover-lift">
          <h3 className="heading-secondary text-muted-foreground flex items-center gap-2">
            ⚙️ Advanced
          </h3>
          
          <div className="space-y-6">
            <EnhancedSlider
              label="Arm Swing"
              unit=""
              value={[parameters.armSwing]}
              onValueChange={([value]) => updateParameter('armSwing', value)}
              onValuePreview={(value) => handleParameterPreview('armSwing', value)}
              min={0}
              max={1}
              step={0.1}
              gradientTrack
              showTicks
              tickCount={5}
            />
            
            <EnhancedSlider
              label="Hip Phase Offset"
              unit="π"
              value={[parameters.hipPhaseOffset]}
              onValueChange={([value]) => updateParameter('hipPhaseOffset', value)}
              onValuePreview={(value) => handleParameterPreview('hipPhaseOffset', value)}
              min={0}
              max={2 * Math.PI}
              step={0.1}
              gradientTrack
              showTicks
              tickCount={4}
            />
          </div>
        </Card>
          </div>
        </div>
      )}
    </div>
  );
};