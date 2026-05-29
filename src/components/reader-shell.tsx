"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Type-only imports — erased at compile, so they do NOT bring `pdfjs-dist`
// into the SSR pass. The runtime module is loaded via dynamic `import()`
// inside `useEffect` (browser-only).
import type {
  PDFDocumentProxy,
  PDFPageProxy,
  RenderTask,
} from "pdfjs-dist";

import { syncReadingProgress } from "@/app/read/[bookId]/actions";
import { Button } from "@/components/ui/button";

interface ReaderShellProps {
  bookId: string;
  bookTitle: string;
  signedUrl: string;
  /** 1-indexed page to open at (from `reading_progress`); defaults to 1. */
  initialPage: number;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.1;
const RESIZE_DEBOUNCE_MS = 200;
const PROGRESS_SYNC_DEBOUNCE_MS = 2000;

/**
 * Online reader (Roadmap ADR-4) + reading-progress sync (Roadmap §10).
 *
 * Renders the per-order watermarked PDF (one signed URL away) onto an
 * HTML `<canvas>` using pdf.js. PDF.js issues HTTP range requests against
 * the signed URL natively, so we never download the whole file just to
 * show page 1.
 *
 * Resume-where-you-left-off:
 *   - `initialPage` is the page the user last reached (server-side query
 *     on `reading_progress`); we initialize `pageNumber` to it so pdf.js
 *     renders the right page on first paint.
 *   - On every page change AFTER the first paint, a 2-second debounce
 *     batches rapid flips and fires `syncReadingProgress` once the user
 *     settles. Fire-and-forget — UX is never blocked on the sync.
 *
 * Architectural notes:
 *  - Pure Client Component — pdf.js depends on browser globals (Worker,
 *    Canvas, Blob). Dynamic-importing the module inside `useEffect`
 *    keeps the SSR pass clean.
 *  - The worker source is `/pdf.worker.min.mjs`, copied to `public/` by
 *    `scripts/copy-pdf-worker.mjs` at install time. Serving same-origin
 *    keeps the CSP `worker-src 'self' blob:` strict — no CDN allowlist.
 *  - The reader renders as a `fixed inset-0 z-50` overlay so it covers
 *    the `SiteHeader` for a focus-mode reading experience without us
 *    needing a separate root layout for `/read/*`.
 *
 * Memory profile:
 *  - One canvas at a time. After page navigation the existing canvas's
 *    pixel buffer is overwritten in place; peak memory is one page
 *    (~7 MB at 1× scale for a typical book page, ~30 MB at 2× zoom).
 *  - The parsed `PDFDocumentProxy` stays in memory for the session
 *    (compressed page structures ≈ 20-30 MB for a 10 MB PDF).
 *  - In-flight `RenderTask`s are cancelled on cleanup; the doc is
 *    `.destroy()`ed on unmount.
 */
export function ReaderShell({
  bookId,
  bookTitle,
  signedUrl,
  initialPage,
}: ReaderShellProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [zoom, setZoom] = useState(1);
  const [renderToken, setRenderToken] = useState(0); // bumps on resize
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------------------------------------------------
  // 1. Load the PDF once on mount (or when the signed URL changes).
  // -----------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    let docHandle: PDFDocumentProxy | null = null;

    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const loadingTask = pdfjsLib.getDocument({ url: signedUrl });
        const doc = await loadingTask.promise;

        if (cancelled) {
          await doc.destroy();
          return;
        }

        docHandle = doc;
        setPdf(doc);
        setNumPages(doc.numPages);
        // Clamp initialPage to the actual page range — a stale resume
        // point should not push pdf.js to a non-existent page.
        if (initialPage > doc.numPages) {
          setPageNumber(doc.numPages);
        }
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("[reader] failed to load PDF:", err);
        setError(
          err instanceof Error
            ? err.message
            : "We could not load this book. Please try again.",
        );
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (docHandle) {
        void docHandle.destroy();
      }
    };
  }, [signedUrl, initialPage]);

  // -----------------------------------------------------------------------
  // 2. Render the current page on (pdf | pageNumber | zoom | renderToken).
  //    Cancels any in-flight RenderTask before kicking a new one.
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!pdf) return;
    let cancelled = false;

    (async () => {
      // Cancel a previous render before starting a new one — otherwise
      // overlapping renders can corrupt the canvas.
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      let page: PDFPageProxy | null = null;
      try {
        page = await pdf.getPage(pageNumber);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Fit-to-container-width baseline × explicit user zoom.
        const containerWidth = containerRef.current?.clientWidth ?? 800;
        const unscaled = page.getViewport({ scale: 1 });
        const fitScale = Math.max(0.1, (containerWidth - 32) / unscaled.width);
        const viewport = page.getViewport({ scale: fitScale * zoom });

        // High-DPI: render at devicePixelRatio, scale back via CSS.
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // pdf.js v5 takes the canvas element AND its 2D context; older
        // major versions only needed `canvasContext`.
        const task = page.render({ canvas, canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        await task.promise;
        if (!cancelled) {
          renderTaskRef.current = null;
        }
      } catch (err) {
        // Expected when we cancel mid-render — swallow.
        if (
          err &&
          typeof err === "object" &&
          "name" in err &&
          (err as { name?: string }).name === "RenderingCancelledException"
        ) {
          return;
        }
        if (!cancelled) {
          console.error("[reader] page render failed:", err);
        }
      } finally {
        page?.cleanup();
      }
    })();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdf, pageNumber, zoom, renderToken]);

  // -----------------------------------------------------------------------
  // 3. ResizeObserver — re-render at the new fit-width when container resizes.
  //    Debounced so a continuous drag doesn't trigger N renders.
  // -----------------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let timeoutId: number | null = null;
    const observer = new ResizeObserver(() => {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setRenderToken((t) => t + 1);
      }, RESIZE_DEBOUNCE_MS);
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, []);

  // -----------------------------------------------------------------------
  // 4. Keyboard shortcuts: ← / → navigate, Esc returns to library.
  // -----------------------------------------------------------------------
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setPageNumber((p) => Math.max(1, p - 1));
      } else if (e.key === "ArrowRight") {
        setPageNumber((p) => Math.min(numPages || 1, p + 1));
      } else if (e.key === "Escape") {
        router.push("/account/library");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [numPages, router]);

  // -----------------------------------------------------------------------
  // 5. Reading-progress sync — debounced 2 s after the last page change.
  //    Skips the very first render (where `pageNumber === initialPage`)
  //    so we never write the same value back as a no-op.
  // -----------------------------------------------------------------------
  const isFirstSyncRender = useRef(true);
  useEffect(() => {
    if (!pdf || numPages === 0) return;
    if (isFirstSyncRender.current) {
      isFirstSyncRender.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const percent = (pageNumber / numPages) * 100;
      void syncReadingProgress({ bookId, page: pageNumber, percent });
    }, PROGRESS_SYNC_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [pageNumber, pdf, numPages, bookId]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Toolbar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/account/library">
            <span aria-hidden>←</span> Library
          </Link>
        </Button>

        <h1 className="flex-1 truncate font-serif text-base font-medium text-foreground">
          {bookTitle}
        </h1>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={!pdf || pageNumber <= 1}
            aria-label="Previous page"
          >
            ‹
          </Button>
          <span className="tabular-nums" aria-live="polite">
            {pageNumber} / {numPages || "—"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setPageNumber((p) => Math.min(numPages || 1, p + 1))
            }
            disabled={!pdf || pageNumber >= numPages}
            aria-label="Next page"
          >
            ›
          </Button>

          <span aria-hidden className="mx-2 h-4 w-px bg-border" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
            disabled={!pdf || zoom <= MIN_ZOOM}
            aria-label="Zoom out"
          >
            −
          </Button>
          <span className="tabular-nums">{Math.round(zoom * 100)}%</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
            disabled={!pdf || zoom >= MAX_ZOOM}
            aria-label="Zoom in"
          >
            +
          </Button>
        </div>
      </header>

      {/* Page canvas */}
      <div
        ref={containerRef}
        className="flex flex-1 items-start justify-center overflow-auto bg-muted/40 p-4"
      >
        {loading && (
          <p className="mt-16 text-sm text-muted-foreground">
            Loading your book…
          </p>
        )}
        {error && !loading && (
          <div className="mt-16 max-w-md text-center">
            <h2 className="font-serif text-2xl font-medium text-foreground">
              Could not load this book
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">{error}</p>
          </div>
        )}
        {!loading && !error && (
          <canvas
            ref={canvasRef}
            className="rounded-md bg-white shadow-lg"
            aria-label={`Page ${pageNumber} of ${bookTitle}`}
          />
        )}
      </div>
    </div>
  );
}
