'use client';

import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Disable on touch devices or if user prefers reduced motion
    if (typeof window === 'undefined') return;

    const touchMedia = window.matchMedia('(hover: none), (pointer: coarse)');
    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (touchMedia.matches || motionMedia.matches) {
      setIsTouchDevice(true);
      return;
    }

    // Hide default OS cursor when custom cursor is active
    document.body.classList.add('custom-cursor-active');

    const updateCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.getAttribute('role') === 'button' ||
          target.onclick !== null ||
          target.closest('button') ||
          target.closest('a'))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', updateCursor);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      <style jsx global>{`
        body.custom-cursor-active,
        body.custom-cursor-active *,
        body.custom-cursor-active button,
        body.custom-cursor-active input,
        body.custom-cursor-active a,
        body.custom-cursor-active select {
          cursor: none !important;
        }
      `}</style>

      {/* Custom Cursor Container */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 999999,
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          willChange: 'transform'
        }}
      >
        {/* Outer Ring — Perfectly Centered */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: isHovered ? '32px' : '22px',
            height: isHovered ? '32px' : '22px',
            borderRadius: '50%',
            border: isHovered ? '1.5px solid #c9a84c' : '1px solid rgba(201, 168, 76, 0.5)',
            backgroundColor: isHovered ? 'rgba(201, 168, 76, 0.08)' : 'transparent',
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.18s ease-out'
          }}
        />

        {/* Inner Precision Gold Dot — Perfectly Centered */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: '#c9a84c',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 6px rgba(201, 168, 76, 0.6)'
          }}
        />
      </div>
    </>
  );
}
