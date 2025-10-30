'use client'

import { useState, useCallback } from 'react'

interface UseMultiStepFormOptions<T extends string> {
  steps: T[]
  initialStep?: number | T
  initialCompletedSteps?: Record<T, boolean>
  onStepChange?: (from: T, to: T) => void
}

export function useMultiStepForm<T extends string>({
  steps,
  initialStep = 0,
  initialCompletedSteps,
  onStepChange
}: UseMultiStepFormOptions<T>) {
  // Convert string initialStep to index
  const initialIndex = typeof initialStep === 'string' 
    ? steps.indexOf(initialStep)
    : initialStep;
  
  const [currentStepIndex, setCurrentStepIndex] = useState(initialIndex >= 0 ? initialIndex : 0)
  const [completedSteps, setCompletedSteps] = useState<Record<T, boolean>>(
    initialCompletedSteps || {} as Record<T, boolean>
  )

  const currentStep = steps[currentStepIndex]
  
  const goToNext = useCallback(() => {
    if (currentStepIndex >= steps.length - 1) return
    
    const from = steps[currentStepIndex]
    const to = steps[currentStepIndex + 1]
    
    setCurrentStepIndex(prev => prev + 1)
    setCompletedSteps(prev => ({ ...prev, [from]: true }))
    
    if (onStepChange) {
      onStepChange(from, to)
    }
  }, [currentStepIndex, onStepChange, steps])
  
  const goToPrevious = useCallback(() => {
    if (currentStepIndex <= 0) return
    
    const from = steps[currentStepIndex]
    const to = steps[currentStepIndex - 1]
    
    setCurrentStepIndex(prev => prev - 1)
    
    if (onStepChange) {
      onStepChange(from, to)
    }
  }, [currentStepIndex, onStepChange, steps])
  
  const goToStep = useCallback((stepOrIndex: number | T) => {
    const stepIndex = typeof stepOrIndex === 'string' 
      ? steps.indexOf(stepOrIndex)
      : stepOrIndex;
      
    if (stepIndex < 0 || stepIndex >= steps.length) return
    
    const from = steps[currentStepIndex]
    const to = steps[stepIndex]
    
    setCurrentStepIndex(stepIndex)
    
    if (onStepChange) {
      onStepChange(from, to)
    }
  }, [currentStepIndex, onStepChange, steps])
  
  const markStepComplete = useCallback((step: T) => {
    setCompletedSteps(prev => ({ ...prev, [step]: true }))
  }, [])
  
  const markStepIncomplete = useCallback((step: T) => {
    setCompletedSteps(prev => ({ ...prev, [step]: false }))
  }, [])
  
  const isStepComplete = useCallback((step: T) => {
    return completedSteps[step] === true
  }, [completedSteps])
  
  const resetForm = useCallback(() => {
    setCurrentStepIndex(0)
    setCompletedSteps({} as Record<T, boolean>)
  }, [])
  
  return {
    currentStep: steps[currentStepIndex],
    currentStepIndex,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === steps.length - 1,
    completedSteps,
    nextStep: goToNext,
    prevStep: goToPrevious,
    goToStep,
    markStepComplete,
    markStepIncomplete,
    isStepComplete,
    resetForm,
    stepProgress: (currentStepIndex + 1) / steps.length
  }
}