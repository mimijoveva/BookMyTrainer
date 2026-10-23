# Trainly 

A booking page for a personal trainer. Coach Ana publishes open sessions, and clients pick a day and time, book with their name and email, and get a short confirmation message written by Gemini.

Built for the TeamLift internship challenge.

- **Live app:** [https://trainly-swart.vercel.app/#](https://trainly-swart.vercel.app/#)
- **API:** [https://vercel.com/trainly2/trainly](https://vercel.com/trainly2/trainly)

> The backend runs on Render's free plan and sleeps after 15 minutes without traffic. The first load can take up to a minute while it wakes up.

## What it does

**For clients (booking page)**
- See open sessions in a day strip for the next four weeks
- Filter by session type (Strength, Mobility, Conditioning) and time of day
- Book a session with name and email; booked sessions are shown as taken right away
- Get a confirmation card with the details and a short message from Gemini
- "Not sure where to start?": describe a goal in one sentence and Gemini suggests a session type, then jumps to matching sessions

**For the coach (Coach view)**
- Publish a session: day, start time, type and duration
- See all upcoming sessions, including who booked them (name and email)

## Tech stack

| Part | Tech |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | NestJS, TypeORM |
| Database | PostgreSQL (Docker locally, Neon in production) |
| AI | Gemini API (Google AI Studio, free tier) |
| Hosting | Vercel (frontend), Render (backend), Neon (database) |

## API

| Method | Route | What it does |
|---|---|---|
| GET | `/api/slots` | Public list of slots, without client names or emails |
| GET | `/api/slots/coach` | Full list for the coach view |
| POST | `/api/slots` | Create a slot |
| POST | `/api/slots/:id/book` | Book a slot, returns the slot and a confirmation message |
| POST | `/api/ai/suggest-session` | Suggest a session type for a goal |

## Run it locally

You need Node 20+ and Docker.

**1. Database**
```bash
docker run --name gymslot-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=gymslot -p 5435:5432 -d postgres:16
```

**2. Backend**
```bash
cd backend
cp .env.example .env    # add your GEMINI_API_KEY (optional, see below)
npm install
npm run start:dev
```
The API runs on `http://localhost:3000/api`. Tables are created automatically on first start.

**3. Frontend** (in a second terminal)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Open the URL Vite prints (usually `http://localhost:5173`).

**Environment variables**

| Backend | Example | Notes |
|---|---|---|
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5435/gymslot` | |
| `PORT` | `3000` | |
| `DB_SSL` | `false` | `true` for hosted databases like Neon |
| `GEMINI_API_KEY` | | Free key from Google AI Studio. Without it, bookings still work with a template message |
| `GEMINI_MODEL` | `gemini-flash-lite-latest` | |

| Frontend | Example |
|---|---|
| `VITE_API_URL` | `http://localhost:3000/api` |

## Decisions I made

- **No double bookings, enforced by the database.** Booking is a single `UPDATE ... WHERE id = ? AND bookedName IS NULL`. If two people click at the same time, only one update matches, and the other gets a `409 Conflict`. A unique constraint on date and start time also stops the coach from publishing the same slot twice.
- **AI never breaks the booking.** The booking is saved first, then Gemini writes the message. If Gemini is slow, fails or there is no key, the client gets a template message instead.
- **Facts come from code, tone from AI.** In testing, Gemini got the day of the week wrong ("Tuesday" for a Wednesday). Now the code calculates the day and passes it in, so the model only has to write the sentence.
- **The advisor's answer is checked.** Gemini must reply in JSON, and the session type is checked against the three real types. If someone types "ignore your instructions", the app can still only show Strength, Mobility or Conditioning. If a goal mentions pain, it suggests Mobility and seeing a doctor, since a booking page shouldn't give medical advice.
- **Client privacy without login.** The public endpoint only says whether a slot is booked, not by whom. Names and emails only go to the coach endpoint.
- **One time zone, simple dates.** Dates and times are stored as plain `date` and `time` columns, which matches the brief and avoids time zone conversion bugs.
- **Own twist:** a personal trainer theme with session types and colors, a day strip, time-of-day filters, a "next open session" line in the hero, and the AI session advisor as a second AI feature.

## How I used AI tools

I used **Claude** as a pair programmer throughout the project. I built the app in small steps, starting with the backend and database, then the frontend, the AI features and the deployment. After each step I ran the app, tested it, and only moved on once it worked and I understood how it worked.

I made the decisions about what to build: the personal trainer theme, which features to add and which to leave out, and how the pages should look. When I wasn't sure about a design, I compared a few options before changing the code. Working this way let me move fast while still being able to explain every part of the code.

AI was useful for moving fast, but I had to debug real problems along the way, for example:
- Gemini returned `404` because the default model wasn't available for my key, so I listed the available models with the API and made the model a setting in `.env`.
- A slot was saved without a date because a DTO field was missing and `whitelist: true` silently removed it.
- "Today" was off by one day after midnight because `toISOString()` uses UTC, so I wrote a small local date helper.
- Photos worked locally but not on Vercel, because Windows ignores letter case in file names and Linux doesn't.

The app itself uses **Gemini** (free tier) for the confirmation message and the session advisor.

## What I would improve with more time

- A real login for the coach. The coach view is open right now, which is fine for the brief but not for a real product.
- Let the coach cancel or delete sessions, and let clients cancel their booking with a link in an email.
- Send the confirmation by email, not only on screen.
- Google Calendar sync, so sessions that clash with the coach's events are hidden.
- Database migrations instead of TypeORM `synchronize`.
- Automated tests, especially for the double-booking case.
- Support for more than one coach.

## Credits

- Photos: Unsplash
- Coach Ana, her contact details and the studio are fictional placeholders.