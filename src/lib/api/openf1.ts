import { apiFetch } from './client';

const BASE_URL = process.env.OPENF1_BASE_URL ?? 'https://api.openf1.org/v1';

export interface OpenF1Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  location: string;
  country_key: number;
  country_code: string;
  country_name: string;
  circuit_key: number;
  circuit_short_name: string;
  date_start: string;
  gmt_offset: string;
  year: number;
}

export interface OpenF1Session {
  session_key: number;
  meeting_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  location: string;
  country_key: number;
  country_code: string;
  country_name: string;
  circuit_key: number;
  circuit_short_name: string;
  year: number;
}

export interface OpenF1Position {
  session_key: number;
  meeting_key: number;
  driver_number: number;
  position: number;
  date: string;
}

export interface OpenF1Driver {
  session_key: number;
  meeting_key: number;
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string | null;
  first_name: string;
  last_name: string;
  headshot_url: string | null;
  country_code: string;
}

export interface OpenF1Lap {
  session_key: number;
  meeting_key: number;
  driver_number: number;
  lap_number: number;
  lap_duration: number | null;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  i1_speed: number | null;
  i2_speed: number | null;
  st_speed: number | null;
  is_pit_out_lap: boolean;
}

export interface OpenF1Weather {
  session_key: number;
  meeting_key: number;
  air_temperature: number;
  track_temperature: number;
  humidity: number;
  pressure: number;
  rainfall: number; // 0 or 1
  wind_direction: number;
  wind_speed: number;
  date: string;
}

export interface OpenF1CarData {
  session_key: number;
  driver_number: number;
  date: string;
  speed: number;
  rpm: number;
  gear: number;
  throttle: number;
  brake: number;
  drs: number;
}

export interface OpenF1Interval {
  session_key: number;
  meeting_key: number;
  date: string;
  driver_number: number;
  gap_to_leader: string | null;
  interval: string | null;
}

export async function getF1Meetings(year = 2026): Promise<OpenF1Meeting[]> {
  try {
    return await apiFetch<OpenF1Meeting[]>(`${BASE_URL}/meetings?year=${year}`, { revalidate: 3600 * 24, silent: true });
  } catch {
    return [];
  }
}

export async function getF1Sessions(meetingKey: number): Promise<OpenF1Session[]> {
  try {
    return await apiFetch<OpenF1Session[]>(`${BASE_URL}/sessions?meeting_key=${meetingKey}`, { revalidate: 3600 * 24, silent: true });
  } catch {
    return [];
  }
}

/** Live session positions — top 20. Cache 60s for live updates. */
export async function getSessionPositions(sessionKey: number): Promise<OpenF1Position[]> {
  try {
    return await apiFetch<OpenF1Position[]>(`${BASE_URL}/position?session_key=${sessionKey}&position%3C=20`, { revalidate: 60, silent: true });
  } catch {
    return [];
  }
}

/** Live intervals between drivers. Cache 60s. */
export async function getSessionIntervals(sessionKey: number): Promise<OpenF1Interval[]> {
  try {
    return await apiFetch<OpenF1Interval[]>(`${BASE_URL}/intervals?session_key=${sessionKey}`, { revalidate: 60, silent: true });
  } catch {
    return [];
  }
}

/** Session driver roster. Cache 300s. */
export async function getSessionDrivers(sessionKey: number): Promise<OpenF1Driver[]> {
  try {
    return await apiFetch<OpenF1Driver[]>(`${BASE_URL}/drivers?session_key=${sessionKey}`, { revalidate: 300, silent: true });
  } catch {
    return [];
  }
}

/** Session laps data. Cache 300s. */
export async function getSessionLaps(sessionKey: number): Promise<OpenF1Lap[]> {
  try {
    return await apiFetch<OpenF1Lap[]>(`${BASE_URL}/laps?session_key=${sessionKey}`, { revalidate: 300, silent: true });
  } catch {
    return [];
  }
}

/** Latest weather data for a session. */
export async function getSessionWeather(sessionKey: number): Promise<OpenF1Weather[]> {
  try {
    return await apiFetch<OpenF1Weather[]>(`${BASE_URL}/weather?session_key=${sessionKey}`, { revalidate: 60, silent: true });
  } catch {
    return [];
  }
}

/** Latest car telemetry for a driver. */
export async function getCarTelemetry(sessionKey: number, driverNumber: number): Promise<OpenF1CarData[]> {
  try {
    return await apiFetch<OpenF1CarData[]>(`${BASE_URL}/car_data?session_key=${sessionKey}&driver_number=${driverNumber}`, { revalidate: 10, silent: true });
  } catch {
    return [];
  }
}
