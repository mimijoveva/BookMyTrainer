import { IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class SuggestSessionDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(3, 300, { message: 'Describe your goal in 3 to 300 characters' })
  goal: string;
}