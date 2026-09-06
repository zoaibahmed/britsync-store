"use client";

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import shoppingCartAnimation from '../../Shopping cart.json';

interface LoadingScreenProps {
  progress?: number;
}

export default function LoadingScreen({ progress = 0 }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animInstance: any = null;
    let isMounted = true;

    // Dynamically import lottie-web on client runtime only (prevents SSR vendor-chunks error)
    import('lottie-web').then((lottieModule) => {
      if (!isMounted || !containerRef.current) return;
      const lottie = lottieModule.default || lottieModule;
      animInstance = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: shoppingCartAnimation,
      });
    });

    return () => {
      isMounted = false;
      if (animInstance) {
        animInstance.destroy();
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#FFFFFF',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* 24k Gold Stroke Override without background circles or square boxes */}
      <style jsx global>{`
        .golden-lottie-container svg path {
          stroke: #C9A84C !important;
        }
      `}</style>

      {/* Centered Shopping Cart Lottie Animation with tight vertical spacing */}
      <div
        ref={containerRef}
        className="golden-lottie-container"
        style={{
          width: '180px',
          height: '130px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '-0.5rem',
          marginTop: '-1rem'
        }}
      />

      {/* Brand Title Beneath Preloader */}
      <motion.h1
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          color: '#1A1815',
          fontSize: '1.45rem',
          letterSpacing: '8px',
          margin: '0 0 0.4rem 0',
          textTransform: 'uppercase',
          fontWeight: 400,
          textAlign: 'center'
        }}
      >
        NOBLESHOP
      </motion.h1>

      {/* Subtitle Beneath Title */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{
          fontFamily: 'var(--font-outfit), sans-serif',
          color: '#C9A84C',
          fontSize: '0.65rem',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          margin: 0,
          fontWeight: 700,
          textAlign: 'center'
        }}
      >
        CURATED FOR BETTER LIVING
      </motion.p>

      {/* Discreet 2px Gold Progress Bar */}
      <div
        style={{
          width: '160px',
          height: '2px',
          backgroundColor: 'rgba(201, 168, 76, 0.15)',
          borderRadius: '999px',
          overflow: 'hidden',
          marginTop: '1.2rem',
          position: 'relative'
        }}
      >
        <motion.div
          style={{
            height: '100%',
            backgroundColor: '#C9A84C',
            width: `${Math.min(100, Math.max(0, progress))}%`,
            borderRadius: '999px',
            transition: 'width 0.2s linear'
          }}
        />
      </div>

      <span
        style={{
          fontSize: '0.62rem',
          color: '#8A8578',
          fontFamily: 'var(--font-outfit)',
          letterSpacing: '1.5px',
          marginTop: '0.45rem',
          fontWeight: 600
        }}
      >
        {Math.min(100, Math.max(0, progress))}%
      </span>
    </motion.div>
  );
}
