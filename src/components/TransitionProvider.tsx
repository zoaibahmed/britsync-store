"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import LoadingScreen from './LoadingScreen';
import { startGlobalFramePreload, onGlobalPreloadProgress, PRELOADER_QUARTER_FRAMES } from '@/lib/globalFramePreloader';

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [stage, setStage] = useState<'preloader' | 'ready'>('preloader');
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isReload = (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)?.type === 'reload';
      const hasPreloaded = sessionStorage.getItem('nobleshop_preloaded');

      // If already preloaded in this tab session and NOT a page refresh, skip preloader on page navigation
      if (hasPreloaded && !isReload) {
        setStage('ready');
        if (typeof document !== 'undefined') {
          document.body.style.overflow = '';
        }
        return;
      }
    }

    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    startGlobalFramePreload();

    const MIN_PRELOAD_TIME = 55000; // 55 seconds preloader duration (guarantees 50s-60s on screen)
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

      // Smooth progress fills up over the full 55 seconds
      const currentRatio = Math.max(timeRatio, actualRatio);
      const currentCount = Math.round(currentRatio * TOTAL_FRAMES);

      setDisplayCount(currentCount);

      // Transition to ready stage after 55 seconds (55000 ms)
      if (elapsed >= MIN_PRELOAD_TIME) {
        clearInterval(interval);
        if (typeof document !== 'undefined') {
          document.body.style.overflow = '';
        }
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('nobleshop_preloaded', 'true');
        }
        setTimeout(() => setStage('ready'), 500);
      }
    }, 40);

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

  const progressPct = Math.min(100, Math.round((displayCount / PRELOADER_QUARTER_FRAMES) * 100));

  return (
    <>
      <AnimatePresence mode="wait">
        {stage === 'preloader' && (
          <LoadingScreen key="preloader" progress={progressPct} />
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: stage === 'ready' ? 1 : 0, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', flexDirection: 'column', flex: 1, visibility: stage === 'ready' ? 'visible' : 'hidden' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
