import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/jpeg';
export const alt = 'About Race Weekend — Built for fans, by a fan';

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
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,210,190,0.4) 0%, rgba(21,21,30,0.8) 50%, rgba(21,21,30,0.95) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(21,21,30,0.95) 0%, transparent 55%)' }} />

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '72px 88px', width: '100%' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{ background: 'rgba(0,210,190,0.2)', border: '1px solid rgba(0,210,190,0.4)', borderRadius: 8, padding: '5px 16px', color: '#00D2BE', fontSize: 14, fontWeight: 800, letterSpacing: 1 }}>
              ABOUT
            </div>
          </div>
          <div style={{ fontSize: 72, fontWeight: 900, color: 'white', lineHeight: 1.0, letterSpacing: -3, textTransform: 'uppercase' }}>
            BUILT FOR FANS.
          </div>
          <div style={{ fontSize: 72, fontWeight: 900, color: '#00D2BE', lineHeight: 1.0, letterSpacing: -3, textTransform: 'uppercase' }}>
            BY A FAN.
          </div>
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.55)', marginTop: 18 }}>
            Race Weekend — F1 & MotoGP travel planning for motorsport fans
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
