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
          orange: "#E85B12",
          orangeHover: "#CC4808",
          orangeLight: "#FFF4EE",
          dark: "#161616",
          darkMuted: "#222222",
          border: "#E6E6E6",
          bgLight: "#F8F9FA",
        }
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'Inter'", "-apple-system", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      }
    },
  },
  plugins: [],
}
