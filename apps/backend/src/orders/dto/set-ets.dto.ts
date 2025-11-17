import { IsISO8601 } from 'class-validator';

export class SetEtsDto {
  @IsISO8601()
  ets!: string;
}
