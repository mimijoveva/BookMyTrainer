import { IsEmail, IsString, Length } from 'class-validator';

export class BookSlotDto {
  @IsString()
  @Length(2, 80, { message: 'name must be between 2 and 80 characters' })
  name: string;

  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;
}