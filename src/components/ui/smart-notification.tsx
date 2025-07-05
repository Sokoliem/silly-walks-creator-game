import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Trophy, Lightbulb, Star, Timer } from "lucide-react"

type NotificationType = 'achievement' | 'tip' | 'milestone' | 'warning' | 'success'

interface SmartNotificationProps {
  id: string
  type: NotificationType
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  autoHide?: boolean
  duration?: number
  onDismiss: (id: string) => void
}

const typeConfig = {
  achievement: {
    icon: Trophy,
    colors: "bg-accent/90 border-accent text-accent-foreground",
    badge: "🏆 Achievement"
  },
  tip: {
    icon: Lightbulb,
    colors: "bg-primary/90 border-primary text-primary-foreground",
    badge: "💡 Tip"
  },
  milestone: {
    icon: Star,
    colors: "bg-secondary/90 border-secondary text-secondary-foreground",
    badge: "⭐ Milestone"
  },
  warning: {
    icon: Timer,
    colors: "bg-muted border-muted-foreground text-foreground",
    badge: "⚠️ Notice"
  },
  success: {
    icon: Star,
    colors: "bg-success border-success text-success-foreground",
    badge: "✅ Success"
  }
}

export const SmartNotification = ({
  id,
  type,
  title,
  message,
  action,
  autoHide = true,
  duration = 5000,
  onDismiss
}: SmartNotificationProps) => {
  const [isVisible, setIsVisible] = React.useState(true)
  const [isLeaving, setIsLeaving] = React.useState(false)

  const config = typeConfig[type]
  const Icon = config.icon

  React.useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [autoHide, duration])

  const handleDismiss = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setIsVisible(false)
      onDismiss(id)
    }, 200)
  }

  if (!isVisible) return null

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 w-80 rounded-lg border backdrop-blur-sm shadow-strong transition-all duration-200",
      config.colors,
      isLeaving && "translate-x-full opacity-0",
      !isLeaving && "animate-slide-in-right"
    )}>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 flex-shrink-0" />
            <Badge variant="secondary" className="text-xs">
              {config.badge}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">
            {title}
          </h4>
          <p className="text-sm opacity-90 leading-relaxed">
            {message}
          </p>
        </div>

        {action && (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                action.onClick()
                handleDismiss()
              }}
              className="bg-white/20 hover:bg-white/30 text-current border-white/20"
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Notification Manager Component
interface NotificationData {
  id: string
  type: NotificationType
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  autoHide?: boolean
  duration?: number
}

interface NotificationManagerProps {
  notifications: NotificationData[]
  onDismiss: (id: string) => void
}

export const NotificationManager = ({
  notifications,
  onDismiss
}: NotificationManagerProps) => {
  return (
    <div className="fixed top-0 right-0 z-50 space-y-2 p-4">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            animationDelay: `${index * 100}ms`
          }}
        >
          <SmartNotification
            {...notification}
            onDismiss={onDismiss}
          />
        </div>
      ))}
    </div>
  )
}