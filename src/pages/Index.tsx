import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalkEditor } from '@/components/WalkEditor';
import { PhysicsCanvas } from '@/components/PhysicsCanvas';
import { Button } from '@/components/ui/button';
import { DEFAULT_WALK_PARAMETERS, WalkParameters, CreatureBody } from '@/types/walk';
import { Sparkles, Share2, Trophy } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [walkParameters, setWalkParameters] = useState<WalkParameters>(DEFAULT_WALK_PARAMETERS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [creature, setCreature] = useState<CreatureBody | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleReset = () => {
    setWalkParameters(DEFAULT_WALK_PARAMETERS);
    setIsPlaying(false);
    
    // Reset creature position if canvas is available
    const canvas = canvasRef.current as any;
    if (canvas && canvas.resetCreature) {
      canvas.resetCreature();
    }
    
    toast("Walk reset to default parameters!");
  };

  const handleShare = () => {
    const walkData = btoa(JSON.stringify(walkParameters));
    navigator.clipboard.writeText(walkData);
    toast("Walk algorithm copied to clipboard! Share it with friends!");
  };

  const handleTestWalk = () => {
    navigate('/level-select', { state: { walkParameters } });
  };

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-silly-bounce">
          The Minister of Silly Walks
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Design the most ridiculous walking patterns using advanced Walk-gorithm technology! 
          Adjust joint motors, timing, and style to create your masterpiece of movement.
        </p>
        <div className="flex justify-center gap-4">
          <Button 
            onClick={handleTestWalk}
            className="silly-button"
            size="lg"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Test Walk!
          </Button>
          <Button 
            onClick={() => setIsPlaying(!isPlaying)}
            variant="outline"
            size="lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {isPlaying ? 'Stop Preview' : 'Preview Walk'}
          </Button>
          <Button 
            onClick={handleShare}
            variant="outline"
            size="lg"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Walk
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Physics Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <PhysicsCanvas
            walkParameters={walkParameters}
            isPlaying={isPlaying}
            onCreatureCreated={setCreature}
            className="h-[500px] relative"
          />
          
          <div className="text-center text-sm text-muted-foreground">
            Watch your silly walker attempt to traverse the world with your custom algorithm!
          </div>
        </div>

        {/* Walk Editor */}
        <div className="lg:col-span-1">
          <WalkEditor
            parameters={walkParameters}
            onParametersChange={setWalkParameters}
            isPlaying={isPlaying}
            onPlayToggle={() => setIsPlaying(!isPlaying)}
            onReset={handleReset}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto workshop-panel p-6">
        <h2 className="text-2xl font-bold mb-4 text-primary">How to Create Silly Walks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-semibold mb-2 text-secondary">🦵 Hip & Knee Controls</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Adjust speed to control how fast joints move</li>
              <li>• Set angle ranges for movement limits</li>
              <li>• Phase offset creates leg coordination</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-accent">🎨 Style Parameters</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Step interval controls overall walk timing</li>
              <li>• Bounce intensity adds torso movement</li>
              <li>• Arm swing adds upper body motion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
