/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: "#374C5F",
          50: "#F2F4F7",
          100: "#DCE2EA",
          200: "#B7C2D1",
          300: "#8E9FB4",
          400: "#647A93",
          500: "#475F76",
          600: "#374C5F",
          700: "#2C3E4F",
          800: "#1F2C39",
          900: "#121A23",
        },
        emerald2: {
          DEFAULT: "#3DAF8D",
          50: "#EBF8F3",
          100: "#D2F0E5",
          300: "#7FCFB4",
          500: "#3DAF8D",
          600: "#2F9577",
          700: "#247760",
        },
        ink: "#1E1E1E",
        cloud: "#F5F5F5",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(15, 23, 42, 0.06)",
        card: "0 6px 16px rgba(15, 23, 42, 0.08)",
        lift: "0 12px 32px rgba(15, 23, 42, 0.12)",
        glow: "0 10px 30px rgba(61, 175, 141, 0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl": "1.5rem",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "midnight-gradient":
          "linear-gradient(160deg, #1F2C39 0%, #374C5F 55%, #2F9577 130%)",
        "emerald-gradient":
          "linear-gradient(135deg, #3DAF8D 0%, #2F9577 100%)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        floaty: "floaty 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
