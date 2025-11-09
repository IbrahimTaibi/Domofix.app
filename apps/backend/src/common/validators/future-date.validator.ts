import { Injectable } from '@nestjs/common';
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ async: false })
@Injectable()
export class FutureDateConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string' && !(value instanceof Date)) return false;
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return false;
    return date.getTime() > Date.now();
  }

  defaultMessage(): string {
    return 'date must be in the future and a valid ISO date';
  }
}

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsFutureDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: FutureDateConstraint,
    });
  };
}