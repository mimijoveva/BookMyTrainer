import { useEffect, useRef } from 'react';
import type { BookingResult } from '../types';
import { parseDateKey } from '../dates';

interface Props {
  result: BookingResult;
  onClose: () => void;
}

export function BookingConfirmation({ result, onClose }: Props) {
  const { slot, confirmationMessage } = result;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    ref.current?.focus();
  }, []);

  const day = parseDateKey(slot.date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div className="confirmation" role="status" tabIndex={-1} ref={ref}>
      <h3>You're booked, {slot.bookedName}.</h3>

      <dl className="summary">
        <div><dt>Day</dt><dd>{day}</dd></div>
        <div><dt>Time</dt><dd>{slot.startTime.slice(0, 5)}</dd></div>
        <div>
          <dt>Session</dt>
          <dd className={`type type-${slot.sessionType.toLowerCase()}`}>{slot.sessionType}</dd>
        </div>
        <div><dt>Length</dt><dd>{slot.durationMinutes} min</dd></div>
      </dl>

      <p className="message">{confirmationMessage}</p>

      <button className="link" onClick={onClose}>Done</button>
    </div>
  );
}