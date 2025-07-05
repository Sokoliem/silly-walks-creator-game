import * as React from "react"
import { cn } from "@/lib/utils"

interface FloatingTooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  delay?: number
  disabled?: boolean
  className?: string
}

export const FloatingTooltip = ({ 
  content, 
  children, 
  side = "top", 
  delay = 300,
  disabled = false,
  className 
}: FloatingTooltipProps) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const timeoutRef = React.useRef<NodeJS.Timeout>()
  const containerRef = React.useRef<HTMLDivElement>(null)

  const showTooltip = (event: React.MouseEvent) => {
    if (disabled) return
    
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
      
      let x = rect.left + rect.width / 2
      let y = rect.top
      
      switch (side) {
        case "top":
          y = rect.top - 10
          break
        case "bottom":
          y = rect.bottom + 10
          break
        case "left":
          x = rect.left - 10
          y = rect.top + rect.height / 2
          break
        case "right":
          x = rect.right + 10
          y = rect.top + rect.height / 2
          break
      }
      
      setPosition({ x, y })
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    clearTimeout(timeoutRef.current)
    setIsVisible(false)
  }

  React.useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="relative inline-block"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          className={cn(
            "fixed z-50 px-3 py-2 text-sm bg-popover text-popover-foreground border border-border rounded-lg shadow-strong pointer-events-none",
            "animate-fade-in",
            side === "top" && "-translate-x-1/2 -translate-y-full",
            side === "bottom" && "-translate-x-1/2 translate-y-0",
            side === "left" && "-translate-x-full -translate-y-1/2",
            side === "right" && "translate-x-0 -translate-y-1/2",
            className
          )}
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          {content}
          
          {/* Arrow */}
          <div
            className={cn(
              "absolute w-2 h-2 bg-popover border-border rotate-45",
              side === "top" && "bottom-[-4px] left-1/2 -translate-x-1/2 border-r border-b",
              side === "bottom" && "top-[-4px] left-1/2 -translate-x-1/2 border-l border-t",
              side === "left" && "right-[-4px] top-1/2 -translate-y-1/2 border-t border-r",
              side === "right" && "left-[-4px] top-1/2 -translate-y-1/2 border-b border-l"
            )}
          />
        </div>
      )}
    </>
  )
}