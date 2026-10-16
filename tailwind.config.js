/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#FF5200",
          orangeHover: "#E04800",
          orangeLight: "#FFF4EE",
          dark: "#111827",
          darkMuted: "#1F2937",
          textPrimary: "#111827",
          textSecondary: "#4B5563",
          textMuted: "#6B7280",
          border: "#E5E5E5",
          bgPrimary: "#FFFFFF",
          bgAlt: "#F9FAFB",
          bgLight: "#FAFAFA",
        }
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'Inter'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["'Playfair Display'", "'Manrope'", "serif"],
        editorial: ["'Playfair Display'", "'Cormorant Garamond'", "Georgia", "serif"],
        serif: ["'Playfair Display'", "'Cormorant Garamond'", "Georgia", "serif"],
        body: ["'Inter'", "'Plus Jakarta Sans'", "sans-serif"],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
        normal: "0",
        wide: "0.04em",
        wider: "0.08em",
        widest: "0.15em",
        mega: "0.25em",
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'hover': '0 20px 40px -15px rgba(232, 91, 18, 0.12), 0 0 0 1px rgba(232, 91, 18, 0.1)',
        'dark-card': '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 35s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
