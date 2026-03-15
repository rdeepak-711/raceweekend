import { getActiveRaceBySeries } from '@/services/race.service';
import type { RaceSeries } from '@/lib/constants/series';

/** Returns the slug for the next upcoming race for a given series. */
export async function getActiveRaceSlug(series: RaceSeries): Promise<string> {
  if (series === 'f1' && process.env.ACTIVE_F1_RACE_SLUG) {
    return process.env.ACTIVE_F1_RACE_SLUG;
  }
  if (series === 'motogp' && process.env.ACTIVE_MOTOGP_RACE_SLUG) {
    return process.env.ACTIVE_MOTOGP_RACE_SLUG;
  }
  const race = await getActiveRaceBySeries(series);
  const fallback = series === 'f1' ? 'australia-f1-2026' : 'thailand-motogp-2026';
  return race?.slug ?? fallback;
}
