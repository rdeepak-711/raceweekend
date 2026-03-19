import type { RaceSeries } from '@/lib/constants/series';

export type { RaceSeries };

export interface Race {
  id: number;
  series: RaceSeries;
  slug: string;
  name: string;
  season: number;
  round: number;
  circuitName: string;
  city: string;
  country: string;
  countryCode: string;
  circuitLat: number | null;
  circuitLng: number | null;
  timezone: string;
  raceDate: string;
  flagEmoji: string | null;
  isActive: boolean;
  isCancelled: boolean;
  officialTicketsUrl: string | null;
  officialEventUrl: string | null;
  hasExperiences: boolean;
  themeAccent: string | null;
  themeAccentAlt: string | null;
  themeGlow: string | null;
}

export interface Session {
  id: number;
  raceId: number;
  name: string;
  shortName: string;
  sessionType: 'fp1' | 'fp2' | 'fp3' | 'qualifying' | 'sprint' | 'race' | 'warmup' | 'practice' | 'support' | 'event';
  dayOfWeek: 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  seriesKey: string | null;
  seriesLabel: string | null;
}

export interface ExperienceWindow {
  id: number;
  raceId: number;
  slug: string;
  label: string;
  dayOfWeek: 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string | null;
  endTime: string | null;
  maxDurationHours: number | null;
  description: string;
  sortOrder: number;
}

export interface RaceContent {
  id: number;
  raceId: number;
  pageTitle: string | null;
  pageDescription: string | null;
  pageKeywords: string[] | null;
  guideIntro: string | null;
  tipsContent: string | null;
  faqItems: Array<{ question: string; answer: string }> | null;
  faqLd: unknown | null;
  circuitFacts: unknown | null;
  circuitMapSrc: string | null;
  gettingThere: string | null;
  whereToStay: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  whyCityText: string | null;
  highlightsList: string[] | null;
  gettingThereIntro: string | null;
  transportOptions: Array<{ icon: string; title: string; desc: string }> | null;
  travelTips: Array<{ heading: string; body: string } | string> | null;
  cityGuide: string | null;
  currency: string | null;
}
