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
const AFRICA_COUNT     = 480; // 480 africa_*.webp files in /public/storyboard-frames/
const HERO_TOTAL       = ASIA_COUNT + AFRICA_COUNT; // 960
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
  private concurrency = 32;

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

  private async processQueue() {
    if (this.activeConnections >= this.concurrency || this.queue.length === 0) return;
    this.activeConnections++;
    const item = this.queue.shift()!;
    try {
      await this.loadFrame(item.cache, item.url, item.index);
    } catch {
      // silently fail — keep queue moving
    } finally {
      this.activeConnections--;
      item.resolve();
      this.processQueue();
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

    const initialHeroCount       = Math.floor(HERO_TOTAL * 0.25); // 240
    const initialCategoryCount   = 100;
    const initialProvenanceCount = 40;
    const initialGlobeCount      = 40;

    const totalInitial =
      initialHeroCount +
      initialCategoryCount +
      initialProvenanceCount +
      initialGlobeCount;

    this.setInitialLoadTarget(totalInitial);

    for (let i = 0; i < initialHeroCount; i++)
      this.addToQueue(getHeroFrameUrl(i), hCache, i, true);
    for (let i = 0; i < initialCategoryCount; i++)
      this.addToQueue(getCategoryFrameUrl(i), cCache, i, true);
    for (let i = 0; i < initialProvenanceCount; i++)
      this.addToQueue(getProvenanceFrameUrl(i), pCache, i, true);
    for (let i = 0; i < initialGlobeCount; i++)
      this.addToQueue(getGlobeFrameUrl(i), gCache, i, true);

    setTimeout(() => {
      for (let i = initialHeroCount; i < HERO_TOTAL; i++)
        this.addToQueue(getHeroFrameUrl(i), hCache, i, false);
      for (let i = initialCategoryCount; i < CATEGORY_TOTAL; i++)
        this.addToQueue(getCategoryFrameUrl(i), cCache, i, false);
      for (let i = initialProvenanceCount; i < PROVENANCE_TOTAL; i++)
        this.addToQueue(getProvenanceFrameUrl(i), pCache, i, false);
      for (let i = initialGlobeCount; i < GLOBE_TOTAL; i++)
        this.addToQueue(getGlobeFrameUrl(i), gCache, i, false);
    }, 200);
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
  fallbackUrl: string = "/hero-artisan.jpg"
): HTMLImageElement | null {
  // 1. Direct hit
  const cached = cache.get(index);
  if (cached && cached.complete && cached.naturalWidth > 0) return cached;

  // 2. Search adjacent frames (+/- 15)
  for (let delta = 1; delta <= 15; delta++) {
    const prev = cache.get(index - delta);
    if (prev && prev.complete && prev.naturalWidth > 0) return prev;
    const next = cache.get(index + delta);
    if (next && next.complete && next.naturalWidth > 0) return next;
  }

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

  // 4. Return frame 0 or static fallback
  const firstFrame = cache.get(0);
  if (firstFrame && firstFrame.complete && firstFrame.naturalWidth > 0) return firstFrame;

  return getFallbackImage(fallbackUrl);
}

// ─── Exported singleton preloader ─────────────────────────────────────────────
export const preloader: ParallelPreloader = (() => {
  if (typeof window === "undefined") return new ParallelPreloader();
  const s = getWindowState();
  return s!.preloader;
})();

// ─── Public start function ────────────────────────────────────────────────────
export function startGlobalFramePreload() {
  if (typeof window === "undefined") return;
  const s = getWindowState();
  if (!s || s.started) return;
  s.started = true;
  s.preloader.startPreload(s.heroCache, s.categoryCache, s.provenanceCache, s.globeCache);
}
