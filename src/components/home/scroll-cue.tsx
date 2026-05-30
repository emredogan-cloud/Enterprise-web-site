import { ChevronDown } from "lucide-react";

/**
 * Animated scroll cue at the bottom of the hero.
 * Pure CSS animation (`home-scroll-pulse` in globals.css).
 */
export function ScrollCue() {
  return (
    <div className="flex flex-col items-center gap-2 text-[#5d675f]">
      <span className="text-[11px] font-medium uppercase tracking-[0.3em]">
        Scroll to explore
      </span>
      <ChevronDown
        aria-hidden
        className="home-scroll-cue-glyph h-4 w-4"
      />
    </div>
  );
}
