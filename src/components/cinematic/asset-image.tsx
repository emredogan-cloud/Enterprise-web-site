import Image from "next/image";
import type { ReactNode } from "react";

import { publicAssetExists } from "@/lib/assets";

/**
 * <AssetImage> — the optional real-image layer over a procedural cinematic
 * scene (Görsel Asset Pipeline).
 *
 *   image-first → cinematic-fallback
 *
 * If `/public<src>` exists, render the optimized `next/image` (filling the
 * parent frame). If it doesn't, render `fallback` — the existing procedural
 * scene / placeholder. The slot is therefore NEVER blank and NEVER a broken
 * image: until a real asset is generated and dropped in, the cinematic scene
 * shows; the moment the file lands (next build / ISR), the image takes over
 * automatically, no code change.
 *
 * Drop-in usage — place it where the scene used to render, inside the same
 * `relative`-positioned, sized frame:
 *
 *   <div className="relative ...frame...">
 *     <AssetImage src="/images/order/lantern_scene.webp" alt="…"
 *                 fallback={<LanternScene />} sizes="…" />
 *   </div>
 *
 * Server Component (reads the filesystem via `@/lib/assets`). The `fallback`
 * may itself be a client component — it's only rendered, never inspected.
 */
export function AssetImage({
  src,
  alt,
  fallback,
  sizes = "100vw",
  priority = false,
  imgClassName = "object-cover",
}: {
  /** Public path beginning with "/", e.g. "/images/homepage/hero.webp". */
  src: string;
  alt: string;
  /** Procedural scene / placeholder shown when the asset isn't present yet. */
  fallback: ReactNode;
  sizes?: string;
  priority?: boolean;
  /** `object-cover` (default) for full-bleed art; `object-contain` for framed art. */
  imgClassName?: string;
}) {
  if (!publicAssetExists(src)) return <>{fallback}</>;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={imgClassName}
    />
  );
}
