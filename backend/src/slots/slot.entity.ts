import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

export const SESSION_TYPES = ['Strength', 'Mobility', 'Conditioning'];

@Entity('slots')
@Unique(['date', 'startTime'])
export class Slot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'int' })
  durationMinutes: number;

  @Column({ type: 'varchar', length: 30, default: 'Strength' })
  sessionType: string;

  @Column({ type: 'varchar', nullable: true })
  bookedName: string | null;

  @Column({ type: 'varchar', nullable: true })
  bookedEmail: string | null;
}