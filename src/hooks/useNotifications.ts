import { useState, useCallback } from 'react'

type NotificationType = 'achievement' | 'tip' | 'milestone' | 'warning' | 'success'

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

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      action?: {
        label: string
        onClick: () => void
      }
      autoHide?: boolean
      duration?: number
    }
  ) => {
    const id = `notification-${Date.now()}-${Math.random()}`
    
    const notification: NotificationData = {
      id,
      type,
      title,
      message,
      ...options
    }

    setNotifications(prev => [...prev, notification])
    
    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Helper methods for common notification types
  const showAchievement = useCallback((title: string, message: string) => {
    return addNotification('achievement', title, message, { duration: 6000 })
  }, [addNotification])

  const showTip = useCallback((title: string, message: string, action?: { label: string; onClick: () => void }) => {
    return addNotification('tip', title, message, { action, duration: 8000 })
  }, [addNotification])

  const showMilestone = useCallback((title: string, message: string) => {
    return addNotification('milestone', title, message, { duration: 5000 })
  }, [addNotification])

  const showSuccess = useCallback((title: string, message: string) => {
    return addNotification('success', title, message, { duration: 3000 })
  }, [addNotification])

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showAchievement,
    showTip,
    showMilestone,
    showSuccess
  }
}