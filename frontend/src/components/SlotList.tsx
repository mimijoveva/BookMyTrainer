import { useState } from 'react';
import type { Slot, SessionType } from '../types';
import { SESSION_TYPES } from '../types';
import { nextDays, parseDateKey } from '../dates';
import { BookingForm } from './BookingForm';

interface Props {
  slots: Slot[];
  onBooked: (message: string) => void;
}

type Filter = 'All' | SessionType;

export function SlotList({ slots, onBooked }: Props) {
  const days = nextDays(14);
  const [filter, setFilter] = useState<Filter>('All');
  const [openId, setOpenId] = useState<string | null>(null);

  const matchesFilter = (s: Slot) => filter === 'All' || s.sessionType === filter;
  const openCount = (day: string) =>
    slots.filter((s) => s.date === day &&  !s.booked && matchesFilter(s)).length;

  const [selectedDay, setSelectedDay] = useState(
    () => days.find((d) => slots.some((s) => s.date === d && !s.booked)) ?? days[0],
  );

  const daySlots = slots.filter((s) => s.date === selectedDay && matchesFilter(s));

  return (
    <div>
      <div className="filters" role="group" aria-label="Session type">
        {(['All', ...SESSION_TYPES] as Filter[]).map((f) => (
          <button
            key={f}
            className={`filter ${filter === f ? 'selected' : ''}`}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="week" role="tablist" aria-label="Choose a day">
        {days.map((day) => {
          const date = parseDateKey(day);
          const count = openCount(day);
          return (
            <button
              key={day}
              role="tab"
              aria-selected={day === selectedDay}
              className={`day-pill ${day === selectedDay ? 'selected' : ''} ${count === 0 ? 'empty' : ''}`}
              onClick={() => { setSelectedDay(day); setOpenId(null); }}
            >
              <span className="weekday">{date.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
              <span className="daynum">{date.getDate()}</span>
              <span className="count">{count > 0 ? `${count} open` : '–'}</span>
            </button>
          );
        })}
      </div>

      <h3 className="day-title">
        {parseDateKey(selectedDay).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
      </h3>

      {daySlots.length === 0 ? (
        <p className="muted">No sessions on this day. Try another day or filter.</p>
      ) : (
        <ul className="slots">
          {daySlots.map((slot) => {
             const booked = slot.booked;;
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
      )}
    </div>
  );
}