/**
 * globalFramePreloader.ts
 *
 * Singleton preloader with parallel workers (concurrency 32)
 * populating shared Maps in RAM.
 *
 * Uses a window-level singleton to prevent dual-instantiation
 * in Next.js production code-split builds, which caused frame-swap
 * between LuxuryHero and SafeguardsOriginExperience on VPS.
 *
 * IMPORTANT: ParallelPreloader class MUST be declared before any code
 * that references it, to avoid Temporal Dead Zone (TDZ) crashes.
 */

// ─── Constants ────────────────────────────────────────────────────────────────
const ASIA_COUNT       = 480;
const AFRICA_COUNT     = 432; // Ends cleanly at africa_0432.webp (excludes 0433..0489)
const HERO_TOTAL       = ASIA_COUNT + AFRICA_COUNT; // 912 frames total for Hero
const PROVENANCE_TOTAL = 360;
const GLOBE_TOTAL      = 130;
const CATEGORY_TOTAL   = 2400;

// ─── Frame URL generators ─────────────────────────────────────────────────────
export function getHeroFrameUrl(index: number): string {
  const safeIdx = Math.max(0, Math.min(HERO_TOTAL - 1, Math.floor(index)));
  if (safeIdx < ASIA_COUNT) {
    const num = String(safeIdx + 1).padStart(4, "0");
    return `/storyboard-frames/earth_asia_${num}.webp`;
  } else {
    const num = String(safeIdx - ASIA_COUNT + 1).padStart(4, "0");
    return `/storyboard-frames/africa_${num}.webp`;
  }
}

export function getCategoryFrameUrl(index: number): string {
  const num = String(Math.max(0, Math.min(CATEGORY_TOTAL - 1, index)) + 1).padStart(4, "0");
  return `/gallery-frames/frame-${num}.webp`;
}

export function getProvenanceFrameUrl(index: number): string {
  const num = String(Math.max(0, Math.min(PROVENANCE_TOTAL - 1, index)) + 1).padStart(4, "0");
  return `/provenance-core/core_${num}.webp`;
}

export function getGlobeFrameUrl(index: number): string {
  const num = String(Math.max(0, Math.min(GLOBE_TOTAL - 1, index)) + 1).padStart(4, "0");
  return `/hero-frames/frame-${num}.jpg`;
}

// ─── Parallel preloader class (MUST be defined before getWindowState) ─────────
class ParallelPreloader {
  private activeConnections = 0;
  private queue: Array<{
    url: string;
    cache: Map<number, HTMLImageElement>;
    index: number;
    resolve: () => void;
  }> = [];
  private concurrency = 48;

  private initialLoadResolver: (() => void) | null = null;
  private initialLoadPromise: Promise<void> | null = null;
  private initialLoadTarget = 0;
  private initialLoadCount = 0;
  private isInitialLoadDone = false;
  public isStarted = false;
  private progressListeners: Array<(pct: number) => void> = [];

  constructor() {
    if (typeof window !== "undefined") {
      this.initialLoadPromise = new Promise<void>((resolve) => {
        this.initialLoadResolver = resolve;
      });
    }
  }

  public getInitialLoadPromise(): Promise<void> {
    return this.initialLoadPromise || Promise.resolve();
  }

  public registerProgressListener(cb: (pct: number) => void) {
    this.progressListeners.push(cb);
    cb(this.getInitialProgress());
  }

  public unregisterProgressListener(cb: (pct: number) => void) {
    this.progressListeners = this.progressListeners.filter((l) => l !== cb);
  }

  public getInitialProgress(): number {
    if (this.initialLoadTarget === 0) return 0;
    return Math.min(100, Math.round((this.initialLoadCount / this.initialLoadTarget) * 100));
  }

  public addToQueue(
    url: string,
    cache: Map<number, HTMLImageElement>,
    index: number,
    isInitial = false
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      if (cache.has(index)) {
        if (isInitial) {
          this.initialLoadCount++;
          this.checkInitialProgress();
        }
        resolve();
        return;
      }
      this.queue.push({
        url,
        cache,
        index,
        resolve: () => {
          if (isInitial) {
            this.initialLoadCount++;
            this.checkInitialProgress();
          }
          resolve();
        },
      });
      this.processQueue();
    });
  }

  private checkInitialProgress() {
    const pct = this.getInitialProgress();
    this.progressListeners.forEach((l) => l(pct));
    if (this.isInitialLoadDone) return;
    if (this.initialLoadCount >= this.initialLoadTarget) {
      this.isInitialLoadDone = true;
      if (this.initialLoadResolver) this.initialLoadResolver();
    }
  }

  public setInitialLoadTarget(target: number) {
    this.initialLoadTarget = target;
    this.checkInitialProgress();
  }

  private processQueue() {
    while (this.activeConnections < this.concurrency && this.queue.length > 0) {
      this.activeConnections++;
      const item = this.queue.shift()!;
      this.loadFrame(item.cache, item.url, item.index).finally(() => {
        this.activeConnections--;
        item.resolve();
        this.processQueue();
      });
    }
  }

  private loadFrame(
    cache: Map<number, HTMLImageElement>,
    url: string,
    index: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      img.onload = () => {
        cache.set(index, img);
        resolve();
      };
      img.onerror = () => resolve();
    });
  }

  public startPreload(
    hCache: Map<number, HTMLImageElement>,
    cCache: Map<number, HTMLImageElement>,
    pCache: Map<number, HTMLImageElement>,
    gCache: Map<number, HTMLImageElement>
  ) {
    if (this.isStarted || typeof window === "undefined") return;
    this.isStarted = true;

    const initialHeroCount       = HERO_TOTAL;
    const initialCategoryCount   = 600;
    const initialProvenanceCount = PROVENANCE_TOTAL;
    const initialGlobeCount      = 40;

    const totalInitial =
      initialHeroCount +
      initialCategoryCount +
      initialProvenanceCount +
      initialGlobeCount;

    this.setInitialLoadTarget(totalInitial);

    // ── INTERLEAVED KEYFRAME PRELOADING ──────────────────────────────────────
    // Pass 1: Priority load keyframes spaced every 4th frame (0, 4, 8, 12...)
    // This populates the entire timeline from start to finish within 1 second on VPS!
    for (let i = 0; i < HERO_TOTAL; i += 4) {
      this.addToQueue(getHeroFrameUrl(i), hCache, i, true);
    }
    // Pass 2: Secondary keyframes (2, 6, 10, 14...)
    for (let i = 2; i < HERO_TOTAL; i += 4) {
      this.addToQueue(getHeroFrameUrl(i), hCache, i, true);
    }
    // Pass 3: Intermediate frames (1, 3, 5, 7...)
    for (let i = 1; i < HERO_TOTAL; i += 2) {
      this.addToQueue(getHeroFrameUrl(i), hCache, i, true);
    }

    // Provenance keyframe interleaving (every 3rd frame first)
    for (let i = 0; i < PROVENANCE_TOTAL; i += 3) {
      this.addToQueue(getProvenanceFrameUrl(i), pCache, i, true);
    }
    for (let i = 1; i < PROVENANCE_TOTAL; i += 3) {
      this.addToQueue(getProvenanceFrameUrl(i), pCache, i, true);
    }
    for (let i = 2; i < PROVENANCE_TOTAL; i += 3) {
      this.addToQueue(getProvenanceFrameUrl(i), pCache, i, true);
    }

    // Category Gallery keyframe interleaving (every 10th frame first across all 2400 frames)
    for (let i = 0; i < CATEGORY_TOTAL; i += 10) {
      this.addToQueue(getCategoryFrameUrl(i), cCache, i, true);
    }
    for (let i = 5; i < CATEGORY_TOTAL; i += 10) {
      this.addToQueue(getCategoryFrameUrl(i), cCache, i, true);
    }

    for (let i = 0; i < initialGlobeCount; i++)
      this.addToQueue(getGlobeFrameUrl(i), gCache, i, true);

    // Queue all remaining gallery and globe frames immediately so they cache during the 1-minute preloader
    for (let i = 0; i < CATEGORY_TOTAL; i++) {
      if (i % 5 !== 0) this.addToQueue(getCategoryFrameUrl(i), cCache, i, false);
    }
    for (let i = initialGlobeCount; i < GLOBE_TOTAL; i++) {
      this.addToQueue(getGlobeFrameUrl(i), gCache, i, false);
    }
  }
}

// ─── Window-level singleton (defined AFTER ParallelPreloader class) ───────────
// This prevents Next.js code-split builds from creating duplicate module
// instances with separate Map objects, which caused frame-swapping on VPS.
declare global {
  interface Window {
    __britsyncFrameState?: {
      heroCache:       Map<number, HTMLImageElement>;
      provenanceCache: Map<number, HTMLImageElement>;
      globeCache:      Map<number, HTMLImageElement>;
      categoryCache:   Map<number, HTMLImageElement>;
      preloader:       ParallelPreloader;
      started:         boolean;
    };
  }
}

function getWindowState() {
  if (typeof window === "undefined") return null;
  if (!window.__britsyncFrameState) {
    window.__britsyncFrameState = {
      heroCache:       new Map<number, HTMLImageElement>(),
      provenanceCache: new Map<number, HTMLImageElement>(),
      globeCache:      new Map<number, HTMLImageElement>(),
      categoryCache:   new Map<number, HTMLImageElement>(),
      preloader:       new ParallelPreloader(),
      started:         false,
    };
  }
  return window.__britsyncFrameState;
}

// ─── Exported cache getters (always return the singleton Maps) ─────────────────
export function getHeroCacheMap(): Map<number, HTMLImageElement> {
  const s = getWindowState();
  return s ? s.heroCache : new Map();
}
export function getProvenanceCacheMap(): Map<number, HTMLImageElement> {
  const s = getWindowState();
  return s ? s.provenanceCache : new Map();
}
export function getGlobeCacheMap(): Map<number, HTMLImageElement> {
  const s = getWindowState();
  return s ? s.globeCache : new Map();
}
export function getCategoryCacheMap(): Map<number, HTMLImageElement> {
  const s = getWindowState();
  return s ? s.categoryCache : new Map();
}

// ─── Fallback image cache ─────────────────────────────────────────────────────
const _fallbackImageMap = new Map<string, HTMLImageElement>();

export function getFallbackImage(url: string = "/hero-artisan.jpg"): HTMLImageElement | null {
  if (typeof window === "undefined") return null;
  let img = _fallbackImageMap.get(url);
  if (!img) {
    img = new Image();
    img.src = url;
    _fallbackImageMap.set(url, img);
  }
  if (img.complete && img.naturalWidth > 0) return img;
  return null;
}

// ─── Frame lookup with fallback ───────────────────────────────────────────────
export function getFrameWithFallback(
  cache: Map<number, HTMLImageElement>,
  index: number,
  getUrlFn: (i: number) => string,
  fallbackUrl: string = ""
): HTMLImageElement | null {
  // 1. Direct hit
  const cached = cache.get(index);
  if (cached && cached.complete && cached.naturalWidth > 0) return cached;

  // 2. Search full cache range for NEAREST loaded frame in RAM
  let nearestFrame: HTMLImageElement | null = null;
  let minDist = Infinity;

  cache.forEach((img, fIdx) => {
    if (img && img.complete && img.naturalWidth > 0) {
      const dist = Math.abs(fIdx - index);
      if (dist < minDist) {
        minDist = dist;
        nearestFrame = img;
      }
    }
  });

  // 3. On-demand load trigger
  if (typeof window !== "undefined") {
    const url = getUrlFn(index);
    const pendingImg = new Image();
    pendingImg.decoding = "async";
    pendingImg.src = url;
    pendingImg.onload = () => {
      cache.set(index, pendingImg);
    };
  }

  if (nearestFrame) return nearestFrame;

  // 4. Return static fallback ONLY if explicitly requested
  if (fallbackUrl) {
    return getFallbackImage(fallbackUrl);
  }
  return null;
}

// ─── Exported singleton preloader ─────────────────────────────────────────────
export const preloader: ParallelPreloader = (() => {
  if (typeof window === "undefined") return new ParallelPreloader();
  const s = getWindowState();
  return s!.preloader;
})();

export const PRELOADER_QUARTER_FRAMES = 1852; // 912 Hero frames + 800 Category + 100 Provenance + 40 Globe

export function onGlobalPreloadProgress(cb: (loaded: number, total: number) => void) {
  if (typeof window === "undefined") return () => {};
  const s = getWindowState();
  if (s && s.preloader) {
    return s.preloader.registerProgressListener((pct: number) => {
      const loaded = Math.round((pct / 100) * PRELOADER_QUARTER_FRAMES);
      cb(loaded, PRELOADER_QUARTER_FRAMES);
    });
  }
  cb(PRELOADER_QUARTER_FRAMES, PRELOADER_QUARTER_FRAMES);
  return () => {};
}

// ─── Public start function ────────────────────────────────────────────────────
export function startGlobalFramePreload() {
  if (typeof window === "undefined") return;
  const s = getWindowState();
  if (!s || s.started) return;
  s.started = true;
  s.preloader.startPreload(s.heroCache, s.categoryCache, s.provenanceCache, s.globeCache);
}
