'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  photos: string[] | null;
  imageUrl?: string | null;
  title: string;
  color: string;
  imageEmoji: string;
}

/**
 * GYG Photo Formats:
 * [format_id] or "97" or "100" are often used.
 * "100" is the standard high-res numeric ID (1024px width).
 */
function upgradeUrl(url: string) {
  if (!url) return '';
  // Always replace the template tag if it exists
  let upgraded = url.replace('[format_id]', '100');
  // If it has numeric formats like /97.jpg or /88.jpg, try to upgrade to 100 for better quality
  upgraded = upgraded.replace(/\/(?:97|88|72|48)\.(jpg|jpeg|png|webp)/i, '/100.$1');
  return upgraded;
}

export default function PhotoSlider({ photos, imageUrl, title, color, imageEmoji }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const allPhotos = (photos && photos.length > 0) 
    ? photos.map(upgradeUrl) 
    : (imageUrl ? [upgradeUrl(imageUrl)] : []);
    
  const n = allPhotos.length;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  
  const nextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % n);
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + n) % n);
  };

  if (n === 0) {
    return (
      <div id="photos" className="relative h-72 sm:h-96 overflow-hidden rounded-2xl mb-8 border border-[var(--border-subtle)]">
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${color}30 0%, #06060A 55%, ${color}15 100%)`,
          }}
        >
          <span className="text-9xl select-none" style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' }}>
            {imageEmoji}
          </span>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: color }} />
      </div>
    );
  }

  return (
    <div id="photos" className="mb-12 group/gallery">
      {/* Side-by-side Scrollable Gallery with Original Proportions */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x select-none items-center h-[320px] sm:h-[500px]">
        {allPhotos.map((url, i) => (
          <div 
            key={url + i}
            onClick={() => openLightbox(i)}
            className="relative flex-shrink-0 h-full rounded-2xl overflow-hidden border border-white/5 bg-[#0D0D15] snap-start cursor-zoom-in transition-all duration-500 hover:scale-[1.01] hover:border-white/20 active:scale-95 group/item"
          >
              <Image
              src={url}
              alt={`${title} photo ${i + 1}`}
              width={1024}
              height={768}
              className="h-full w-auto object-contain block"
              loading={i < 3 ? "eager" : "lazy"}
              priority={i === 0}
              unoptimized
              referrerPolicy="no-referrer"
            />
            
            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
            
            {/* Expand Badge */}
            <div className="absolute bottom-4 left-4 opacity-0 group-hover/item:opacity-100 transition-all translate-y-2 group-hover/item:translate-y-0">
               <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap shadow-2xl">
                 Original Quality
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {mounted && lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/98 flex flex-col items-center justify-center animate-in fade-in duration-300" onClick={closeLightbox}>
          {/* Close */}
          <button 
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors border border-white/10 z-[110]"
            onClick={closeLightbox}
          >
            <X size={24} />
          </button>

          {/* Counter */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white/60 font-mono text-sm tracking-widest z-[110]">
            {lightboxIndex + 1} / {n}
          </div>

          {/* Main Photo Container */}
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-12" onClick={(e) => e.stopPropagation()}>
            <img
              src={allPhotos[lightboxIndex]}
              alt={`${title} lightbox`}
              className="max-w-full max-h-full object-contain shadow-2xl"
              referrerPolicy="no-referrer"
            />
            
            {/* Nav */}
            {n > 1 && (
              <>
                <button 
                  onClick={prevPhoto}
                  className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/5 z-[110]"
                >
                  <ChevronLeft size={40} />
                </button>
                <button 
                  onClick={nextPhoto}
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/5 z-[110]"
                >
                  <ChevronRight size={40} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails strip */}
          <div className="absolute bottom-8 w-full flex justify-center gap-2 px-4 overflow-x-auto scrollbar-hide z-[110]">
            {allPhotos.map((url, i) => (
              <button
                key={`thumb-${url}-${i}`}
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                className={`relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  lightboxIndex === i ? 'border-[var(--accent-teal)] scale-110 shadow-lg shadow-[var(--accent-teal)]/20' : 'border-transparent opacity-40 hover:opacity-100'
                }`}
              >
                <Image
                  src={url}
                  alt="thumb"
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
