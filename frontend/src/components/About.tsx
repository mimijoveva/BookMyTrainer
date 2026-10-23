import { useState } from 'react';

const FACTS = [
  { value: '8 years', label: 'of coaching' },
  { value: '3 types', label: 'of sessions' },
  { value: '1 to 1', label: 'always' },
];

export function About() {
  // Use a dedicated portrait if there is one, otherwise crop the coach out of the hero photo
  const [photo, setPhoto] = useState('/about.jpg');

  return (
    <section id="about" className="section-about">
      <div className="about">
        <div className="about-photo">
          <img
            src={photo}
            className={photo === '/hero.jpg' ? 'from-hero' : ''}
            onError={() => photo !== '/hero.jpg' && setPhoto('/hero.jpg')}
            alt="Coach Ana Petrovska in the studio"
          />
        </div>

        <div className="about-content">
          <p className="about-kicker">Your coach</p>
          <h2>Ana Petrovska</h2>
          <p className="bio">
            I help busy people get stronger and move without pain. Every session is one-to-one, so the plan
            is built around your body, your schedule and your goal.
          </p>

          <ul className="facts">
            {FACTS.map((f) => (
              <li key={f.value}>
                <strong>{f.value}</strong>
                <span>{f.label}</span>
              </li>
            ))}
          </ul>

          <div className="first-session">
            <h3>Your first session</h3>
            <p>
              We talk about your goal, check how you move, and do a light workout. You leave with a plan for
              the next four weeks.
            </p>
          </div>

          <div className="contact">
            <a className="contact-button main" href="mailto:ana@bookmytrainer.example">Email Ana</a>
            <a className="contact-button" href="tel:+38970000000">+389 70 000 000</a>
            <span className="contact-button">@coach.ana</span>
          </div>

          <dl className="studio">
            <div><dt>Studio</dt><dd>Centar, Skopje</dd></div>
            <div><dt>Hours</dt><dd>Mon to Sat, 07:00 to 21:00</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}