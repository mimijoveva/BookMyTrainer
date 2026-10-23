import type { CoachSlot } from '../types';
import { nextDays } from '../dates';
import { CreateSlotForm } from './CreateSlotForm';
import { CoachSchedule } from './CoachSchedule';

interface Props {
  slots: CoachSlot[];
  loading: boolean;
  loadError: string | null;
  onCreated: () => void;
}

export function CoachView({ slots, loading, loadError, onCreated }: Props) {
  const week = nextDays(7);
  const thisWeek = slots.filter((s) => week.includes(s.date));
  const booked = thisWeek.filter((s) => s.booked).length;
  const open = thisWeek.length - booked;

  return (
    <>
      <header className="coach-header">
        <div className="container">
          <h1>Coach view</h1>
          <p className="coach-week">
            {thisWeek.length === 0 ? (
              'No sessions in the next 7 days yet. Publish one below.'
            ) : (
              <>
                <strong>{thisWeek.length}</strong> {thisWeek.length === 1 ? 'session' : 'sessions'} in the next 7 days:{' '}
                <strong>{booked}</strong> booked, <strong>{open}</strong> still open.
              </>
            )}
          </p>
        </div>
      </header>

      <main className="section section-coach">
        <div className="container">
          <h2 className="section-title">Publish a session</h2>
          <p className="section-intro">Clients see it on the booking page right away.</p>
          <CreateSlotForm onCreated={onCreated} />

          <h2 className="section-title">Your upcoming sessions</h2>
          {loading && <p className="muted">Loading sessions…</p>}
          {loadError && <p className="error">{loadError}</p>}
          {!loading && !loadError && <CoachSchedule slots={slots} />}
        </div>
      </main>
    </>
  );
}