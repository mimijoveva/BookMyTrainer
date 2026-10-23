import { useState } from 'react';
import type { FormEvent } from 'react';
import { createSlot } from '../api';
import { SESSION_TYPES } from '../types';
import type { SessionType } from '../types';
import { todayKey } from '../dates';

const DURATIONS = [30, 45, 60, 90];

interface Props {
  onCreated: () => void;
}

export function CreateSlotForm({ onCreated }: Props) {
  const today = todayKey();

  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [sessionType, setSessionType] = useState<SessionType>('Strength');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createSlot({ date, startTime, durationMinutes, sessionType });
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <div className="row">
        <label>
          Date
          <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} required />
        </label>

        <label>
          Start time
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </label>
      </div>

      <fieldset>
        <legend>Session type</legend>
        <div className="choices">
          {SESSION_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={`choice ${sessionType === t ? 'selected' : ''}`}
              onClick={() => setSessionType(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Duration</legend>
        <div className="choices">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              className={`choice ${durationMinutes === d ? 'selected' : ''}`}
              onClick={() => setDurationMinutes(d)}
            >
              {d} min
            </button>
          ))}
        </div>
      </fieldset>

      {error && <p className="error">{error}</p>}

      <button type="submit" className="primary" disabled={saving}>
        {saving ? 'Publishing…' : 'Publish session'}
      </button>
    </form>
  );
}