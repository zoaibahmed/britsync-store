/**
 * globalFramePreloader.ts
 *
 * Singleton preloader that aggressively loads ALL animation frames
 * (Provenance Core + Artisan Globe) into browser memory during the
 * website's initial loading screen.
 *
 * Both SafeguardsOriginExperience and ArtisanGlobeJourney share
 * their own module-level caches. This module triggers their
 * population as early as possible so the user never sees lag.
 */

const PROVENANCE_TOTAL = 360;
const GLOBE_ASIA_TOTAL = 120;
const GLOBE_AFRICA_TOTAL = 80;

// Shared caches — same objects imported by the actual components
export const provenanceCache = new Map<number, HTMLImageElement>();
export const globeCache = new Map<number, HTMLImageElement>();

let preloadStarted = false;

function loadIntoCache(
  cache: Map<number, HTMLImageElement>,
  url: string,
  index: number
): Promise<void> {
  if (cache.has(index)) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => { cache.set(index, img); resolve(); };
    img.onerror = () => resolve(); // silently skip failed frames
  });
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

/**
 * Call once — fires off progressive frame loading for all sections.
 * Safe to call multiple times (no-ops on repeat calls).
 */
export async function startGlobalFramePreload(): Promise<void> {
  if (preloadStarted || typeof window === 'undefined') return;
  preloadStarted = true;

  // ── Phase 1: Provenance Core — first 30 frames (priority) ────────
  const p1: Promise<void>[] = [];
  for (let i = 0; i < 30; i++) {
    const url = '/provenance-core/core_' + String(i + 1).padStart(4, '0') + '.webp';
    p1.push(loadIntoCache(provenanceCache, url, i));
  }
  await Promise.allSettled(p1);

  // ── Phase 2: Globe — first 30 Asia frames (priority) ─────────────
  const p2: Promise<void>[] = [];
  for (let i = 0; i < 30; i++) {
    const url = '/storyboard-frames/earth_asia_' + String(i + 1).padStart(4, '0') + '.webp';
    p2.push(loadIntoCache(globeCache, url, i));
  }
  await Promise.allSettled(p2);
  await sleep(50);

  // ── Phase 3: Remaining Provenance Core in chunks ──────────────────
  const remainingProvenance: number[] = [];
  for (let i = 30; i < PROVENANCE_TOTAL; i++) remainingProvenance.push(i);

  for (let i = 0; i < remainingProvenance.length; i += 15) {
    const chunk = remainingProvenance.slice(i, i + 15);
    await Promise.allSettled(
      chunk.map((idx) => {
        const url = '/provenance-core/core_' + String(idx + 1).padStart(4, '0') + '.webp';
        return loadIntoCache(provenanceCache, url, idx);
      })
    );
    await sleep(20);
  }

  // ── Phase 4: Remaining Globe Asia frames ──────────────────────────
  const remainingAsia: number[] = [];
  for (let i = 30; i < GLOBE_ASIA_TOTAL; i++) remainingAsia.push(i);

  for (let i = 0; i < remainingAsia.length; i += 15) {
    const chunk = remainingAsia.slice(i, i + 15);
    await Promise.allSettled(
      chunk.map((idx) => {
        const url = '/storyboard-frames/earth_asia_' + String(idx + 1).padStart(4, '0') + '.webp';
        return loadIntoCache(globeCache, url, idx);
      })
    );
    await sleep(20);
  }

  // ── Phase 5: Globe Africa frames ──────────────────────────────────
  const africaIndices: number[] = [];
  for (let i = 0; i < GLOBE_AFRICA_TOTAL; i++) africaIndices.push(i);

  for (let i = 0; i < africaIndices.length; i += 15) {
    const chunk = africaIndices.slice(i, i + 15);
    await Promise.allSettled(
      chunk.map((idx) => {
        const url = '/storyboard-frames/earth_africa_' + String(idx + 1).padStart(4, '0') + '.webp';
        // Globe Africa uses offset index (after Asia)
        return loadIntoCache(globeCache, url, GLOBE_ASIA_TOTAL + idx);
      })
    );
    await sleep(20);
  }
}
