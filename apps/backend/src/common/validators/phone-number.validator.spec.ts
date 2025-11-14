import { PhoneNumberConstraint } from './phone-number.validator'
import { ValidationArguments } from 'class-validator'

describe('IsPhoneNumberFormat', () => {
  it('accepts E.164-like', () => {
    const v = new PhoneNumberConstraint()
    expect(v.validate('+12345678901', {} as ValidationArguments)).toBe(true)
  })
  it('rejects invalid', () => {
    const v = new PhoneNumberConstraint()
    expect(v.validate('abc', {} as ValidationArguments)).toBe(false)
  })
})
