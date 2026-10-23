import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Slot, SESSION_TYPES } from '../slots/slot.entity';

export interface SessionSuggestion {
  sessionType: string;
  reason: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) {}

  async writeConfirmation(slot: Slot): Promise<string> {
    const prompt = `You are a friendly personal trainer.
Write a short booking confirmation (2-3 sentences, max 50 words) for your client.
Mention the day and time, and give one practical tip for preparing for this type of session.
Plain text only, no emojis, no signature.

Client name: ${slot.bookedName}
Date: ${this.formatDay(slot.date)}
Start time: ${slot.startTime.slice(0, 5)}
Duration: ${slot.durationMinutes} minutes
Session type: ${slot.sessionType}`;

    try {
      return await this.callGemini(prompt);
    } catch (err) {
      this.logger.warn(`Using fallback confirmation: ${(err as Error).message}`);
      return this.fallback(slot);
    }
  }

  async suggestSession(goal: string): Promise<SessionSuggestion> {
    const prompt = `You help clients of a personal trainer choose a session type.
The options are:
- Strength: build muscle and learn to lift with good form
- Mobility: move better, ease stiffness, recover between hard training days
- Conditioning: short rests, higher heart rate, more stamina

Read the client's goal and pick exactly one option.
Reply only with JSON in this shape:
{"sessionType": "Strength" | "Mobility" | "Conditioning", "reason": "one friendly sentence to the client, max 25 words"}
Do not give medical advice. If the goal mentions pain or an injury, pick Mobility and suggest seeing a doctor if the pain continues.

Client's goal: """${goal}"""`;

    try {
      const parsed = JSON.parse(await this.callGemini(prompt, true));

      if (!SESSION_TYPES.includes(parsed.sessionType) || typeof parsed.reason !== 'string') {
        throw new Error(`Unexpected answer: ${JSON.stringify(parsed)}`);
      }
      return { sessionType: parsed.sessionType, reason: parsed.reason.trim() };
    } catch (err) {
      this.logger.warn(`Session suggestion failed: ${(err as Error).message}`);
      throw new ServiceUnavailableException(
        "Suggestions aren't available right now. Any session is a good place to start.",
      );
    }
  }

  // Sends a prompt to Gemini and returns the text of the answer
  private async callGemini(prompt: string, json = false): Promise<string> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

    const model = this.config.get<string>('GEMINI_MODEL') ?? 'gemini-flash-lite-latest';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        ...(json && { generationConfig: { responseMimeType: 'application/json' } }),
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error(`Gemini responded with ${res.status}: ${await res.text()}`);

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error('Empty response from Gemini');
    return text;
  }

  private fallback(slot: Slot): string {
    return `Hi ${slot.bookedName}, your ${slot.durationMinutes}-minute ${slot.sessionType.toLowerCase()} session on ${this.formatDay(slot.date)} at ${slot.startTime.slice(0, 5)} is confirmed. See you at the gym!`;
  }

  // "2026-10-28" -> "Wednesday 28 October"
  private formatDay(date: string): string {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
    });
  }
}