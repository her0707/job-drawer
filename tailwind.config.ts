import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "oklch(var(--canvas) / <alpha-value>)",
        panel: "oklch(var(--panel) / <alpha-value>)",
        panel2: "oklch(var(--panel-2) / <alpha-value>)",
        ink: "oklch(var(--ink) / <alpha-value>)",
        muted: "oklch(var(--muted) / <alpha-value>)",
        subtle: "oklch(var(--subtle) / <alpha-value>)",
        line: "oklch(var(--line) / <alpha-value>)",
        lineStrong: "oklch(var(--line-strong) / <alpha-value>)",
        accent: "oklch(var(--accent) / <alpha-value>)",
        accentInk: "oklch(var(--accent-ink) / <alpha-value>)",
        accent2: "oklch(var(--accent2) / <alpha-value>)",
        good: "oklch(var(--good) / <alpha-value>)",
        warn: "oklch(var(--warn) / <alpha-value>)",
        danger: "oklch(var(--danger) / <alpha-value>)"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"]
      },
      boxShadow: {
        soft: "0 14px 42px oklch(var(--shadow) / 0.06)",
        lift: "0 20px 56px oklch(var(--shadow) / 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
