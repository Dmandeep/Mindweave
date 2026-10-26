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
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "rgba(255, 255, 255, 0.08)",
        input: "rgba(255, 255, 255, 0.12)",
        ring: "#8B5CF6",
        background: "#080C14",
        foreground: "#F8FAFC",
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
        cosmic: {
          950: "#080C14",
          900: "#0D131F",
          850: "#101726",
          800: "#131B2E",
          700: "#1A243D",
          600: "#263352",
        },
        discovery: {
          DEFAULT: "#8B5CF6",
          glow: "rgba(139, 92, 246, 0.25)",
          light: "#A78BFA",
          dark: "#6D28D9",
        },
        causal: {
          DEFAULT: "#06B6D4",
          glow: "rgba(6, 182, 212, 0.25)",
          light: "#22D3EE",
        },
        verified: {
          DEFAULT: "#10B981",
          glow: "rgba(16, 185, 129, 0.25)",
          light: "#34D399",
        },
        warning: {
          DEFAULT: "#F59E0B",
          glow: "rgba(245, 158, 11, 0.25)",
          light: "#FBBF24",
        },
        conflict: {
          DEFAULT: "#F43F5E",
          glow: "rgba(244, 63, 94, 0.25)",
          light: "#FB7185",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.02)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fade-in 0.2s ease-out forwards",
      },
    },
  },
  plugins: [],
};
