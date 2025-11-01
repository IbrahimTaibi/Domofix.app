import { renderHook, act } from '@testing-library/react'
import { useMultiStepForm } from '@/hooks/use-multi-step-form'

describe('useMultiStepForm', () => {
  const steps = ['personal', 'address', 'review']
  
  test('initializes with first step', () => {
    const { result } = renderHook(() => useMultiStepForm({ steps }))
    
    expect(result.current.currentStep).toBe('personal')
    expect(result.current.currentStepIndex).toBe(0)
    expect(result.current.isFirstStep).toBe(true)
    expect(result.current.isLastStep).toBe(false)
    expect(result.current.completedSteps).toEqual({})
  })
  
  test('navigates to next step', () => {
    const { result } = renderHook(() => useMultiStepForm({ steps }))
    
    act(() => {
      result.current.nextStep()
    })
    
    expect(result.current.currentStep).toBe('address')
    expect(result.current.currentStepIndex).toBe(1)
    expect(result.current.isFirstStep).toBe(false)
    expect(result.current.isLastStep).toBe(false)
  })
  
  test('navigates to previous step', () => {
    const { result } = renderHook(() => useMultiStepForm({ steps, initialStep: 'address' }))
    
    act(() => {
      result.current.prevStep()
    })
    
    expect(result.current.currentStep).toBe('personal')
    expect(result.current.currentStepIndex).toBe(0)
  })
  
  test('goes to specific step', () => {
    const { result } = renderHook(() => useMultiStepForm({ steps }))
    
    act(() => {
      result.current.goToStep('review')
    })
    
    expect(result.current.currentStep).toBe('review')
    expect(result.current.currentStepIndex).toBe(2)
    expect(result.current.isLastStep).toBe(true)
  })
  
  test('marks steps as complete', () => {
    const { result } = renderHook(() => useMultiStepForm({ steps }))
    
    act(() => {
      result.current.markStepComplete('personal')
    })
    
    expect(result.current.completedSteps).toEqual({ personal: true })
    expect(result.current.isStepComplete('personal')).toBe(true)
    expect(result.current.isStepComplete('address')).toBe(false)
  })
  
  test('marks steps as incomplete', () => {
    const { result } = renderHook(() => useMultiStepForm({ 
      steps,
      initialCompletedSteps: { personal: true, address: true }
    }))
    
    act(() => {
      result.current.markStepIncomplete('address')
    })
    
    expect(result.current.completedSteps).toEqual({ personal: true, address: false })
    expect(result.current.isStepComplete('address')).toBe(false)
  })
  
  test('resets form state', () => {
    const { result } = renderHook(() => useMultiStepForm({ 
      steps,
      initialStep: 'review',
      initialCompletedSteps: { personal: true, address: true }
    }))
    
    act(() => {
      result.current.resetForm()
    })
    
    expect(result.current.currentStep).toBe('personal')
    expect(result.current.currentStepIndex).toBe(0)
    expect(result.current.completedSteps).toEqual({})
  })
})