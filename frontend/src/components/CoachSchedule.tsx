import type { CoachSlot } from '../types';
import { parseDateKey, todayKey } from '../dates';

interface Props {
  slots: CoachSlot[];
}

export function CoachSchedule({ slots }: Props) {
  const today = todayKey();
  const upcoming = slots.filter((s) => s.date >= today);

  if (upcoming.length === 0) {
    return <p className="muted">You haven't published any sessions yet.</p>;
  }

  const byDay = new Map<string, CoachSlot[]>();
  for (const slot of upcoming) {
    byDay.set(slot.date, [...(byDay.get(slot.date) ?? []), slot]);
  }

  return (
    <div className="days">
      {[...byDay.entries()].map(([day, daySlots]) => (
        <section key={day}>
          <h3 className="day-title">
            {parseDateKey(day).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          <ul className="slots">
            {daySlots.map((slot) => (
              <li key={slot.id} className="slot">
                <div className="slot-row">
                  <span className="time">{slot.startTime.slice(0, 5)}</span>
                  <span className={`type type-${slot.sessionType.toLowerCase()}`}>{slot.sessionType}</span>
                  <span className="length">{slot.durationMinutes} min</span>
                  {slot.booked ? (
                    <span className="client">
                      <strong>{slot.bookedName}</strong>
                      <a href={`mailto:${slot.bookedEmail}`}>{slot.bookedEmail}</a>
                    </span>
                  ) : (
                    <span className="status">Open</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}