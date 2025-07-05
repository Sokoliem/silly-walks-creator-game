import * as React from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { WalkParameters } from "@/types/walk"
import { TrendingUp, TrendingDown, Zap, Target, Timer, Activity } from "lucide-react"

interface WalkAnalysis {
  efficiency: number
  stability: number
  speed: number
  style: number
  overall: number
  insights: string[]
  recommendations: string[]
}

interface PerformanceAnalyzerProps {
  parameters: WalkParameters
  isRealTime?: boolean
  className?: string
}

export const PerformanceAnalyzer = ({
  parameters,
  isRealTime = false,
  className
}: PerformanceAnalyzerProps) => {
  const [analysis, setAnalysis] = React.useState<WalkAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)

  // Analyze walk parameters and generate insights
  const analyzeWalk = React.useCallback((params: WalkParameters): WalkAnalysis => {
    // Efficiency calculation based on parameter harmony
    const hipKneeBalance = Math.abs(params.hipSpeed - params.kneeSpeed) / 8
    const efficiency = Math.max(0, 100 - (hipKneeBalance * 20))

    // Stability calculation based on angle ranges and timing
    const hipRange = params.hipAngleRange[1] - params.hipAngleRange[0]
    const kneeRange = params.kneeAngleRange[1] - params.kneeAngleRange[0]
    const stability = Math.max(0, 100 - ((hipRange + kneeRange) / 180 * 50))

    // Speed calculation based on speeds and step interval
    const avgSpeed = (params.hipSpeed + params.kneeSpeed) / 2
    const speedFactor = avgSpeed / params.stepInterval
    const speed = Math.min(100, speedFactor * 20)

    // Style calculation based on bounce, arm swing, and phase offset
    const styleFactor = (params.bounceIntensity + params.armSwing + (params.hipPhaseOffset / (2 * Math.PI))) / 3
    const style = styleFactor * 100

    // Overall score
    const overall = (efficiency + stability + speed + style) / 4

    // Generate insights
    const insights: string[] = []
    const recommendations: string[] = []

    if (efficiency < 50) {
      insights.push("Hip and knee speeds are imbalanced")
      recommendations.push("Try balancing hip and knee speeds for better coordination")
    }
    
    if (stability < 40) {
      insights.push("Wide angle ranges may cause instability")
      recommendations.push("Reduce angle ranges for more stable walking")
    }
    
    if (speed > 80) {
      insights.push("High-speed configuration detected")
      recommendations.push("Consider testing on speed-focused levels")
    }
    
    if (style > 70) {
      insights.push("Highly stylized walk pattern")
      recommendations.push("Perfect for entertainment-focused challenges")
    }

    if (params.stepInterval > 2) {
      insights.push("Slow, deliberate movement pattern")
      recommendations.push("Great for precision-based obstacles")
    }

    return {
      efficiency: Math.round(efficiency),
      stability: Math.round(stability),
      speed: Math.round(speed),
      style: Math.round(style),
      overall: Math.round(overall),
      insights,
      recommendations
    }
  }, [])

  React.useEffect(() => {
    setIsAnalyzing(true)
    
    const timer = setTimeout(() => {
      const newAnalysis = analyzeWalk(parameters)
      setAnalysis(newAnalysis)
      setIsAnalyzing(false)
    }, isRealTime ? 100 : 500)

    return () => clearTimeout(timer)
  }, [parameters, analyzeWalk, isRealTime])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 60) return "text-accent"
    if (score >= 40) return "text-secondary"
    return "text-muted-foreground"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: "Excellent", variant: "default" as const }
    if (score >= 60) return { label: "Good", variant: "secondary" as const }
    if (score >= 40) return { label: "Fair", variant: "outline" as const }
    return { label: "Needs Work", variant: "destructive" as const }
  }

  const ScoreDisplay = ({ 
    label, 
    value, 
    icon: Icon, 
    description 
  }: { 
    label: string
    value: number
    icon: React.ElementType
    description: string 
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={cn("text-sm font-bold", getScoreColor(value))}>
          {value}%
        </span>
      </div>
      <Progress value={value} className="h-2" />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )

  if (!analysis || isAnalyzing) {
    return (
      <Card className={cn("feature-panel p-4", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-2 bg-muted rounded"></div>
            <div className="h-2 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    )
  }

  const overallBadge = getScoreBadge(analysis.overall)

  return (
    <Card className={cn("feature-panel p-4 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Walk Analysis
        </h3>
        <Badge variant={overallBadge.variant}>
          {overallBadge.label}
        </Badge>
      </div>

      <div className="space-y-4">
        <ScoreDisplay
          label="Efficiency"
          value={analysis.efficiency}
          icon={Zap}
          description="How well your parameters work together"
        />
        
        <ScoreDisplay
          label="Stability"
          value={analysis.stability}
          icon={Target}
          description="Balance and control of movement"
        />
        
        <ScoreDisplay
          label="Speed"
          value={analysis.speed}
          icon={Timer}
          description="Overall movement velocity"
        />
        
        <ScoreDisplay
          label="Style"
          value={analysis.style}
          icon={TrendingUp}
          description="Uniqueness and flair factor"
        />
      </div>

      {analysis.insights.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-muted">
          <h4 className="text-sm font-medium text-muted-foreground">Insights</h4>
          <ul className="space-y-1">
            {analysis.insights.map((insight, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.recommendations.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-muted">
          <h4 className="text-sm font-medium text-primary">Recommendations</h4>
          <ul className="space-y-1">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="text-xs text-foreground flex items-start gap-2">
                <TrendingUp className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}