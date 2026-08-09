"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 900; // 0.9 second progress load
    const intervalTime = 10;
    const step = 100 / (duration / intervalTime);
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(100, prev + step);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0A0A0C',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Central Ambient Glow */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        width: '300px', 
        height: '300px', 
        opacity: 0.15,
        borderRadius: '50%',
        backgroundColor: 'var(--accent)',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        {/* Animated Brand Crest */}
        <div style={{ position: 'relative', filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.2))' }}>
          <motion.svg
            width="90"
            height="90"
            viewBox="0 0 100 100"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.2"
          >
            {/* Draw outer circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
            {/* Draw inner geometric crest */}
            <motion.path
              d="M50,22 L70,42 L70,58 L50,78 L30,58 L30,42 Z"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.0, ease: "easeInOut", delay: 0.1 }}
            />
            {/* Inner circle node */}
            <motion.circle
              cx="50"
              cy="50"
              r="4"
              fill="#D4AF37"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            />
          </motion.svg>
        </div>

        {/* Progress percentage in classic Playfair Display Numbers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            color: '#FAF9F6',
            fontSize: '2.5rem',
            fontWeight: 200,
            marginTop: '2rem',
            letterSpacing: '2px',
            fontStyle: 'italic'
          }}
        >
          {Math.round(progress)}%
        </motion.div>

        {/* Thin Gold Progress Bar */}
        <div style={{ width: '140px', height: '1px', backgroundColor: 'rgba(250, 249, 246, 0.1)', marginTop: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              width: `${progress}%`, 
              backgroundColor: 'var(--accent)', 
              boxShadow: '0 0 8px var(--accent)',
              transition: 'width 0.1s linear'
            }} 
          />
        </div>

        {/* Brand Text */}
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            fontFamily: 'var(--font-outfit), sans-serif',
            color: '#FAF9F6',
            fontSize: '0.65rem',
            letterSpacing: '5px',
            marginTop: '2rem',
            textTransform: 'uppercase',
            fontWeight: 300
          }}
        >
          BRITSYNC REGISTRY
        </motion.p>
      </div>
    </motion.div>
  );
}
