"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import LoadingScreen from './LoadingScreen';
import { startGlobalFramePreload, onGlobalPreloadProgress, PRELOADER_QUARTER_FRAMES } from '@/lib/globalFramePreloader';

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [stage, setStage] = useState<'blank' | 'preloader' | 'ready'>('blank');
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    // If preloader has already run once in this session, skip preloader immediately on page changes
    if (typeof window !== 'undefined' && sessionStorage.getItem('nobleshop_has_preloaded')) {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
      setStage('ready');
      return;
    }

    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    startGlobalFramePreload();
    setStage('preloader');

    const MIN_PRELOAD_TIME = 20000; // 20 seconds minimum luxury preloader dwell time on initial load
    const startTime = Date.now();
    let actualLoaded = 0;
    const TOTAL_FRAMES = PRELOADER_QUARTER_FRAMES; // 1852 frames

    const unsubscribe = onGlobalPreloadProgress((loaded) => {
      actualLoaded = loaded;
    });

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const timeRatio = Math.min(1, elapsed / MIN_PRELOAD_TIME);
      const actualRatio = Math.min(1, actualLoaded / TOTAL_FRAMES);

      // Smooth progress tracks whichever is higher (time ratio or actual load ratio)
      const currentRatio = Math.max(timeRatio, actualRatio);
      const currentCount = Math.round(currentRatio * TOTAL_FRAMES);

      setDisplayCount(currentCount);

      // Transition to ready stage when 20 seconds elapsed AND 100% progress achieved
      if (currentRatio >= 1 && elapsed >= MIN_PRELOAD_TIME) {
        clearInterval(interval);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('nobleshop_has_preloaded', 'true');
        }
        if (typeof document !== 'undefined') {
          document.body.style.overflow = '';
        }
        setTimeout(() => setStage('ready'), 800);
      }
    }, 50);

    return () => {
      clearInterval(interval);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {stage === 'blank' && (
          <motion.div
            key="blank-stage"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: '#070608',
              zIndex: 999999,
            }}
          />
        )}

        {stage === 'preloader' && (
          <LoadingScreen key="preloader" loadedCount={displayCount} totalCount={PRELOADER_QUARTER_FRAMES} />
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: stage === 'ready' ? 1 : 0, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', flexDirection: 'column', flex: 1, visibility: stage === 'ready' ? 'visible' : 'hidden' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
