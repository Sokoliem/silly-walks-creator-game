import { useState } from 'react';
import { WalkParameters } from '@/types/walk';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, Upload, Trash2, Bot, Zap, Waves } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalkTemplate {
  id: string;
  name: string;
  parameters: WalkParameters;
  description: string;
  icon: string;
}

interface WalkTemplatesProps {
  currentParameters: WalkParameters;
  onParametersChange: (params: WalkParameters) => void;
}

const DEFAULT_TEMPLATES: WalkTemplate[] = [
  {
    id: 'robot',
    name: 'Robot March',
    description: 'Stiff, mechanical walking style',
    icon: 'robot',
    parameters: {
      hipSpeed: 2.0,
      hipAngleRange: [-20, 20],
      kneeSpeed: 2.0,
      kneeAngleRange: [0, 90],
      stepInterval: 0.8,
      bounceIntensity: 0.2,
      armSwing: 0.3,
      hipPhaseOffset: 0,
      kneePhaseOffset: 0
    }
  },
  {
    id: 'dancer',
    name: 'Smooth Dancer',
    description: 'Fluid, graceful movement',
    icon: 'waves',
    parameters: {
      hipSpeed: 1.5,
      hipAngleRange: [-45, 45],
      kneeSpeed: 1.8,
      kneeAngleRange: [10, 120],
      stepInterval: 1.2,
      bounceIntensity: 1.5,
      armSwing: 0.8,
      hipPhaseOffset: Math.PI / 4,
      kneePhaseOffset: Math.PI / 6
    }
  },
  {
    id: 'energetic',
    name: 'High Energy',
    description: 'Fast, bouncy movement',
    icon: 'zap',
    parameters: {
      hipSpeed: 4.0,
      hipAngleRange: [-60, 60],
      kneeSpeed: 5.0,
      kneeAngleRange: [20, 110],
      stepInterval: 0.4,
      bounceIntensity: 2.0,
      armSwing: 1.0,
      hipPhaseOffset: Math.PI / 2,
      kneePhaseOffset: Math.PI / 3
    }
  }
];

export const WalkTemplates = ({ currentParameters, onParametersChange }: WalkTemplatesProps) => {
  const [templates, setTemplates] = useState<WalkTemplate[]>(() => {
    const saved = localStorage.getItem('walk-templates');
    return saved ? [...DEFAULT_TEMPLATES, ...JSON.parse(saved)] : DEFAULT_TEMPLATES;
  });
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const { toast } = useToast();

  const saveTemplate = () => {
    if (!newTemplateName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your walk template",
        variant: "destructive"
      });
      return;
    }

    const newTemplate: WalkTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      description: 'Custom walk style',
      icon: 'user',
      parameters: { ...currentParameters }
    };

    const customTemplates = templates.filter(t => !DEFAULT_TEMPLATES.some(dt => dt.id === t.id));
    const updatedCustom = [...customTemplates, newTemplate];
    
    setTemplates([...DEFAULT_TEMPLATES, ...updatedCustom]);
    localStorage.setItem('walk-templates', JSON.stringify(updatedCustom));
    
    setNewTemplateName('');
    setShowSaveForm(false);
    
    toast({
      title: "Template saved!",
      description: `"${newTemplate.name}" has been saved to your templates`,
    });

    // Play save sound
    import('@/lib/audio').then(({ audioManager }) => {
      audioManager.playClick();
    });
  };

  const loadTemplate = (template: WalkTemplate) => {
    onParametersChange(template.parameters);
    toast({
      title: "Template loaded!",
      description: `Applied "${template.name}" walk style`,
    });

    // Play load sound
    import('@/lib/audio').then(({ audioManager }) => {
      audioManager.playClick();
    });
  };

  const deleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    const customTemplates = updatedTemplates.filter(t => !DEFAULT_TEMPLATES.some(dt => dt.id === t.id));
    
    setTemplates(updatedTemplates);
    localStorage.setItem('walk-templates', JSON.stringify(customTemplates));
    
    toast({
      title: "Template deleted",
      description: "Walk template has been removed",
    });
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'robot': return <Bot className="w-4 h-4" />;
      case 'zap': return <Zap className="w-4 h-4" />;
      case 'waves': return <Waves className="w-4 h-4" />;
      default: return <Save className="w-4 h-4" />;
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-primary">Walk Templates</h3>
        <Button
          onClick={() => setShowSaveForm(!showSaveForm)}
          variant="outline"
          size="sm"
          className="hover-scale"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Current
        </Button>
      </div>

      {showSaveForm && (
        <div className="animate-fade-in space-y-2 p-3 bg-muted/50 rounded-lg">
          <Input
            placeholder="Enter template name..."
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveTemplate()}
          />
          <div className="flex gap-2">
            <Button onClick={saveTemplate} size="sm" className="flex-1">
              Save Template
            </Button>
            <Button 
              onClick={() => setShowSaveForm(false)} 
              variant="outline" 
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="text-primary">
                {getIcon(template.icon)}
              </div>
              <div>
                <div className="font-medium text-sm">{template.name}</div>
                <div className="text-xs text-muted-foreground">{template.description}</div>
              </div>
              {!DEFAULT_TEMPLATES.some(dt => dt.id === template.id) && (
                <Badge variant="secondary" className="text-xs">Custom</Badge>
              )}
            </div>
            
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                onClick={() => loadTemplate(template)}
                variant="ghost"
                size="sm"
                className="hover-scale"
              >
                <Upload className="w-3 h-3" />
              </Button>
              {!DEFAULT_TEMPLATES.some(dt => dt.id === template.id) && (
                <Button
                  onClick={() => deleteTemplate(template.id)}
                  variant="ghost"
                  size="sm"
                  className="hover-scale text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};