"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import LoadingScreen from './LoadingScreen';
import { startGlobalFramePreload, onGlobalPreloadProgress, PRELOADER_QUARTER_FRAMES } from '@/lib/globalFramePreloader';

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [stage, setStage] = useState<'blank' | 'preloader' | 'ready'>('blank');
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    startGlobalFramePreload();

    const unsubscribe = onGlobalPreloadProgress((loaded, total) => {
      setLoadedCount(loaded);

      // Transition to preloader screen immediately as initial frames arrive
      if (loaded >= 5) {
        setStage((prev) => (prev === 'blank' ? 'preloader' : prev));
      }

      // Unlock website reveal when 100% of Hero frames are preloaded
      if (loaded >= total) {
        if (typeof document !== 'undefined') {
          document.body.style.overflow = '';
        }
        setTimeout(() => setStage('ready'), 300);
      }
    });

    // Fallback timer ensures page unlocks if connection is slow
    const fallbackTimer = setTimeout(() => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
      setStage('ready');
    }, 4500);

    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
      clearTimeout(fallbackTimer);
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
          <LoadingScreen key="preloader" loadedCount={loadedCount} totalCount={PRELOADER_QUARTER_FRAMES} />
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
