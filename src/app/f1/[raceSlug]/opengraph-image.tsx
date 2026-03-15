import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getRaceBySlug } from '@/services/race.service';
import { getRaceTheme } from '@/lib/constants/raceThemes';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/jpeg';

interface Props { params: Promise<{ raceSlug: string }> }

export default async function Image({ params }: Props) {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'f1');
  const theme = getRaceTheme(raceSlug);

  // Load circuit image, fallback to hero
  let bgData: string | null = null;
  for (const file of ['circuit.jpg', 'hero.jpg']) {
    const imgPath = join(process.cwd(), 'public/races', raceSlug, file);
    try {
      const buf = await readFile(imgPath);
      bgData = `data:image/jpeg;base64,${buf.toString('base64')}`;
      break;
    } catch {}
  }

  const accentHex = theme.accent;
  const glowRgba = theme.glowColor;

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: 1200, height: 630, background: '#15151E', position: 'relative', overflow: 'hidden' }}>
        {bgData && (
          <img 
            src={bgData} 
            style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} 
          />
        )}
        {/* Bottom gradient - always dark */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(21,21,30,0.97) 0%, rgba(21,21,30,0.5) 50%, transparent 100%)' }} />
        {/* Accent color bleed top-left */}
        <div style={{ position: 'absolute', top: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: glowRgba, filter: 'blur(80px)' }} />

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '64px 88px', width: '100%' }}>
          {/* Series + Round badge */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <div style={{ background: accentHex, borderRadius: 6, padding: '4px 12px', color: '#15151E', fontSize: 13, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
              F1 · Round {race?.round ?? ''} · 2026
            </div>
          </div>
          {/* Race name */}
          <div style={{ fontSize: race?.name && race.name.length > 24 ? 56 : 68, fontWeight: 900, color: 'white', lineHeight: 1.05, letterSpacing: -2, textTransform: 'uppercase' }}>
            {race?.name ?? raceSlug}
          </div>
          {/* Location + date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
              {race?.flagEmoji} {race?.circuitName} · {race?.city} · {race?.raceDate}
            </div>
          </div>
          {/* Branding */}
          <div style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.35)', letterSpacing: 3, textTransform: 'uppercase' }}>
            RACEWEEKEND.APP
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
