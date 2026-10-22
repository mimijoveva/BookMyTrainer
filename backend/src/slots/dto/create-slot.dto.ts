import { IsIn, IsInt, Matches } from 'class-validator';

export class CreateSlotDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in YYYY-MM-DD format' })
  date: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'startTime must be in HH:mm format' })
  startTime: string;

  @IsInt()
  @IsIn([30, 45, 60, 90], { message: 'durationMinutes must be 30, 45, 60 or 90' })
  durationMinutes: number;
}