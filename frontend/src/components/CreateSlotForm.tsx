import { useState } from 'react';
import type { FormEvent } from 'react';
import { createSlot } from '../api';

const DURATIONS = [30, 45, 60, 90];

interface Props {
  onCreated: () => void;
}

export function CreateSlotForm({ onCreated }: Props) {
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createSlot({ date, startTime, durationMinutes });
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>Add an open session</h2>

      <label>
        Date
        <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} required />
      </label>

      <label>
        Start time
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
      </label>

      <fieldset>
        <legend>Duration</legend>
        <div className="durations">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              className={`duration d${d} ${durationMinutes === d ? 'selected' : ''}`}
              onClick={() => setDurationMinutes(d)}
            >
              {d} min
            </button>
          ))}
        </div>
      </fieldset>

      {error && <p className="error">{error}</p>}

      <button type="submit" className="primary" disabled={saving}>
        {saving ? 'Adding…' : 'Add session'}
      </button>
    </form>
  );
}