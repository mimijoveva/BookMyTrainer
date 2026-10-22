import type { Slot } from './types';

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

export function createSlot(input: { date: string; startTime: string; durationMinutes: number }): Promise<Slot> {
  return request<Slot>('/slots', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function bookSlot(
  id: string,
  input: { name: string; email: string },
): Promise<{ slot: Slot; confirmationMessage: string }> {
  return request(`/slots/${id}/book`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}