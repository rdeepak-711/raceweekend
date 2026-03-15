import { ImageResponse } from 'next/og';
import { getItinerary } from '@/services/itinerary.service';
import { getRaceById } from '@/services/race.service';
import { SERIES_META } from '@/lib/constants/series';

export const runtime = 'nodejs';
export const alt = 'Race Weekend Strategy Briefing';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  const { id } = params;
  const itinerary = await getItinerary(id);
  if (!itinerary) return new ImageResponse(<div>Not Found</div>);

  const race = await getRaceById(itinerary.raceId);
  if (!race) return new ImageResponse(<div>Race Not Found</div>);

  const meta = SERIES_META[race.series];
  const sessionCount = (itinerary.sessionsSelected as any[])?.length || 0;
  const experienceCount = (itinerary.experiencesSelected as any[])?.length || 0;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: '#06060A',
          padding: '80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background Grid */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }} 
        />

        {/* Accent Bar */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '12px',
            height: '100%',
            backgroundColor: meta.color,
          }} 
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          <div style={{ fontSize: '40px' }}>{race.flagEmoji}</div>
          <div 
            style={{ 
              fontSize: '24px', 
              fontWeight: 900, 
              color: meta.color, 
              letterSpacing: '0.3em',
              textTransform: 'uppercase'
            }}
          >
            {race.series.toUpperCase()} ROUND {race.round}
          </div>
        </div>

        <h1 
          style={{ 
            fontSize: '84px', 
            fontWeight: 900, 
            color: 'white', 
            margin: 0,
            textTransform: 'uppercase',
            fontStyle: 'italic',
            letterSpacing: '-0.05em'
          }}
        >
          {race.city} Grand Prix
        </h1>

        <div style={{ display: 'flex', gap: '40px', marginTop: '60px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#6E6E82', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Strategic_Assets
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '48px', fontWeight: 900, color: 'white' }}>{sessionCount + experienceCount}</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#A0A0B4' }}>DEPLOYED</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#6E6E82', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Squad_Size
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '48px', fontWeight: 900, color: 'white' }}>{itinerary.groupSize}</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#A0A0B4' }}>PERSONNEL</span>
            </div>
          </div>
        </div>

        {/* Branding Footer */}
        <div 
          style={{ 
            position: 'absolute', 
            bottom: '60px', 
            right: '80px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '10px', fontWeight: 900, color: '#4ADE80', letterSpacing: '0.2em' }}>STATUS: OPTIMIZED</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'white', fontStyle: 'italic' }}>RACEWEEKEND.APP</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
