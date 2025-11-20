import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValidPhoneNumber } from '@domofix/shared-utils';

@ValidatorConstraint({ async: false })
@Injectable()
export class PhoneNumberConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') return false;
    return isValidPhoneNumber(value);
  }

  defaultMessage(): string {
    return 'phone must be a valid phone number (E.164 or similar)';
  }
}

export function IsPhoneNumberFormat(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsPhoneNumberFormat',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: PhoneNumberConstraint,
    });
  };
}
