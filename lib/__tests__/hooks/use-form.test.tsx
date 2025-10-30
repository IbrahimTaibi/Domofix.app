import { renderHook, act } from '@testing-library/react'
import { useForm } from '@/hooks/use-form'

describe('useForm', () => {
  const initialValues = { name: '', email: '' }
  const mockOnSubmit = jest.fn()
  
  test('initializes with provided values', () => {
    const { result } = renderHook(() => useForm({ 
      initialValues, 
      onSubmit: mockOnSubmit 
    }))
    
    expect(result.current.values).toEqual(initialValues)
    expect(result.current.errors).toEqual({})
    expect(result.current.touched).toEqual({})
    expect(result.current.isSubmitting).toBe(false)
  })
  
  test('handles input changes', () => {
    const { result } = renderHook(() => useForm({ 
      initialValues, 
      onSubmit: mockOnSubmit 
    }))
    
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'John Doe' }
      } as React.ChangeEvent<HTMLInputElement>)
    })
    
    expect(result.current.values).toEqual({ name: 'John Doe', email: '' })
  })
  
  test('handles blur events', () => {
    const { result } = renderHook(() => useForm({ 
      initialValues, 
      onSubmit: mockOnSubmit 
    }))
    
    act(() => {
      result.current.handleBlur({
        target: { name: 'name' }
      } as React.FocusEvent<HTMLInputElement>)
    })
    
    expect(result.current.touched).toEqual({ name: true })
  })
  
  test('sets field value programmatically', () => {
    const { result } = renderHook(() => useForm({ 
      initialValues, 
      onSubmit: mockOnSubmit 
    }))
    
    act(() => {
      result.current.setFieldValue('email', 'test@example.com')
    })
    
    expect(result.current.values.email).toBe('test@example.com')
  })
  
  test('sets field error programmatically', () => {
    const { result } = renderHook(() => useForm({ 
      initialValues, 
      onSubmit: mockOnSubmit 
    }))
    
    act(() => {
      result.current.setFieldError('email', 'Invalid email')
    })
    
    expect(result.current.errors.email).toBe('Invalid email')
  })
  
  test('handles form submission', async () => {
    const onSubmit = jest.fn()
    const { result } = renderHook(() => useForm({ 
      initialValues, 
      onSubmit 
    }))
    
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any)
    })
    
    expect(onSubmit).toHaveBeenCalledWith(initialValues)
  })
  
  test('resets form state', () => {
    const { result } = renderHook(() => useForm({ 
      initialValues, 
      onSubmit: mockOnSubmit 
    }))
    
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'John Doe' }
      } as React.ChangeEvent<HTMLInputElement>)
      
      result.current.setFieldError('name', 'Error')
      result.current.handleBlur({
        target: { name: 'name' }
      } as React.FocusEvent<HTMLInputElement>)
    })
    
    act(() => {
      result.current.resetForm()
    })
    
    expect(result.current.values).toEqual(initialValues)
    expect(result.current.errors).toEqual({})
    expect(result.current.touched).toEqual({})
  })
})