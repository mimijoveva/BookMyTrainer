import { useCallback, useEffect, useState } from 'react';
import type { Slot } from './types';
import { getSlots } from './api';
import { CreateSlotForm } from './components/CreateSlotForm';
import { SlotList } from './components/SlotList';

export default function App() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

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
    <div className="page">
      <header className="header">
        <h1>BookMyTrainer</h1>
        <p>Pick an open session with Coach Ana and book it in seconds.</p>
      </header>

      {confirmation && (
        <div className="confirmation" role="status">
          <h2>You're booked</h2>
          <p>{confirmation}</p>
          <button onClick={() => setConfirmation(null)}>Close</button>
        </div>
      )}

      <main className="layout">
        <section>
          <h2>Open sessions</h2>
          {loading && <p className="empty">Loading sessions…</p>}
          {loadError && <p className="error">{loadError}</p>}
          {!loading && !loadError && <SlotList slots={slots} onBooked={handleBooked} />}
        </section>

        <aside>
          <CreateSlotForm onCreated={loadSlots} />
        </aside>
      </main>
    </div>
  );
}