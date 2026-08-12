// Joins a path onto Astro/Vite's BASE_URL without producing a double slash —
// needed because everything under public/ must be reached through the
// GitHub Pages base path (e.g. /comp4020-ass1-AuroraSunDev/), not the root.
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL;
  return base.endsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

export function sceneFrameUrl(placeId: string, frameIndex: number): string {
  return assetUrl(`scenes/${placeId}/${frameIndex}.jpg`);
}
