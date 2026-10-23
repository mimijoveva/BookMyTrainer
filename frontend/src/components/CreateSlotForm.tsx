import { useState } from 'react';
import type { FormEvent } from 'react';
import { createSlot } from '../api';
import { SESSION_TYPES } from '../types';
import type { SessionType } from '../types';

import { nextDays, parseDateKey, todayKey } from '../dates';

const DURATIONS = [30, 45, 60, 90];

// Start times every 30 minutes, 07:00 to 20:30

const TIMES = Array.from({ length: 28 }, (_, i) => {
  const minutes = 7 * 60 + i * 30;
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mm = String(minutes % 60).padStart(2, '0');
  return `${hh}:${mm}`;
});

interface Props {
  onCreated: () => void;
}

export function CreateSlotForm({ onCreated }: Props) {
    const days = nextDays(56);

  const [date, setDate] = useState(days[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [sessionType, setSessionType] = useState<SessionType>('Strength');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPublished(null);
    setSaving(true);
    try {
      await createSlot({ date, startTime, durationMinutes, sessionType });
      const day = parseDateKey(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
      setPublished(`Published: ${sessionType}, ${day} at ${startTime}.`);
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <div className="create-fields">
               <label>
          Day
          <input
            type="date"
            value={date}
            min={todayKey()}
            max={days[days.length - 1]}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <label>
          Start time
          <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
            {TIMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label>
          Session type
          <select value={sessionType} onChange={(e) => setSessionType(e.target.value as SessionType)}>
            {SESSION_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label>
          Duration
          <select value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))}>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>{d} min</option>
            ))}
          </select>
        </label>

        <button type="submit" className="primary" disabled={saving}>
          {saving ? 'Publishing…' : 'Publish'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {published && !error && <p className="published">{published}</p>}
    </form>
  );
}