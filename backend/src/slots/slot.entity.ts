import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('slots')
export class Slot {
  @PrimaryGeneratedColumn('uuid') // uuid is not easily guessed, instead of id I will use uuid
  id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'int' })
  durationMinutes: number;

  @Column({ type: 'varchar', nullable: true })
  bookedName: string | null;

  @Column({ type: 'varchar', nullable: true })
  bookedEmail: string | null;
}