export interface Slot {
  id: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  bookedName: string | null;
  bookedEmail: string | null;
}