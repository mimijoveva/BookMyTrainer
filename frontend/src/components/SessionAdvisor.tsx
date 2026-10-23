import { useState } from 'react';
import type { FormEvent } from 'react';
import { suggestSession } from '../api';
import type { SessionSuggestion, SessionType } from '../types';

const EXAMPLES = [
  'I want to get stronger and lift heavier',
  'My back feels stiff from sitting all day',
  'I get out of breath on the stairs',
];

interface Props {
  onShowSessions: (type: SessionType) => void;
}

export function SessionAdvisor({ onShowSessions }: Props) {
  const [goal, setGoal] = useState('');
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<SessionSuggestion | null>(null);

  async function ask(text: string) {
    setError(null);
    setSuggestion(null);
    setThinking(true);
    try {
      setSuggestion(await suggestSession(text));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setThinking(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    ask(goal);
  }

  function handleExample(example: string) {
    setGoal(example);
    ask(example);
  }

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Not sure where to start?</h2>
        <p className="section-intro">Describe your goal in a sentence and get a suggested session type.</p>

        <form className="advisor-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="goal">Your goal</label>
          <input
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Describe your goal"
            maxLength={300}
            required
          />
          <button type="submit" className="primary" disabled={thinking}>
            {thinking ? 'Thinking…' : 'Suggest a session'}
          </button>
        </form>

        <div className="examples">
          <span className="muted">Try:</span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              className="example"
              disabled={thinking}
              onClick={() => handleExample(example)}
            >
              {example}
            </button>
          ))}
        </div>

        {error && <p className="error advisor-error">{error}</p>}

                     {suggestion && (
                  <div className={`suggestion suggestion-${suggestion.sessionType.toLowerCase()}`} role="status">
            <p className="suggestion-text">
              Try a <strong>{suggestion.sessionType}</strong> session. {suggestion.reason}
            </p>
            <div className="suggestion-footer">
              <button className="link" onClick={() => onShowSessions(suggestion.sessionType)}>
                See open {suggestion.sessionType.toLowerCase()} sessions
              </button>
              <span className="ai-note">Suggested by Gemini</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}