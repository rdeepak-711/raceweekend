'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface RaceImageProps extends Omit<ImageProps, 'onError'> {
  fallbackEmoji?: string;
  accentColor?: string;
}

export default function RaceImage({
  src,
  alt,
  fallbackEmoji = '🏁',
  accentColor = 'var(--accent-teal)',
  className,
  priority,
  loading,
  ...props
}: RaceImageProps) {
  const [error, setError] = useState(false);

  const isExternal = typeof src === 'string' && (
    src.includes('getyourguide.com') || src.includes('ticketm.net') || src.includes('ticketmaster.com')
  );

  if (!src || error) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-[var(--bg-tertiary)] relative overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 opacity-10 bg-grid-white/[0.05]" />
        <div
          className="absolute inset-0 blur-[100px] rounded-full opacity-20"
          style={{ backgroundColor: accentColor }}
        />
        <span className="text-5xl mb-2 relative z-10">{fallbackEmoji}</span>
        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] relative z-10">Telemetry_Offline</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      priority={priority}
      loading={priority ? undefined : loading}
      unoptimized={isExternal}
      onError={() => setError(true)}
      {...props}
    />
  );
}
