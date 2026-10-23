import { useCallback, useEffect, useState } from 'react';
import type { CoachSlot, Slot } from './types';
import { getCoachSlots, getSlots } from './api';
import { CreateSlotForm } from './components/CreateSlotForm';
import { SlotList } from './components/SlotList';
import { CoachSchedule } from './components/CoachSchedule';

const SESSION_INFO = [
  { type: 'strength', name: 'Strength', text: 'Build muscle and learn to lift with good form.' },
  { type: 'mobility', name: 'Mobility', text: 'Move better and recover between hard training days.' },
  { type: 'conditioning', name: 'Conditioning', text: 'Short rests, higher heart rate, more stamina.' },
];

type View = 'book' | 'coach';
const viewFromHash = (): View => (window.location.hash === '#coach' ? 'coach' : 'book');

export default function App() {
  const [view, setView] = useState<View>(viewFromHash);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [coachSlots, setCoachSlots] = useState<CoachSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const loadSlots = useCallback(async () => {
    try {
      if (view === 'coach') {
        setCoachSlots(await getCoachSlots());
      } else {
        setSlots(await getSlots());
      }
      setLoadError(null);
    } catch {
      setLoadError('Could not load sessions. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    setLoading(true);
    loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function handleBooked(message: string) {
    setConfirmation(message);
    loadSlots();
  }

  const status = (
    <>
      {loading && <p className="muted">Loading sessions…</p>}
      {loadError && <p className="error">{loadError}</p>}
    </>
  );
  const ready = !loading && !loadError;

  return (
    <>
      <nav className={`nav ${view === 'coach' ? 'nav-light' : ''}`}>
        <div className="container nav-inner">
          <a className="brand" href="#">BookMyTrainer</a>
          {view === 'book' ? <a href="#coach">Coach view</a> : <a href="#">Back to booking</a>}
        </div>
      </nav>

      {view === 'coach' ? (
        <main className="schedule">
          <div className="container">
            <h2 className="page-title">Coach view</h2>
            <p className="muted intro">Publish open sessions and see who booked them.</p>

            <CreateSlotForm onCreated={loadSlots} />

            <h2 className="section-title">Your upcoming sessions</h2>
            {status}
            {ready && <CoachSchedule slots={coachSlots} />}
          </div>
        </main>
      ) : (
        <>
          <header className="hero">
            <div className="container">
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
              <h2 className="section-title">Open sessions</h2>

              {confirmation && (
                <div className="confirmation" role="status">
                  <p>{confirmation}</p>
                  <button className="link" onClick={() => setConfirmation(null)}>Dismiss</button>
                </div>
              )}

              {status}
              {ready && <SlotList slots={slots} onBooked={handleBooked} />}
            </div>
          </main>
        </>
      )}
    </>
  );
}