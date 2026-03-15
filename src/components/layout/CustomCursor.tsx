'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 250 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  useEffect(() => {
    setHasMounted(true);
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('cursor-pointer')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!hasMounted) return null;

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null; // Don't show on touch devices
  }

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
      style={{
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Central Point - Made slightly larger and more visible */}
      <motion.div
        animate={{
          scale: isHovering ? 0 : 1,
        }}
        className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
      />

      {/* Crosshair Lines */}
      <motion.div
        animate={{
          width: isHovering ? 48 : 24,
          height: isHovering ? 48 : 24,
          rotate: isHovering ? 45 : 0,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/40 rounded-sm"
      >
        {/* Targeting Brackets (visible on hover) */}
        {isHovering && (
          <>
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--accent-teal)]" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--accent-teal)]" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--accent-teal)]" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--accent-teal)]" />
          </>
        )}
      </motion.div>

      {/* Extended Reticle Lines - More visible */}
      {!isHovering && (
        <>
          <div className="absolute top-1/2 left-[-14px] w-3 h-px bg-white/60 -translate-y-1/2" />
          <div className="absolute top-1/2 right-[-14px] w-3 h-px bg-white/60 -translate-y-1/2" />
          <div className="absolute top-[-14px] left-1/2 w-px h-3 bg-white/60 -translate-x-1/2" />
          <div className="absolute bottom-[-14px] left-1/2 w-px h-3 bg-white/60 -translate-x-1/2" />
        </>
      )}
    </motion.div>
  );
};

export default CustomCursor;
