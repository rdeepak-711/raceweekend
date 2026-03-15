export interface RaceTheme {
  accent: string;
  accentAlt: string;
  glowColor: string;
}

// Keys match actual DB slugs
export const RACE_THEMES: Record<string, RaceTheme> = {
  // F1 2026
  'australia-f1-2026':      { accent: '#00C9A0', accentAlt: '#00D2BE', glowColor: 'rgba(0,201,160,0.15)' },
  'china-f1-2026':          { accent: '#D4202A', accentAlt: '#C9A44C', glowColor: 'rgba(212,32,42,0.15)' },
  'japan-f1-2026':          { accent: '#FF2D55', accentAlt: '#FF7CA3', glowColor: 'rgba(255,45,85,0.15)' },
  'bahrain-f1-2026':        { accent: '#F5A623', accentAlt: '#E8830A', glowColor: 'rgba(245,166,35,0.15)' },
  'saudi-arabia-f1-2026':   { accent: '#00D2BE', accentAlt: '#00BFA5', glowColor: 'rgba(0,210,190,0.15)' },
  'miami-f1-2026':          { accent: '#00E8D1', accentAlt: '#FF00FF', glowColor: 'rgba(0,232,209,0.15)' },
  'emilia-romagna-f1-2026': { accent: '#009246', accentAlt: '#CE2B37', glowColor: 'rgba(0,146,70,0.15)' },
  'monaco-f1-2026':         { accent: '#B8860B', accentAlt: '#DAA520', glowColor: 'rgba(184,134,11,0.15)' },
  'spain-f1-2026':          { accent: '#ED1C24', accentAlt: '#FCEA10', glowColor: 'rgba(237,28,36,0.15)' },
  'canada-f1-2026':         { accent: '#FF0000', accentAlt: '#FFFFFF', glowColor: 'rgba(255,0,0,0.15)' },
  'austria-f1-2026':        { accent: '#FE0000', accentAlt: '#00193E', glowColor: 'rgba(254,0,0,0.15)' },
  'silverstone-f1-2026':    { accent: '#003087', accentAlt: '#0066CC', glowColor: 'rgba(0,48,135,0.15)' },
  'hungary-f1-2026':        { accent: '#436F4D', accentAlt: '#E32636', glowColor: 'rgba(67,111,77,0.15)' },
  'belgium-f1-2026':        { accent: '#FFD700', accentAlt: '#000000', glowColor: 'rgba(255,215,0,0.15)' },
  'zandvoort-f1-2026':      { accent: '#FF8200', accentAlt: '#21468B', glowColor: 'rgba(255,130,0,0.15)' },
  'monza-f1-2026':          { accent: '#009246', accentAlt: '#00A850', glowColor: 'rgba(0,146,70,0.15)' },
  'azerbaijan-f1-2026':     { accent: '#0092BC', accentAlt: '#E41E3A', glowColor: 'rgba(0,146,188,0.15)' },
  'singapore-f1-2026':      { accent: '#EF3340', accentAlt: '#FF6B6B', glowColor: 'rgba(239,51,64,0.15)' },
  'austin-f1-2026':         { accent: '#BF0D3E', accentAlt: '#00205B', glowColor: 'rgba(191,13,62,0.15)' },
  'mexico-f1-2026':         { accent: '#006341', accentAlt: '#C8102E', glowColor: 'rgba(0,99,65,0.15)' },
  'brazil-f1-2026':         { accent: '#009739', accentAlt: '#FEDD00', glowColor: 'rgba(0,151,57,0.15)' },
  'las-vegas-f1-2026':      { accent: '#C8102E', accentAlt: '#FFD700', glowColor: 'rgba(200,16,46,0.15)' },
  'qatar-f1-2026':          { accent: '#8D1B3D', accentAlt: '#FFFFFF', glowColor: 'rgba(141,27,61,0.15)' },
  'abu-dhabi-f1-2026':      { accent: '#00732F', accentAlt: '#FF0000', glowColor: 'rgba(0,115,47,0.15)' },

  // MotoGP 2026
  'thailand-motogp-2026':       { accent: '#EF3340', accentAlt: '#FFD700', glowColor: 'rgba(239,51,64,0.15)' },
  'brazil-motogp-2026':         { accent: '#009739', accentAlt: '#FEDD00', glowColor: 'rgba(0,151,57,0.15)' },
  'americas-motogp-2026':       { accent: '#BF0D3E', accentAlt: '#FF6B00', glowColor: 'rgba(191,13,62,0.15)' },
  'qatar-motogp-2026':          { accent: '#8D1B3D', accentAlt: '#FFFFFF', glowColor: 'rgba(141,27,61,0.15)' },
  'spain-motogp-2026':          { accent: '#FF6B00', accentAlt: '#FF8C3B', glowColor: 'rgba(255,107,0,0.15)' },
  'france-motogp-2026':         { accent: '#002395', accentAlt: '#ED2939', glowColor: 'rgba(0,35,149,0.15)' },
  'catalan-motogp-2026':        { accent: '#ED1C24', accentAlt: '#FCEA10', glowColor: 'rgba(237,28,36,0.15)' },
  'italy-motogp-2026':          { accent: '#009246', accentAlt: '#FF6B00', glowColor: 'rgba(0,146,70,0.15)' },
  'hungary-motogp-2026':        { accent: '#436F4D', accentAlt: '#E32636', glowColor: 'rgba(67,111,77,0.15)' },
  'czech-motogp-2026':          { accent: '#EE334E', accentAlt: '#11457E', glowColor: 'rgba(238,51,78,0.15)' },
  'netherlands-motogp-2026':    { accent: '#21468B', accentAlt: '#FF6B00', glowColor: 'rgba(33,70,139,0.15)' },
  'germany-motogp-2026':        { accent: '#FFCC00', accentAlt: '#FF6B00', glowColor: 'rgba(255,204,0,0.15)' },
  'britain-motogp-2026':        { accent: '#003087', accentAlt: '#FF6B00', glowColor: 'rgba(0,48,135,0.15)' },
  'aragon-motogp-2026':         { accent: '#ED1C24', accentAlt: '#FF6B00', glowColor: 'rgba(237,28,36,0.15)' },
  'san-marino-motogp-2026':     { accent: '#44BBFF', accentAlt: '#FF6B00', glowColor: 'rgba(68,187,255,0.15)' },
  'austria-motogp-2026':        { accent: '#FE0000', accentAlt: '#FF6B00', glowColor: 'rgba(254,0,0,0.15)' },
  'japan-motogp-2026':          { accent: '#FF2D55', accentAlt: '#FF6B00', glowColor: 'rgba(255,45,85,0.15)' },
  'indonesia-motogp-2026':      { accent: '#ED1C24', accentAlt: '#FFFFFF', glowColor: 'rgba(237,28,36,0.15)' },
  'australia-motogp-2026':      { accent: '#00843D', accentAlt: '#FF6B00', glowColor: 'rgba(0,132,61,0.15)' },
  'malaysia-motogp-2026':       { accent: '#EF3340', accentAlt: '#FF6B00', glowColor: 'rgba(239,51,64,0.15)' },
  'portugal-motogp-2026':       { accent: '#006600', accentAlt: '#FF0000', glowColor: 'rgba(0,102,0,0.15)' },
  'valencia-motogp-2026':       { accent: '#FF6B00', accentAlt: '#FFFFFF', glowColor: 'rgba(255,107,0,0.15)' },
};

const DEFAULT_THEME: RaceTheme = {
  accent: '#E10600',
  accentAlt: '#FF1801',
  glowColor: 'rgba(225,6,0,0.15)',
};

/**
 * Preferred: derive theme from DB-stored race fields, with hardcoded fallback.
 */
export function getThemeFromRace(race: { slug: string; themeAccent: string | null; themeAccentAlt: string | null; themeGlow: string | null }): RaceTheme {
  if (race.themeAccent && race.themeAccentAlt && race.themeGlow) {
    return { accent: race.themeAccent, accentAlt: race.themeAccentAlt, glowColor: race.themeGlow };
  }
  return getRaceTheme(race.slug);
}

/** @deprecated Use getThemeFromRace(race) instead */
export function getRaceTheme(slug: string): RaceTheme {
  // Try exact match first
  if (RACE_THEMES[slug]) return RACE_THEMES[slug];
  
  // Try matching by prefix (e.g. 'australia-f1' matches 'australia-f1-2026')
  const found = Object.keys(RACE_THEMES).find(key => slug.startsWith(key) || key.startsWith(slug));
  if (found) return RACE_THEMES[found];

  // MotoGP fallback
  if (slug.includes('motogp')) {
    return {
      accent: '#FF6B00',
      accentAlt: '#FF8533',
      glowColor: 'rgba(255,107,0,0.15)',
    };
  }

  return DEFAULT_THEME;
}
