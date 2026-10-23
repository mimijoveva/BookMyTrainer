import { useCallback, useEffect, useState } from 'react';
import type { BookingResult, CoachSlot, SessionType, Slot } from './types';
import { getCoachSlots, getSlots } from './api';
import { parseDateKey, todayKey } from './dates';
import { SlotList } from './components/SlotList';
import type { TypeFilter } from './components/SlotList';
import { BookingConfirmation } from './components/BookingConfirmation';
import { SessionAdvisor } from './components/SessionAdvisor';
import { About } from './components/About';
import { CoachView } from './components/CoachView';

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
  const [confirmation, setConfirmation] = useState<BookingResult | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');

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

  // Coming back from the coach view to "#about" or "#schedule": scroll there once the page has rendered
  useEffect(() => {
    if (view !== 'book') return;
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, [view]);

  function handleBooked(result: BookingResult) {
    setConfirmation(result);
    loadSlots();
  }

  function showSessionsOfType(type: SessionType) {
    setTypeFilter(type);
    document.getElementById('schedule')?.scrollIntoView({ behavior: 'smooth' });
  }

  const nextOpen = slots.filter((s) => !s.booked && s.date >= todayKey()).at(0);

  return (
    <>
      <nav className="nav">
        <div className={`container nav-inner ${view === 'book' ? 'wide' : ''}`}>
          <a className="brand" href="#">Trainly</a>
          {view === 'book' ? (
            <div className="nav-links">
              <a href="#schedule">Sessions</a>
              <a href="#about">About</a>
              <span className="nav-divider" aria-hidden="true" />
              <a className="nav-coach" href="#coach">Coach view</a>
            </div>
          ) : (
            <a className="nav-coach" href="#">Back to booking</a>
          )}
        </div>
      </nav>

      {view === 'coach' ? (
        <CoachView slots={coachSlots} loading={loading} loadError={loadError} onCreated={loadSlots} />
      ) : (
        <>
          <header className="hero">
            <div className="hero-top">
              <div className="container wide">
                <div className="hero-text">
                  <h1>Train with Coach&nbsp;Ana.</h1>
                  <p className="lead">
                    One-to-one personal training, 30 to 90 minutes. Pick an open time below and it's yours.
                  </p>
                  <a className="button-light" href="#schedule">See open sessions</a>

                  <p className="next-open">
                    {nextOpen ? (
                      <>
                        Next open session:{' '}
                        <strong>
                          {parseDateKey(nextOpen.date).toLocaleDateString('en-GB', {
                            weekday: 'long', day: 'numeric', month: 'long',
                          })}
                          , {nextOpen.startTime.slice(0, 5)}
                        </strong>
                        <span className={`type type-${nextOpen.sessionType.toLowerCase()}`}>
                          {nextOpen.sessionType}
                        </span>
                      </>
                    ) : (
                      'New sessions are published every week.'
                    )}
                  </p>
                </div>
              </div>

              <div className="hero-media">
                <img className="hero-photo" src="/hero.jpg" alt="Coach Ana guiding a client through a squat" />
              </div>
            </div>

            <div className="container wide">
              <ul className="session-info">
                {SESSION_INFO.map((s) => (
                  <li key={s.type}>
                    <strong className={`type type-${s.type}`}>{s.name}</strong>
                    <p>{s.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </header>

          <SessionAdvisor onShowSessions={showSessionsOfType} />

          <main id="schedule" className="section section-schedule">
            <div className="container">
              <h2 className="section-title">Open sessions</h2>

              {confirmation && (
                <BookingConfirmation result={confirmation} onClose={() => setConfirmation(null)} />
              )}

              {loading && <p className="muted">Loading sessions…</p>}
              {loadError && <p className="error">{loadError}</p>}
              {!loading && !loadError && (
                <SlotList
                  slots={slots}
                  typeFilter={typeFilter}
                  onTypeFilterChange={setTypeFilter}
                  onBooked={handleBooked}
                />
              )}
            </div>
          </main>

          <About />

          <footer className="footer">
            <div className="container">BookMyTrainer. Built for the TeamLift internship challenge.</div>
          </footer>
        </>
      )}
    </>
  );
}