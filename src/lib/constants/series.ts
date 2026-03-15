export type RaceSeries = 'f1' | 'motogp';

export const SERIES_META: Record<RaceSeries, {
  label: string;
  color: string;
  emoji: string;
  slug: string;
  description: string;
}> = {
  f1: {
    label: 'Formula 1',
    color: '#E10600',
    emoji: '🏎️',
    slug: 'f1',
    description: 'Formula 1 World Championship',
  },
  motogp: {
    label: 'MotoGP',
    color: '#FF6B00',
    emoji: '🏍️',
    slug: 'motogp',
    description: 'MotoGP World Championship',
  },
};
