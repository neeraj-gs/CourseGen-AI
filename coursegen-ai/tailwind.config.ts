/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        // The app screens keep Lexend — it is legibility-tuned, which is the
        // right instinct inside a product about reading.
        sans: ["var(--font-lexend)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],

        // --- The Cutting Room: the landing page's three type roles. ---
        // Display. Bricolage Grotesque's optical widths wobble on purpose, so a
        // headline is never mistaken for a system font.
        display: ["var(--font-bricolage)", "ui-sans-serif", "system-ui", "sans-serif"],
        // Body. Newsreader is cut for screens and holds a long paragraph without
        // the glare a grotesk gets at 18px.
        body: ["var(--font-newsreader)", "ui-serif", "Georgia", "serif"],
        // Data. Everything countable: edge codes, ranks, scores, timecodes.
        data: ["var(--font-martian)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        // --- The Cutting Room ---
        // Every value below names a STATE on the editing bench, not a mood.
        // A candidate lesson is one of exactly three things, and it wears the
        // colour of whichever it is.
        //
        //   emulsion — screened, not yet judged   (raw film base)
        //   tally    — survived the cull, in the final course
        //   dust     — rejected, left on the bench
        //
        lightbox: "#F0EFE9", // the illuminated table surface — the page ground
        graphite: "#1C1A17", // ink: type, hairlines, sprocket edges
        bench: "#12100E", // the dark room the table stands in
        emulsion: "#C2410C", // candidate under review
        tally: "#0F766E", // selected — in the cut
        dust: "#8A8880", // culled — out of the cut
        splice: "#D9D6CB", // the join between two frames: rules and gutters

        // Retained: the app screens behind /courses, /create and /settings
        // still paint with these. Removing them would restyle pages this
        // change is not scoped to touch.
        ink: "#0B1220",
        paper: "#F7F8F7",
        grass: "#16A34A",
        moss: "#14532D",
        rule: "#E2E6E3",
        mute: "#5B6660",

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        // Motion 2 of 4 — "registration". Film locates on the pin: it arrives
        // along the strip axis and stops dead. No bounce, no overshoot.
        register: {
          from: { opacity: "0", transform: "translate3d(0, 14px, 0)" },
          to: { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        // Motion 3 of 4 — "the lamp". The bench light comes up under a thing
        // instead of the thing changing colour.
        lamp: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        register: "register 620ms cubic-bezier(0.16, 0.84, 0.28, 1) both",
        lamp: "lamp 240ms ease-out both",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}