"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  loadedCount?: number;
  totalCount?: number;
}

export default function LoadingScreen({ loadedCount = 0, totalCount = 1852 }: LoadingScreenProps) {
  const progress = totalCount > 0 ? Math.min(100, Math.round((loadedCount / totalCount) * 100)) : 0;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#070608',
        background: 'radial-gradient(circle at 50% 45%, #141218 0%, #070608 100%)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Central Ambient Gold Glow */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        width: '320px', 
        height: '320px', 
        opacity: 0.15,
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--accent, #D4AF37) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        {/* Animated Minimalist Brand Crest */}
        <div style={{ position: 'relative', filter: 'drop-shadow(0 0 18px rgba(212, 175, 55, 0.35))' }}>
          <motion.svg
            width="88"
            height="88"
            viewBox="0 0 100 100"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.2"
          >
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
            <motion.path
              d="M50,22 L70,42 L70,58 L50,78 L30,58 L30,42 Z"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.1, ease: "easeInOut", delay: 0.1 }}
            />
            <motion.circle
              cx="50"
              cy="50"
              r="4"
              fill="#D4AF37"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            />
          </motion.svg>
        </div>

        {/* Brand Title */}
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            color: '#FAF9F6',
            fontSize: '1.25rem',
            letterSpacing: '5px',
            marginTop: '1.8rem',
            marginBottom: '0.2rem',
            textTransform: 'uppercase',
            fontWeight: 300,
            textAlign: 'center'
          }}
        >
          NOBLESHOP
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            fontFamily: 'monospace',
            color: '#D4AF37',
            fontSize: '0.62rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '2rem'
          }}
        >
          HERITAGE ATELIER REGISTRY
        </motion.p>

        {/* Sleek Gold Progress Bar */}
        <div style={{ width: '180px', height: '2px', backgroundColor: 'rgba(250, 249, 246, 0.12)', position: 'relative', overflow: 'hidden', borderRadius: '1px' }}>
          <div 
            style={{ 
              height: '100%', 
              width: `${progress}%`, 
              backgroundColor: 'var(--accent, #D4AF37)', 
              boxShadow: '0 0 12px var(--accent, #D4AF37)',
              transition: 'width 0.1s linear'
            }} 
          />
        </div>

        {/* Luxury Gold Percentage Progress */}
        <div style={{ marginTop: '1.2rem', fontFamily: 'monospace', fontSize: '0.78rem', color: '#D4AF37', fontWeight: 600, letterSpacing: '2px' }}>
          {progress}%
        </div>
      </div>
    </motion.div>
  );
}
