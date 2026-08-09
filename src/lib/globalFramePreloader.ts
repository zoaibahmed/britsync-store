/**
 * globalFramePreloader.ts
 *
 * Singleton preloader with parallel workers (concurrency 32)
 * populating shared Maps in RAM.
 */

export const provenanceCache = new Map<number, HTMLImageElement>();
export const globeCache = new Map<number, HTMLImageElement>();
export const heroCache = new Map<number, HTMLImageElement>();
export const categoryCache = new Map<number, HTMLImageElement>();

const PROVENANCE_TOTAL = 360;
const GLOBE_TOTAL = 130;
const HERO_TOTAL = 912;
const CATEGORY_TOTAL = 2400;

export function getHeroFrameUrl(index: number): string {
  const ASIA_COUNT = 480;
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
  private isStarted = false;
  private progressListeners: Array<(pct: number) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
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
      if (this.initialLoadResolver) {
        this.initialLoadResolver();
      }
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
    } catch (e) {
      // silently fail
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
      img.onerror = () => {
        resolve(); // resolve anyway to keep queue moving
      };
    });
  }

  public startPreload() {
    if (this.isStarted || typeof window === 'undefined') return;
    this.isStarted = true;

    // Define initial loads (Fast 25% for landing hero + first category view)
    const initialHeroCount = Math.floor(HERO_TOTAL * 0.25); // 228
    const initialCategoryCount = 100;
    const initialProvenanceCount = 40;
    const initialGlobeCount = 40;

    const totalInitial =
      initialHeroCount +
      initialCategoryCount +
      initialProvenanceCount +
      initialGlobeCount;
    this.setInitialLoadTarget(totalInitial);

    // Queue initial vital frames first
    for (let i = 0; i < initialHeroCount; i++) {
      this.addToQueue(getHeroFrameUrl(i), heroCache, i, true);
    }
    for (let i = 0; i < initialCategoryCount; i++) {
      this.addToQueue(getCategoryFrameUrl(i), categoryCache, i, true);
    }
    for (let i = 0; i < initialProvenanceCount; i++) {
      this.addToQueue(getProvenanceFrameUrl(i), provenanceCache, i, true);
    }
    for (let i = 0; i < initialGlobeCount; i++) {
      this.addToQueue(getGlobeFrameUrl(i), globeCache, i, true);
    }

    // Queue remaining frames in background with slightly deferred schedule
    setTimeout(() => {
      for (let i = initialHeroCount; i < HERO_TOTAL; i++) {
        this.addToQueue(getHeroFrameUrl(i), heroCache, i, false);
      }
      for (let i = initialCategoryCount; i < CATEGORY_TOTAL; i++) {
        this.addToQueue(getCategoryFrameUrl(i), categoryCache, i, false);
      }
      for (let i = initialProvenanceCount; i < PROVENANCE_TOTAL; i++) {
        this.addToQueue(getProvenanceFrameUrl(i), provenanceCache, i, false);
      }
      for (let i = initialGlobeCount; i < GLOBE_TOTAL; i++) {
        this.addToQueue(getGlobeFrameUrl(i), globeCache, i, false);
      }
    }, 200);
  }
}

export const preloader = new ParallelPreloader();

export function startGlobalFramePreload() {
  preloader.startPreload();
}
