import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
@Injectable()
export class RequireOneOfConstraint implements ValidatorConstraintInterface {
  validate(_value: any, args: ValidationArguments): boolean {
    const object: any = args.object;
    const properties = (args.constraints || []) as string[];
    if (!properties || properties.length < 2) return true; // no-op if misconfigured
    return properties.some((prop) => {
      const val = object[prop];
      if (val === null || val === undefined) return false;
      if (typeof val === 'object') return Object.keys(val).length > 0;
      return true;
    });
  }

  defaultMessage(args: ValidationArguments): string {
    const properties = (args.constraints || []) as string[];
    return `At least one of the following must be provided: ${properties.join(', ')}`;
  }
}

export function RequireOneOf(
  properties: string[],
  options?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'RequireOneOf',
      target: object.constructor,
      propertyName,
      constraints: properties,
      options,
      validator: RequireOneOfConstraint,
    });
  };
}
