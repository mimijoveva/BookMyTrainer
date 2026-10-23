export const SESSION_TYPES = ['Strength', 'Mobility', 'Conditioning'] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

export interface Slot {
  id: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  sessionType: SessionType;
  booked: boolean;
}

// What the coach view receives: the same slot plus who booked it
export interface CoachSlot extends Slot {
  bookedName: string | null;
  bookedEmail: string | null;
}