import { useState, useEffect } from 'react'

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

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Getting Started',
    content: 'Welcome to the Ministry of Silly Walks! This is where you\'ll design the most absurdly wonderful walking algorithms. The physics canvas on the left shows your creation in action, while the Walk-gorithm Editor on the right lets you fine-tune every detail.',
    action: {
      type: 'observe',
      element: 'physics-canvas',
      description: 'Take a moment to observe the physics simulation area'
    }
  },
  {
    id: 'editor',
    title: 'Walk Editor',
    content: 'The Walk-gorithm Editor is your creative workshop. Use the sliders to adjust hip and knee movements, timing, and style. Each parameter affects how your walker moves through the world.',
    action: {
      type: 'hover',
      element: 'walk-editor',
      description: 'Hover over the Walk Editor to see the controls'
    }
  },
  {
    id: 'preview',
    title: 'Live Preview',
    content: 'Click the "Walk!" button to see your creation in motion. You can adjust parameters in real-time and watch the effects immediately. The physics simulation responds to every change!',
    action: {
      type: 'click',
      element: 'play-button',
      description: 'Try clicking the Walk! button to start the preview'
    }
  },
  {
    id: 'testing',
    title: 'Testing Your Walk',
    content: 'Once you\'re happy with your walk, click "Test Walk!" to try it on various challenging levels. Each level tests different aspects of your walking algorithm - from icy surfaces to obstacle courses!',
    action: {
      type: 'observe',
      element: 'test-button',
      description: 'The Test Walk button takes you to level selection'
    }
  }
]

const TUTORIAL_STORAGE_KEY = 'ministry-tutorial-completed'

export const useTutorial = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)

  useEffect(() => {
    const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY)
    if (!completed) {
      // Show tutorial for first-time users
      setTimeout(() => setIsOpen(true), 1000)
    } else {
      setHasCompleted(true)
    }
  }, [])

  const startTutorial = () => {
    setIsOpen(true)
  }

  const completeTutorial = () => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true')
    setHasCompleted(true)
    setIsOpen(false)
  }

  const resetTutorial = () => {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY)
    setHasCompleted(false)
  }

  return {
    isOpen,
    hasCompleted,
    steps: TUTORIAL_STEPS,
    startTutorial,
    completeTutorial,
    resetTutorial,
    closeTutorial: () => setIsOpen(false)
  }
}