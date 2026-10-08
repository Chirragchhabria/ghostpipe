// FADI = (B11 - B12) / (B11 + B12). Sentinel-2 SWIR ash signal.
export interface SpectralPixel { b8a: number; b11: number; b12: number; }

export function fadi(p: SpectralPixel): number {
  const d = p.b11 + p.b12;
  return d === 0 ? 0 : (p.b11 - p.b12) / d;
}

export type SurfaceClass = 'fly-ash' | 'soil' | 'water' | 'vegetation' | 'uncertain';

export function classifyPixel(p: SpectralPixel): { fadi: number; cls: SurfaceClass } {
  const f = fadi(p);
  if (p.b11 < 0.03 && p.b12 < 0.03) return { fadi: f, cls: 'water' };
  if (f > 0.18 && p.b11 > 0.15) return { fadi: f, cls: 'fly-ash' };
  if (f > 0.1) return { fadi: f, cls: 'uncertain' };
  if (p.b8a > 0.35) return { fadi: f, cls: 'vegetation' };
  return { fadi: f, cls: 'soil' };
}

export function spectralWipeScore(before: SpectralPixel[], after: SpectralPixel[]) {
  let flips = 0, dSum = 0;
  const n = Math.min(before.length, after.length);
  for (let i = 0; i < n; i++) {
    const b = classifyPixel(before[i]);
    const a = classifyPixel(after[i]);
    dSum += a.fadi - b.fadi;
    if (b.cls !== 'fly-ash' && a.cls === 'fly-ash') flips++;
  }
  return { pctNewAsh: n ? (flips / n) * 100 : 0, meanFadiDelta: n ? dSum / n : 0 };
}
