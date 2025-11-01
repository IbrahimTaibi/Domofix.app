'use client'

import { useState, useCallback } from 'react'

// Validation rule types
type ValidationRule<T> = (value: T, formValues?: Record<string, any>) => string | null

// Helper validation rules
export const required = (message = 'This field is required') => 
  (value: any) => !value && value !== 0 ? message : null

export const email = (message = 'Invalid email format') => 
  (value: string) => value && !/\S+@\S+\.\S+/.test(value) ? message : null

export const minLength = (length: number, message?: string) => 
  (value: string) => value && value.length < length ? 
    message || `Must be at least ${length} characters` : null

export const maxLength = (length: number, message?: string) => 
  (value: string) => value && value.length > length ? 
    message || `Must be at most ${length} characters` : null

export const pattern = (regex: RegExp, message: string) => 
  (value: string) => value && !regex.test(value) ? message : null

export const matches = (fieldName: string, message: string) => 
  (value: any, formValues?: Record<string, any>) => 
    formValues && value !== formValues[fieldName] ? message : null

interface ValidationSchema {
  [field: string]: ValidationRule<any>[]
}

export function useValidation(schema: ValidationSchema) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = useCallback((name: string, value: any, formValues?: Record<string, any>) => {
    if (!schema[name]) return null

    // Run through all validation rules for this field
    for (const rule of schema[name]) {
      const error = rule(value, formValues)
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }))
        return error
      }
    }

    // Clear error if validation passes
    setErrors(prev => ({ ...prev, [name]: '' }))
    return null
  }, [schema])

  const validateForm = useCallback((formValues: Record<string, any>) => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    // Validate each field in the schema
    Object.keys(schema).forEach(fieldName => {
      const fieldValue = formValues[fieldName]
      
      for (const rule of schema[fieldName]) {
        const error = rule(fieldValue, formValues)
        if (error) {
          newErrors[fieldName] = error
          isValid = false
          break
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }, [schema])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  return {
    errors,
    validateField,
    validateForm,
    clearErrors
  }
}