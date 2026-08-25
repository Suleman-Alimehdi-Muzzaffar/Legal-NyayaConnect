import googleapis from "googleapis";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "./logger";

const { google } = googleapis;

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// Refresh tokens are persisted to disk so connections survive server restarts.
const TOKENS_FILE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../data/google-tokens.json",
);

function loadTokens(): Map<string, string> {
  try {
    const raw = readFileSync(TOKENS_FILE, "utf8");
    const parsed: Record<string, string> = JSON.parse(raw);
    return new Map(Object.entries(parsed));
  } catch {
    return new Map();
  }
}

function persistTokens(): void {
  try {
    mkdirSync(path.dirname(TOKENS_FILE), { recursive: true });
    writeFileSync(
      TOKENS_FILE,
      JSON.stringify(Object.fromEntries(refreshTokens), null, 2),
      "utf8",
    );
  } catch (err) {
    logger.warn({ err }, "failed to persist google tokens");
  }
}

const refreshTokens = loadTokens();

export function isGoogleConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET && REDIRECT_URI);
}

function oauth2Client() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

export function getGoogleAuthUrl(userId: string): string {
  return oauth2Client().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state: userId,
  });
}

export async function storeGoogleTokens(userId: string, code: string): Promise<void> {
  const { tokens } = await oauth2Client().getToken(code);
  if (!tokens.refresh_token) {
    throw new Error("Google did not return a refresh token (re-consent required)");
  }
  refreshTokens.set(userId, tokens.refresh_token);
  persistTokens();
  logger.info({ userId }, "stored google refresh token");
}

export function hasGoogleTokens(userId: string): boolean {
  return refreshTokens.has(userId);
}

export interface MeetEventInput {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
}

export async function createMeetLink(userId: string, input: MeetEventInput): Promise<string> {
  const refreshToken = refreshTokens.get(userId);
  if (!refreshToken) {
    throw new Error("Google Calendar is not connected for this account");
  }
  const auth = oauth2Client();
  auth.setCredentials({ refresh_token: refreshToken });
  const calendar = google.calendar({ version: "v3", auth });

  const response = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: input.summary,
      description: input.description,
      start: { dateTime: input.startDateTime },
      end: { dateTime: input.endDateTime },
      conferenceData: {
        createRequest: {
          requestId: `nyaya-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  const link = response.data.hangoutLink;
  if (!link) {
    throw new Error("Google Calendar returned no hangout link");
  }
  return link;
}

const TZ_OFFSET = process.env.TZ_OFFSET ?? "+05:30";
export function toDateTimeOffset(date: string, time: string): string {
  const parts = time.trim().split(/\s+/);
  const [hourPart, minutePart] = (parts[0] ?? "09:00").split(":");
  let hours = Number(hourPart) || 0;
  const minutes = Number(minutePart) || 0;
  const meridian = parts[1]?.toUpperCase();
  if (meridian === "PM" && hours < 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return `${date}T${hh}:${mm}:00${TZ_OFFSET}`;
}

export function addMinutesOffset(dateTime: string, minutes: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):\d{2}([+-]\d{2}:\d{2}|Z)$/.exec(dateTime);
  if (!match) {
    throw new Error(`Invalid dateTime: ${dateTime}`);
  }
  const [, year, month, day, hours, mins, offset] = match;
  const base = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hours), Number(mins));
  const shifted = new Date(base + minutes * 60_000);
  const hh = String(shifted.getUTCHours()).padStart(2, "0");
  const mm = String(shifted.getUTCMinutes()).padStart(2, "0");
  const dd = String(shifted.getUTCDate()).padStart(2, "0");
  const mo = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  return `${shifted.getUTCFullYear()}-${mo}-${dd}T${hh}:${mm}:00${offset}`;
}
