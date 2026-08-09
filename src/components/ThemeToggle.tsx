'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={onToggle}
      aria-label="Toggle Theme"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      style={{
        position: 'relative',
        width: '62px',
        height: '32px',
        borderRadius: '20px',
        backgroundColor: isDark ? 'rgba(18, 18, 22, 0.95)' : 'rgba(235, 233, 228, 0.95)',
        border: '1px solid',
        borderColor: isDark ? 'rgba(212, 175, 55, 0.4)' : 'rgba(10, 10, 12, 0.18)',
        padding: '3px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isDark ? 'flex-end' : 'flex-start',
        boxShadow: isDark 
          ? '0 4px 15px rgba(0,0,0,0.5)' 
          : '0 4px 15px rgba(0,0,0,0.06)',
        transition: 'background-color 0.4s ease, border-color 0.4s ease',
        overflow: 'hidden'
      }}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
    >
      {/* Background Track Icons */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 7px',
        fontSize: '0.72rem',
        pointerEvents: 'none',
        opacity: 0.65
      }}>
        <span>☀️</span>
        <span>🌙</span>
      </div>

      {/* Animated Sliding Thumb Disc */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#D4AF37',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(212, 175, 55, 0.6)',
          zIndex: 2,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={theme}
            initial={{ rotate: -180, scale: 0.2, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 180, scale: 0.2, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ fontSize: '0.72rem', lineHeight: 1, display: 'block' }}
          >
            {isDark ? '🌙' : '☀️'}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}
