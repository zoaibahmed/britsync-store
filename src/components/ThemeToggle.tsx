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
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'relative',
        height: '34px',
        padding: '0.2rem 0.6rem 0.2rem 0.35rem',
        borderRadius: '24px',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--glass-border)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.3s ease',
        userSelect: 'none',
      }}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
    >
      {/* Sliding Thumb Indicator Disc */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={theme}
            initial={{ rotate: -90, opacity: 0, scale: 0.4 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.2 }}
            style={{ fontSize: '0.75rem', lineHeight: 1 }}
          >
            {isDark ? '🌙' : '☀️'}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      {/* Label Text */}
      <span
        style={{
          fontSize: "0.62rem",
          letterSpacing: "1.8px",
          textTransform: "uppercase",
          fontWeight: 700,
          color: "var(--text)",
          lineHeight: 1,
        }}
      >
        {isDark ? 'DARK' : 'LIGHT'}
      </span>
    </motion.button>
  );
}
