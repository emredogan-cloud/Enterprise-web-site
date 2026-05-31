import "server-only";

import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Static-asset existence helpers for the optional `/public/images` art layer
 * (Görsel Asset Pipeline).
 *
 * The cinematic pages ship with procedural CSS+SVG scenes / placeholders as
 * their baseline. This layer lets a real generated image (saved under
 * `/public/images/...`) *augment* a slot when present, while the procedural
 * scene remains the fallback when it's absent — "image-first → cinematic
 * fallback," never a blank or broken slot.
 *
 * Existence is checked on the server at render time (build/SSG/ISR/request),
 * so dropping a file into `/public/images` makes it appear on the next build
 * or ISR revalidation — no code change required. `server-only` guarantees
 * this never leaks into a client bundle.
 */

/** True when `/public<publicPath>` exists on disk. `publicPath` starts with "/". */
export function publicAssetExists(publicPath: string): boolean {
  try {
    const rel = publicPath.replace(/^\/+/, "");
    return existsSync(join(process.cwd(), "public", rel));
  } catch {
    return false;
  }
}

/** Returns `publicPath` if the file exists, otherwise `null`. Handy for
 *  passing a resolved `src` (or null) down into client components that can't
 *  touch the filesystem. */
export function resolveAsset(publicPath: string): string | null {
  return publicAssetExists(publicPath) ? publicPath : null;
}
