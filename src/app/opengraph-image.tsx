import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/jpeg';
export const alt = 'Race Weekend — F1 & MotoGP Travel Guide';

export default async function Image() {
  // Load background image
  let bgData: string | null = null;
  try {
    const buf = await readFile(join(process.cwd(), 'public/og-hero.jpg'));
    bgData = `data:image/jpeg;base64,${buf.toString('base64')}`;
  } catch (e) {
    console.error('Failed to load root OG image:', e);
  }

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: 1200, height: 630, background: '#15151E', position: 'relative', overflow: 'hidden' }}>
        {bgData && (
          <img 
            src={bgData} 
            style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }} 
          />
        )}
        {/* Dark overlay with dual glow */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(225,6,0,0.55) 0%, rgba(21,21,30,0.7) 45%, rgba(255,107,0,0.3) 100%)' }} />
        {/* Bottom fade */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(21,21,30,0.95) 0%, transparent 60%)' }} />

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '72px 88px', width: '100%' }}>
          {/* Series badges */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{ background: '#E10600', borderRadius: 8, padding: '5px 14px', color: 'white', fontSize: 15, fontWeight: 800, letterSpacing: 1 }}>🏎 F1</div>
            <div style={{ background: '#FF6B00', borderRadius: 8, padding: '5px 14px', color: 'white', fontSize: 15, fontWeight: 800, letterSpacing: 1 }}>🏍 MotoGP</div>
          </div>
          {/* Headline */}
          <div style={{ fontSize: 80, fontWeight: 900, color: 'white', lineHeight: 1.0, letterSpacing: -3, textTransform: 'uppercase' }}>
            RACE WEEKEND
          </div>
          {/* Subtitle */}
          <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.65)', marginTop: 14 }}>
            2026 Season · Sessions · Experiences · Tickets · Itineraries
          </div>
          {/* Domain */}
          <div style={{ marginTop: 20, fontSize: 15, color: 'rgba(255,255,255,0.35)', letterSpacing: 3, textTransform: 'uppercase' }}>
            RACEWEEKEND.APP
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
