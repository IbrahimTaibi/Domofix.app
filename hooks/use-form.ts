'use client'

import { useState, useCallback, ChangeEvent, FormEvent } from 'react'

type ValidationFunction<T> = (values: T) => Partial<Record<keyof T, string>>

interface UseFormOptions<T> {
  initialValues: T
  validate?: ValidationFunction<T>
  onSubmit: (values: T) => void | Promise<void>
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user types
    if (errors[name as keyof T]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }, [errors])

  const handleBlur = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    
    // Validate field on blur if validate function exists
    if (validate) {
      const fieldErrors = validate(values)
      if (fieldErrors[name as keyof T]) {
        setErrors(prev => ({ ...prev, ...fieldErrors }))
      }
    }
  }, [validate, values])

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Clear error when field is set programmatically
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }, [errors])

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [])

  const validateForm = useCallback(() => {
    if (!validate) return true
    
    const validationErrors = validate(values)
    const hasErrors = Object.keys(validationErrors).length > 0
    
    if (hasErrors) {
      setErrors(validationErrors)
      
      // Mark fields with errors as touched
      const newTouched: Partial<Record<keyof T, boolean>> = {}
      Object.keys(validationErrors).forEach(key => {
        newTouched[key as keyof T] = true
      })
      setTouched(prev => ({ ...prev, ...newTouched }))
    }
    
    return !hasErrors
  }, [validate, values])

  const handleSubmit = useCallback(async (e?: FormEvent) => {
    if (e) e.preventDefault()
    
    setIsSubmitted(true)
    
    // Validate all fields before submission
    const isValid = validateForm()
    
    if (isValid) {
      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } catch (error) {
        console.error('Form submission error:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }, [onSubmit, validateForm, values])

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitted(false)
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isSubmitted,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
    validateForm
  }
}