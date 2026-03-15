/**
 * MotoGP API — uses the unofficial community Pulselive endpoint.
 * Falls back to static calendar if the API is unavailable.
 */

const PULSELIVE_BASE = 'https://api.motogp.pulselive.com/motogp/v1';

export interface MotoGPSeason {
  id: string;
  year: number;
  name: string;
}

export interface MotoGPEvent {
  id: string;
  name: string;
  short_name: string;
  country: string;
  circuit_name: string;
  start_date: string;
  end_date: string;
  status: string;
}

export async function getMotoGPSeasons(): Promise<MotoGPSeason[]> {
  try {
    const res = await fetch(`${PULSELIVE_BASE}/results/seasons`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`MotoGP seasons: ${res.status}`);
    return res.json();
  } catch {
    return [];
  }
}

export async function getMotoGP2026Events(): Promise<MotoGPEvent[]> {
  try {
    const seasons = await getMotoGPSeasons();
    const season2026 = seasons.find(s => s.year === 2026);
    if (!season2026) return STATIC_MOTOGP_2026;

    const res = await fetch(
      `${PULSELIVE_BASE}/results/events?seasonUuid=${season2026.id}&isFinished=false`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return STATIC_MOTOGP_2026;
    return res.json();
  } catch {
    return STATIC_MOTOGP_2026;
  }
}

/** Static fallback calendar — MotoGP 2026 */
export const STATIC_MOTOGP_2026: MotoGPEvent[] = [
  { id: 'mgp-th-2026',  name: 'Thailand Grand Prix',      short_name: 'THA', country: 'Thailand',      circuit_name: 'Chang International Circuit',           start_date: '2026-02-27', end_date: '2026-03-01', status: 'upcoming' },
  { id: 'mgp-ar-2026',  name: 'Argentina Grand Prix',     short_name: 'ARG', country: 'Argentina',     circuit_name: 'Autódromo Termas de Río Hondo',          start_date: '2026-03-27', end_date: '2026-03-29', status: 'upcoming' },
  { id: 'mgp-us-2026',  name: 'Americas Grand Prix',      short_name: 'AME', country: 'United States', circuit_name: 'Circuit of the Americas',                start_date: '2026-04-10', end_date: '2026-04-12', status: 'upcoming' },
  { id: 'mgp-pt-2026',  name: 'Portuguese Grand Prix',    short_name: 'POR', country: 'Portugal',      circuit_name: 'Autódromo Internacional do Algarve',     start_date: '2026-04-24', end_date: '2026-04-26', status: 'upcoming' },
  { id: 'mgp-es-2026',  name: 'Spanish Grand Prix',       short_name: 'ESP', country: 'Spain',         circuit_name: 'Circuito de Jerez',                      start_date: '2026-05-01', end_date: '2026-05-03', status: 'upcoming' },
  { id: 'mgp-fr-2026',  name: 'French Grand Prix',        short_name: 'FRA', country: 'France',        circuit_name: 'Circuit Bugatti',                        start_date: '2026-05-15', end_date: '2026-05-17', status: 'upcoming' },
  { id: 'mgp-it-2026',  name: 'Italian Grand Prix',       short_name: 'ITA', country: 'Italy',         circuit_name: 'Autodromo del Mugello',                  start_date: '2026-05-29', end_date: '2026-05-31', status: 'upcoming' },
  { id: 'mgp-nl-2026',  name: 'Dutch TT',                 short_name: 'NED', country: 'Netherlands',   circuit_name: 'TT Circuit Assen',                       start_date: '2026-06-26', end_date: '2026-06-28', status: 'upcoming' },
  { id: 'mgp-fi-2026',  name: 'Finnish Grand Prix',       short_name: 'FIN', country: 'Finland',       circuit_name: 'KymiRing',                               start_date: '2026-07-10', end_date: '2026-07-12', status: 'upcoming' },
  { id: 'mgp-de-2026',  name: 'German Grand Prix',        short_name: 'GER', country: 'Germany',       circuit_name: 'Sachsenring',                            start_date: '2026-07-17', end_date: '2026-07-19', status: 'upcoming' },
  { id: 'mgp-gb-2026',  name: 'British Grand Prix',       short_name: 'GBR', country: 'United Kingdom','circuit_name': 'Silverstone Circuit',                  start_date: '2026-07-31', end_date: '2026-08-02', status: 'upcoming' },
  { id: 'mgp-at-2026',  name: 'Austrian Grand Prix',      short_name: 'AUT', country: 'Austria',       circuit_name: 'Red Bull Ring',                          start_date: '2026-08-14', end_date: '2026-08-16', status: 'upcoming' },
  { id: 'mgp-sm-2026',  name: 'San Marino Grand Prix',    short_name: 'RSM', country: 'San Marino',    circuit_name: 'Misano World Circuit',                   start_date: '2026-09-04', end_date: '2026-09-06', status: 'upcoming' },
  { id: 'mgp-ag-2026',  name: 'Aragon Grand Prix',        short_name: 'ARA', country: 'Spain',         circuit_name: 'MotorLand Aragón',                       start_date: '2026-09-11', end_date: '2026-09-13', status: 'upcoming' },
  { id: 'mgp-jp-2026',  name: 'Japanese Grand Prix',      short_name: 'JPN', country: 'Japan',         circuit_name: 'Twin Ring Motegi',                       start_date: '2026-09-25', end_date: '2026-09-27', status: 'upcoming' },
  { id: 'mgp-id-2026',  name: 'Indonesia Grand Prix',     short_name: 'INA', country: 'Indonesia',     circuit_name: 'Pertamina Mandalika Street Circuit',     start_date: '2026-10-09', end_date: '2026-10-11', status: 'upcoming' },
  { id: 'mgp-au-2026',  name: 'Australian Grand Prix',    short_name: 'AUS', country: 'Australia',     circuit_name: 'Phillip Island Circuit',                 start_date: '2026-10-16', end_date: '2026-10-18', status: 'upcoming' },
  { id: 'mgp-my-2026',  name: 'Malaysian Grand Prix',     short_name: 'MAL', country: 'Malaysia',      circuit_name: 'Sepang International Circuit',           start_date: '2026-10-30', end_date: '2026-11-01', status: 'upcoming' },
  { id: 'mgp-qa-2026',  name: 'Qatar Grand Prix',         short_name: 'QAT', country: 'Qatar',         circuit_name: 'Losail International Circuit',           start_date: '2026-11-13', end_date: '2026-11-15', status: 'upcoming' },
  { id: 'mgp-va-2026',  name: 'Valencian Community GP',   short_name: 'VAL', country: 'Spain',         circuit_name: 'Circuit Ricardo Tormo',                  start_date: '2026-11-20', end_date: '2026-11-22', status: 'upcoming' },
];
