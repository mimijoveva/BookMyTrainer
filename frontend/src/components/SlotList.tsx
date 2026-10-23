import { useState } from 'react';
import type { BookingResult, Slot, SessionType } from '../types';
import { SESSION_TYPES } from '../types';
import { nextDays, parseDateKey } from '../dates';
import { BookingForm } from './BookingForm';

export type TypeFilter = 'All' | SessionType;
type TimeFilter = 'Any time' | 'Morning' | 'Afternoon' | 'Evening';
const TIME_FILTERS: TimeFilter[] = ['Any time', 'Morning', 'Afternoon', 'Evening'];

// "09:30:00" -> "Morning"
function timeOfDay(startTime: string): TimeFilter {
  const hour = Number(startTime.slice(0, 2));
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

interface Props {
  slots: Slot[];
  typeFilter: TypeFilter;
  onTypeFilterChange: (filter: TypeFilter) => void;
  onBooked: (result: BookingResult) => void;
}

export function SlotList({ slots, typeFilter, onTypeFilterChange, onBooked }: Props) {
  const days = nextDays(14);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('Any time');
  const [openId, setOpenId] = useState<string | null>(null);

  const matches = (s: Slot) =>
    (typeFilter === 'All' || s.sessionType === typeFilter) &&
    (timeFilter === 'Any time' || timeOfDay(s.startTime) === timeFilter);

  const openSlotsOn = (day: string) => slots.filter((s) => s.date === day && !s.booked && matches(s));

  const [selectedDay, setSelectedDay] = useState(
    () => days.find((d) => slots.some((s) => s.date === d && !s.booked)) ?? days[0],
  );

  const daySlots = slots.filter((s) => s.date === selectedDay && matches(s));
  const dayHasOpen = daySlots.some((s) => !s.booked);
  const nextDayWithOpen = days.find((d) => d > selectedDay && openSlotsOn(d).length > 0);

  function selectDay(day: string) {
    setSelectedDay(day);
    setOpenId(null);
  }

  return (
    <div>
      <div className="filter-row">
        <span className="filter-label">Type</span>
        <div className="filter-group" role="group" aria-label="Session type">
          {(['All', ...SESSION_TYPES] as TypeFilter[]).map((f) => (
            <button
              key={f}
              className={`filter ${typeFilter === f ? 'selected' : ''}`}
              aria-pressed={typeFilter === f}
              onClick={() => onTypeFilterChange(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-row">
        <span className="filter-label">Time</span>
        <div className="filter-group" role="group" aria-label="Time of day">
          {TIME_FILTERS.map((f) => (
            <button
              key={f}
              className={`filter ${timeFilter === f ? 'selected' : ''}`}
              aria-pressed={timeFilter === f}
              onClick={() => setTimeFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="week" role="tablist" aria-label="Choose a day">
        {days.map((day) => {
          const date = parseDateKey(day);
          const count = openSlotsOn(day).length;
          return (
            <button
              key={day}
              role="tab"
              aria-selected={day === selectedDay}
              className={`day-pill ${day === selectedDay ? 'selected' : ''} ${count === 0 ? 'empty' : ''}`}
              onClick={() => selectDay(day)}
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

      {daySlots.length > 0 && (
        <ul className="slots">
          {daySlots.map((slot) => (
            <li key={slot.id} className={`slot ${slot.booked ? 'booked' : ''}`}>
              <div className="slot-row">
                <span className="time">{slot.startTime.slice(0, 5)}</span>
                <span className={`type type-${slot.sessionType.toLowerCase()}`}>{slot.sessionType}</span>
                <span className="length">{slot.durationMinutes} min</span>
                {slot.booked ? (
                  <span className="status">Booked</span>
                ) : (
                  openId !== slot.id && (
                    <button className="book-button" onClick={() => setOpenId(slot.id)}>Book</button>
                  )
                )}
              </div>
              {openId === slot.id && (
                <BookingForm
                  slot={slot}
                  onBooked={(result) => { setOpenId(null); onBooked(result); }}
                  onCancel={() => setOpenId(null)}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {!dayHasOpen && (
        <div className="empty-day">
          <p className="muted">
            {daySlots.length > 0 ? 'Everything on this day is booked.' : 'No open sessions on this day.'}
          </p>
          {nextDayWithOpen ? (
            <button className="link" onClick={() => selectDay(nextDayWithOpen)}>
              Go to {parseDateKey(nextDayWithOpen).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric' })},
              first open at {openSlotsOn(nextDayWithOpen)[0].startTime.slice(0, 5)}
            </button>
          ) : (
            <p className="muted">Nothing open in the next two weeks with these filters.</p>
          )}
        </div>
      )}
    </div>
  );
}