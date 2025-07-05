import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

export interface EnhancedSliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string
  unit?: string
  showValue?: boolean
  showTicks?: boolean
  tickCount?: number
  gradientTrack?: boolean
  onValuePreview?: (value: number[]) => void
}

const EnhancedSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  EnhancedSliderProps
>(({ 
  className, 
  label, 
  unit = "", 
  showValue = true, 
  showTicks = false,
  tickCount = 5,
  gradientTrack = false,
  onValuePreview,
  ...props 
}, ref) => {
  const [isHovering, setIsHovering] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [previewValue, setPreviewValue] = React.useState<number[]>()

  const currentValue = previewValue || props.value || props.defaultValue || [0]
  const displayValue = currentValue[0]

  const handleValueChange = (value: number[]) => {
    setPreviewValue(value)
    onValuePreview?.(value)
  }

  const handleValueCommit = (value: number[]) => {
    setPreviewValue(undefined)
    props.onValueChange?.(value)
    setIsDragging(false)
  }

  const renderTicks = () => {
    if (!showTicks || !props.min || !props.max) return null
    
    const min = props.min
    const max = props.max
    const ticks = []
    
    for (let i = 0; i <= tickCount; i++) {
      const value = min + (max - min) * (i / tickCount)
      const position = (i / tickCount) * 100
      
      ticks.push(
        <div
          key={i}
          className="absolute w-0.5 h-2 bg-muted-foreground/30 -translate-x-0.5"
          style={{ left: `${position}%`, top: '100%' }}
        />
      )
    }
    
    return <div className="absolute inset-x-0 top-0">{ticks}</div>
  }

  return (
    <div className="space-y-3">
      {/* Label and Value Display */}
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-sm font-medium text-foreground">
              {label}
            </label>
          )}
          {showValue && (
            <div className={cn(
              "text-mono text-primary font-semibold transition-all duration-200",
              isDragging && "scale-110 text-primary-glow"
            )}>
              {displayValue.toFixed(1)}{unit}
            </div>
          )}
        </div>
      )}

      {/* Slider Container */}
      <div 
        className="relative py-3"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <SliderPrimitive.Root
          ref={ref}
          className={cn(
            "relative flex w-full touch-none select-none items-center group",
            className
          )}
          onValueChange={handleValueChange}
          onValueCommit={handleValueCommit}
          onPointerDown={() => setIsDragging(true)}
          {...props}
        >
          <SliderPrimitive.Track 
            className={cn(
              "relative h-3 w-full grow overflow-hidden rounded-full transition-all duration-200",
              gradientTrack 
                ? "bg-gradient-to-r from-muted via-muted-darker to-muted" 
                : "bg-muted",
              isHovering && "h-4 shadow-soft"
            )}
          >
            <SliderPrimitive.Range 
              className={cn(
                "absolute h-full transition-all duration-200",
                gradientTrack 
                  ? "bg-gradient-to-r from-primary to-primary-glow" 
                  : "bg-primary",
                isDragging && "bg-gradient-to-r from-primary-glow to-primary animate-pulse"
              )} 
            />
          </SliderPrimitive.Track>
          
          <SliderPrimitive.Thumb 
            className={cn(
              "block h-6 w-6 rounded-full border-3 border-primary bg-background shadow-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              "hover:border-primary-glow hover:shadow-glow hover:scale-110",
              isDragging && "scale-125 border-primary-glow shadow-glow animate-gentle-bounce",
              isHovering && "shadow-glow"
            )} 
          />
          
          {renderTicks()}
        </SliderPrimitive.Root>

        {/* Hover Value Preview */}
        {isHovering && !isDragging && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full">
            <div className="bg-popover text-popover-foreground px-2 py-1 rounded-md text-xs font-medium shadow-medium animate-fade-in">
              {displayValue.toFixed(1)}{unit}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

EnhancedSlider.displayName = "EnhancedSlider"

export { EnhancedSlider }