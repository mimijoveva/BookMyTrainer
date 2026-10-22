import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Slot } from '../slots/slot.entity';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) {}

  async writeConfirmation(slot: Slot): Promise<string> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) return this.fallback(slot);

    const model = this.config.get<string>('GEMINI_MODEL') ?? 'gemini-flash-lite-latest';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

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
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) throw new Error(`Gemini responded with ${res.status}: ${await res.text()}`);

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!text) throw new Error('Empty response from Gemini');

      return text;
    } catch (err) {
      this.logger.warn(`Using fallback message: ${(err as Error).message}`);
      return this.fallback(slot);
    }
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