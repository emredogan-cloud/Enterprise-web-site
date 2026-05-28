import type { Config } from "tailwindcss";

/*
 * Tailwind v4 is CSS-first: the color/theme/radius tokens live in
 * `src/app/globals.css` (@theme + CSS variables). This file is loaded from
 * there via the `@config` directive and owns the parts that are most natural
 * as a typed config: content sources, the font-family token map (wired to the
 * next/font CSS variables), and the reading-measure max-width (Roadmap §7).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: [
          "var(--font-serif)",
          "ui-serif",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      maxWidth: {
        // generous reading measure for prose-heavy book pages
        prose: "68ch",
      },
    },
  },
};

export default config;
