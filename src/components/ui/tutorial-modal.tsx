import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { ArrowRight, ArrowLeft, Play, Settings, Trophy } from "lucide-react"

interface TutorialStep {
  id: string
  title: string
  content: string
  target?: string
  highlight?: boolean
  action?: {
    type: 'click' | 'hover' | 'observe'
    element: string
    description: string
  }
}

interface TutorialModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  steps: TutorialStep[]
}

export const TutorialModal = ({
  isOpen,
  onClose,
  onComplete,
  steps
}: TutorialModalProps) => {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isCompleted, setIsCompleted] = React.useState(false)

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsCompleted(true)
      setTimeout(() => {
        onComplete()
        onClose()
      }, 1500)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  const current = steps[currentStep]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-sm border-primary/20">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome to the Ministry of Silly Walks!
            </DialogTitle>
            <Badge variant="outline" className="text-xs">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="w-full h-2 mt-4" />
        </DialogHeader>

        {isCompleted ? (
          <div className="text-center py-8 animate-fade-in">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-xl font-semibold mb-2">Tutorial Complete!</h3>
            <p className="text-muted-foreground">
              You're now ready to create magnificent silly walks!
            </p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                {current?.title === "Getting Started" && <Play className="w-5 h-5 text-primary" />}
                {current?.title === "Walk Editor" && <Settings className="w-5 h-5 text-secondary" />}
                {current?.title === "Testing Your Walk" && <Trophy className="w-5 h-5 text-accent" />}
                {current?.title}
              </h3>
              
              <div className="bg-muted/50 rounded-lg p-4 border border-muted">
                <p className="text-foreground leading-relaxed">
                  {current?.content}
                </p>
              </div>

              {current?.action && (
                <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      Try This
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {current.action.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-muted">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip Tutorial
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <Button
                  onClick={handleNext}
                  className="silly-button"
                  size="sm"
                >
                  {currentStep === steps.length - 1 ? 'Complete!' : 'Next'}
                  {currentStep !== steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}