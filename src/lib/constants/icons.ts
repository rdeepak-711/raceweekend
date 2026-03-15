/**
 * Shared icon mappings used across F1 and MotoGP guide & where-to-stay pages.
 * Centralised here to avoid duplication.
 */

export const SECTION_ICONS: Record<string, string> = {
  'the city':          '🌆',
  'city':              '🌆',
  'neighbourhoods':    '🗺️',
  'neighborhoods':     '🗺️',
  'food':              '🍜',
  'food & drink':      '🍜',
  'food and drink':    '🍜',
  'drink':             '🍸',
  'race weekend':      '🏎️',
  'race weekend vibe': '🏎️',
  'getting around':    '🚇',
  'transport':         '🚇',
  'must-see':          '⭐',
  'must see':          '⭐',
  'attractions':       '⭐',
  'culture':           '🎭',
  'nightlife':         '🌙',
  'shopping':          '🛍️',
  'weather':           '☀️',
  'language':          '💬',
  'money':             '💴',
  'safety':            '🛡️',
};

/** MotoGP-specific overrides (race weekend icon = bike) */
export const SECTION_ICONS_MOTOGP: Record<string, string> = {
  ...SECTION_ICONS,
  'race weekend':      '🏍️',
  'race weekend vibe': '🏍️',
};

export const NEIGHBORHOOD_ICONS: Record<string, string> = {
  'bund':        '🌆', 'pudong':      '🏙️', 'french':      '🌳',
  'xintiandi':   '🍸', 'old town':    '🏯', 'city centre': '🏨',
  'city center': '🏨', 'downtown':    '🏨', 'beach':       '🏖️',
  'marina':      '⛵',  'harbour':     '⚓', 'harbor':      '⚓',
  'port':        '⚓', 'waterfront':  '🌊',
  'old':         '🏛️', 'historic':    '🏛️', 'medina':      '🕌',
  'new':         '✨', 'modern':      '🌆', 'business':    '💼',
  'financial':   '💼',
  'north':       '🧭', 'south':       '🧭', 'east':        '🧭',
  'west':        '🧭', 'central':     '📍',
  'luxury':      '💎', 'budget':      '💰', 'boutique':    '🛍️',
  'hostel':      '🎒', 'circuit':     '🏎️',
  'quiet':       '🌿', 'suburb':      '🌿', 'residential': '🏡',
};

export function getSectionIcon(heading: string, icons: Record<string, string> = SECTION_ICONS): string {
  const key = heading.toLowerCase();
  for (const [phrase, icon] of Object.entries(icons)) {
    if (key.includes(phrase)) return icon;
  }
  return '📍';
}

export function getNeighborhoodIcon(heading: string): string {
  const lower = heading.toLowerCase();
  for (const [key, icon] of Object.entries(NEIGHBORHOOD_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '🏨';
}
