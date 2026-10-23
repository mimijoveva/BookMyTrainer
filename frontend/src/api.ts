
import type { Slot, CoachSlot, SessionType, BookingResult, SessionSuggestion } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    const message = Array.isArray(data.message) ? data.message.join('. ') : data.message;
    throw new Error(message ?? 'Something went wrong');
  }

  return data;
}

export function getSlots(): Promise<Slot[]> {
  return request<Slot[]>('/slots');
}

export function getCoachSlots(): Promise<CoachSlot[]> {
  return request<CoachSlot[]>('/slots/coach');
}

export function createSlot(input: {
  date: string;
  startTime: string;
  durationMinutes: number;
  sessionType: SessionType;
}): Promise<Slot> {
  return request<Slot>('/slots', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function bookSlot(id: string, input: { name: string; email: string }): Promise<BookingResult> {
  return request<BookingResult>(`/slots/${id}/book`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
export function suggestSession(goal: string): Promise<SessionSuggestion> {
  return request<SessionSuggestion>('/ai/suggest-session', {
    method: 'POST',
    body: JSON.stringify({ goal }),
  });
}