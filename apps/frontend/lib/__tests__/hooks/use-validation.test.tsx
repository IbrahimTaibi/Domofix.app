import { renderHook, act } from '@testing-library/react'
import { useValidation, required, email, minLength, matches } from '@/hooks/use-validation'

describe('useValidation', () => {
  const schema = {
    name: [required()],
    email: [required(), email()],
    password: [required(), minLength(8)],
    confirmPassword: [required(), matches('password', 'Passwords must match')]
  }

  test('validates a single field correctly', () => {
    const { result } = renderHook(() => useValidation(schema))
    
    act(() => {
      result.current.validateField('name', '')
    })
    
    expect(result.current.errors.name).toBe('This field is required')
    
    act(() => {
      result.current.validateField('name', 'John')
    })
    
    expect(result.current.errors.name).toBe('')
  })
  
  test('validates email format', () => {
    const { result } = renderHook(() => useValidation(schema))
    
    act(() => {
      result.current.validateField('email', 'invalid-email')
    })
    
    expect(result.current.errors.email).toBe('Invalid email format')
    
    act(() => {
      result.current.validateField('email', 'valid@example.com')
    })
    
    expect(result.current.errors.email).toBe('')
  })
  
  test('validates minimum length', () => {
    const { result } = renderHook(() => useValidation(schema))
    
    act(() => {
      result.current.validateField('password', 'short')
    })
    
    expect(result.current.errors.password).toBe('Must be at least 8 characters')
    
    act(() => {
      result.current.validateField('password', 'longenoughpassword')
    })
    
    expect(result.current.errors.password).toBe('')
  })
  
  test('validates matching fields', () => {
    const { result } = renderHook(() => useValidation(schema))
    const formValues = {
      password: 'password123',
      confirmPassword: 'different'
    }
    
    act(() => {
      result.current.validateField('confirmPassword', formValues.confirmPassword, formValues)
    })
    
    expect(result.current.errors.confirmPassword).toBe('Passwords must match')
    
    const matchingValues = {
      password: 'password123',
      confirmPassword: 'password123'
    }
    
    act(() => {
      result.current.validateField('confirmPassword', matchingValues.confirmPassword, matchingValues)
    })
    
    expect(result.current.errors.confirmPassword).toBe('')
  })
  
  test('validates entire form', () => {
    const { result } = renderHook(() => useValidation(schema))
    
    const invalidForm = {
      name: '',
      email: 'invalid',
      password: 'short',
      confirmPassword: 'nomatch'
    }
    
    let isValid
    act(() => {
      isValid = result.current.validateForm(invalidForm)
    })
    
    expect(isValid).toBe(false)
    expect(Object.keys(result.current.errors).length).toBe(4)
    
    const validForm = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    }
    
    act(() => {
      isValid = result.current.validateForm(validForm)
    })
    
    expect(isValid).toBe(true)
    expect(Object.keys(result.current.errors).filter(key => result.current.errors[key])).toHaveLength(0)
  })
  
  test('clears all errors', () => {
    const { result } = renderHook(() => useValidation(schema))
    
    act(() => {
      result.current.validateField('name', '')
      result.current.validateField('email', 'invalid')
    })
    
    expect(Object.keys(result.current.errors).length).toBe(2)
    
    act(() => {
      result.current.clearErrors()
    })
    
    expect(Object.keys(result.current.errors).length).toBe(0)
  })
})