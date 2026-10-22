import { useState } from 'react';
import type { Slot } from '../types';
import { BookingForm } from './BookingForm';

interface Props {
  slots: Slot[];
  onBooked: (message: string) => void;
}

function formatDay(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

export function SlotList({ slots, onBooked }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = slots.filter((s) => s.date >= today);

  if (upcoming.length === 0) {
    return <p className="muted">No sessions published yet.</p>;
  }

  const byDay = new Map<string, Slot[]>();
  for (const slot of upcoming) {
    byDay.set(slot.date, [...(byDay.get(slot.date) ?? []), slot]);
  }

  return (
    <div className="days">
      {[...byDay.entries()].map(([date, daySlots]) => (
        <section key={date} className="day">
          <h3>{formatDay(date)}</h3>
          <ul>
            {daySlots.map((slot) => {
              const booked = slot.bookedName !== null;
              return (
                <li key={slot.id} className={`slot ${booked ? 'booked' : ''}`}>
                  <div className="slot-row">
                    <span className="time">{slot.startTime.slice(0, 5)}</span>
                    <span className={`type type-${slot.sessionType.toLowerCase()}`}>{slot.sessionType}</span>
                    <span className="length">{slot.durationMinutes} min</span>
                    {booked ? (
                      <span className="status">Booked</span>
                    ) : (
                      openId !== slot.id && (
                        <button className="link" onClick={() => setOpenId(slot.id)}>Book</button>
                      )
                    )}
                  </div>
                  {openId === slot.id && (
                    <BookingForm
                      slot={slot}
                      onBooked={(message) => { setOpenId(null); onBooked(message); }}
                      onCancel={() => setOpenId(null)}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}