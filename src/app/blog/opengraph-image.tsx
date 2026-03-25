import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/jpeg';
export const alt = 'Race Weekend Blog — F1 & MotoGP Travel Stories';

export default async function Image() {
  let bgData: string | null = null;
  try {
    const buf = await readFile(join(process.cwd(), 'public/og-hero.jpg'));
    bgData = `data:image/jpeg;base64,${buf.toString('base64')}`;
  } catch {}

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: 1200, height: 630, background: '#15151E', position: 'relative', overflow: 'hidden' }}>
        {bgData && (
          <img src={bgData} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,210,190,0.45) 0%, rgba(21,21,30,0.7) 50%, rgba(21,21,30,0.92) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(21,21,30,0.97) 0%, transparent 55%)' }} />

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '72px 88px', width: '100%' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{ background: '#00D2BE', borderRadius: 8, padding: '5px 16px', color: '#15151E', fontSize: 14, fontWeight: 800, letterSpacing: 1 }}>
              ✍️ BLOG
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '5px 16px', color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>
              F1 & MOTOGP TRAVEL STORIES
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 76, fontWeight: 900, color: 'white', lineHeight: 1.0, letterSpacing: -3, textTransform: 'uppercase' }}>
            RACE WEEKEND<br />BLOG
          </div>
          <div style={{ fontSize: 26, color: 'rgba(255,255,255,0.6)', marginTop: 14 }}>
            Race previews · City guides · Experience reviews
          </div>
          <div style={{ marginTop: 20, fontSize: 14, color: 'rgba(255,255,255,0.3)', letterSpacing: 3, textTransform: 'uppercase' }}>
            RACEWEEKEND.CO
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
