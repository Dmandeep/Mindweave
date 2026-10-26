/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Strict Four-Color Palette: Warm Cream, Royal Blue, Burnt Tangerine, Ink Black
        cream: {
          DEFAULT: "#FAF7F0",
          50: "#FFFFFF",
          100: "#FAF7F0",
          200: "#F3EDE0",
          300: "#EAE0CD",
          400: "#DFD2B8",
        },
        royal: {
          DEFAULT: "#315FE9",
          hover: "#264EC8",
          subtle: "rgba(49, 95, 233, 0.08)",
          muted: "rgba(49, 95, 233, 0.16)",
          active: "rgba(49, 95, 233, 0.24)",
        },
        tangerine: {
          DEFAULT: "#E97942",
          hover: "#D66731",
          subtle: "rgba(233, 121, 66, 0.10)",
          muted: "rgba(233, 121, 66, 0.20)",
        },
        ink: {
          DEFAULT: "#252525",
          primary: "#252525",
          secondary: "rgba(37, 37, 37, 0.74)",
          muted: "rgba(37, 37, 37, 0.52)",
          faint: "rgba(37, 37, 37, 0.28)",
          border: "rgba(37, 37, 37, 0.12)",
          hover: "rgba(37, 37, 37, 0.20)",
        },

        // Semantic mapping to Four-Color Tokens
        background: "#FAF7F0",
        foreground: "#252525",
        border: "rgba(37, 37, 37, 0.12)",
        "border-hover": "rgba(37, 37, 37, 0.24)",
        "border-active": "#315FE9",
        input: "rgba(37, 37, 37, 0.06)",
        ring: "#315FE9",

        surface: {
          base: "#FAF7F0",
          card: "#FFFFFF",
          elevated: "#F3EDE0",
          active: "rgba(49, 95, 233, 0.08)",
          highlight: "rgba(233, 121, 66, 0.08)",
        },
        text: {
          primary: "#252525",
          secondary: "rgba(37, 37, 37, 0.74)",
          muted: "rgba(37, 37, 37, 0.52)",
          faint: "rgba(37, 37, 37, 0.30)",
        },
        brand: {
          DEFAULT: "#315FE9", // Royal Blue
          hover: "#264EC8",
          subtle: "rgba(49, 95, 233, 0.08)",
          glow: "rgba(49, 95, 233, 0.18)",
          light: "#315FE9",
        },
        discovery: {
          DEFAULT: "#E97942", // Burnt Tangerine
          light: "#E97942",
          dark: "#D66731",
          subtle: "rgba(233, 121, 66, 0.10)",
        },
        causal: {
          DEFAULT: "#315FE9",
          light: "#315FE9",
          subtle: "rgba(49, 95, 233, 0.08)",
        },
        verified: {
          DEFAULT: "#315FE9",
          light: "#315FE9",
          subtle: "rgba(49, 95, 233, 0.08)",
        },
        warning: {
          DEFAULT: "#E97942",
          light: "#E97942",
          subtle: "rgba(233, 121, 66, 0.10)",
        },
        conflict: {
          DEFAULT: "#252525",
          light: "#252525",
          subtle: "rgba(37, 37, 37, 0.08)",
        },
      },
      borderRadius: {
        xl: "12px",
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scale-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-right": "slide-in-right 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};
