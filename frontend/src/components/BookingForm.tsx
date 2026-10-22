import { useState } from 'react';
import type { FormEvent } from 'react';
import { bookSlot } from '../api';
import type { Slot } from '../types';

interface Props {
  slot: Slot;
  onBooked: (message: string) => void;
  onCancel: () => void;
}

export function BookingForm({ slot, onBooked, onCancel }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBooking(true);
    try {
      const result = await bookSlot(slot.id, { name, email });
      onBooked(result.confirmationMessage);
    } catch (err) {
      setError((err as Error).message);
      setBooking(false);
    }
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      {error && <p className="error">{error}</p>}
      <div className="actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary" disabled={booking}>
          {booking ? 'Booking…' : 'Confirm booking'}
        </button>
      </div>
    </form>
  );
}