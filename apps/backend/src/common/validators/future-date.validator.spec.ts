import { FutureDateConstraint } from './future-date.validator'
import { ValidationArguments } from 'class-validator'

describe('IsFutureDate', () => {
  it('validates future date', () => {
    const validator = new FutureDateConstraint()
    expect(validator.validate(new Date(Date.now() + 60000).toISOString(), {} as ValidationArguments)).toBe(true)
    expect(validator.validate(new Date(Date.now() - 60000).toISOString(), {} as ValidationArguments)).toBe(false)
  })
})
