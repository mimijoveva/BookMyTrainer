export const SESSION_TYPES = ['Strength', 'Mobility', 'Conditioning'] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

export interface Slot {
  id: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  sessionType: SessionType;
  bookedName: string | null;
  bookedEmail: string | null;
}