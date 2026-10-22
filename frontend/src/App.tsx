import { useCallback, useEffect, useState } from 'react';
import type { Slot } from './types';
import { getSlots } from './api';
import { CreateSlotForm } from './components/CreateSlotForm';
import { SlotList } from './components/SlotList';

const SESSION_INFO = [
  { type: 'strength', name: 'Strength', text: 'Build muscle and learn to lift with good form.' },
  { type: 'mobility', name: 'Mobility', text: 'Move better and recover between hard training days.' },
  { type: 'conditioning', name: 'Conditioning', text: 'Short rests, higher heart rate, more stamina.' },
];

export default function App() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadSlots = useCallback(async () => {
    try {
      setSlots(await getSlots());
      setLoadError(null);
    } catch {
      setLoadError('Could not load sessions. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  function handleBooked(message: string) {
    setConfirmation(message);
    loadSlots();
  }

  return (
    <>
      <header className="hero">
        <div className="container">
          <p className="brand">BookMyTrainer</p>

          <h1>Train with Coach&nbsp;Ana.</h1>
          <p className="lead">
            One-to-one personal training, 30 to 90 minutes. Pick an open time below and it's yours.
          </p>
          <a className="button-light" href="#schedule">See open sessions</a>

          <ul className="session-info">
            {SESSION_INFO.map((s) => (
              <li key={s.type}>
                <span className={`dot type-${s.type}`} aria-hidden="true" />
                <div>
                  <strong>{s.name}</strong>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <main id="schedule" className="schedule">
        <div className="container">
          <div className="schedule-head">
            <h2>Open sessions</h2>
            <button className="link" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Close' : 'Add session'}
            </button>
          </div>

          {showForm && (
            <CreateSlotForm
              onCreated={() => {
                setShowForm(false);
                loadSlots();
              }}
            />
          )}

          {confirmation && (
            <div className="confirmation" role="status">
              <p>{confirmation}</p>
              <button className="link" onClick={() => setConfirmation(null)}>Dismiss</button>
            </div>
          )}

          {loading && <p className="muted">Loading sessions…</p>}
          {loadError && <p className="error">{loadError}</p>}
          {!loading && !loadError && <SlotList slots={slots} onBooked={handleBooked} />}
        </div>
      </main>
    </>
  );
}