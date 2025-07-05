import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
  loadingText?: string
  successState?: boolean
  successDuration?: number
}

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ 
    className, 
    children, 
    loading = false, 
    loadingText, 
    successState = false,
    successDuration = 2000,
    disabled,
    onClick,
    ...props 
  }, ref) => {
    const [showSuccess, setShowSuccess] = React.useState(false)
    const [isProcessing, setIsProcessing] = React.useState(false)

    React.useEffect(() => {
      if (successState && !showSuccess) {
        setShowSuccess(true)
        setIsProcessing(false)
        
        const timer = setTimeout(() => {
          setShowSuccess(false)
        }, successDuration)
        
        return () => clearTimeout(timer)
      }
    }, [successState, showSuccess, successDuration])

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || isProcessing || showSuccess) return
      
      setIsProcessing(true)
      
      try {
        await onClick?.(event)
      } finally {
        // Don't immediately reset processing state - let successState handle it
        if (!successState) {
          setTimeout(() => setIsProcessing(false), 100)
        }
      }
    }

    const isDisabled = disabled || loading || isProcessing || showSuccess

    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          (isProcessing || loading) && "cursor-wait",
          showSuccess && "bg-success hover:bg-success text-success-foreground",
          className
        )}
        disabled={isDisabled}
        onClick={handleClick}
        {...props}
      >
        {/* Content */}
        <span className={cn(
          "flex items-center justify-center gap-2 transition-all duration-200",
          (loading || isProcessing) && "opacity-0"
        )}>
          {children}
        </span>

        {/* Loading State */}
        {(loading || isProcessing) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {loadingText && <span>{loadingText}</span>}
          </div>
        )}

        {/* Success State */}
        {showSuccess && (
          <div className="absolute inset-0 flex items-center justify-center animate-scale-in">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Success!</span>
          </div>
        )}

        {/* Ripple Effect */}
        {(isProcessing || loading) && (
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        )}
      </Button>
    )
  }
)

LoadingButton.displayName = "LoadingButton"