/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./index.tsx",
  ],
  theme: {
    extend: {
      // Palm Reader Color System
      colors: {
        // Primary colors
        mystique: "#6B4FA0",        // Mystique Purple
        gold: "#D4AF37",            // Sacred Gold
        saffron: "#FF6B35",         // Deep Saffron
        midnight: "#1A1F3A",        // Midnight Blue
        cream: "#F5F1E8",           // Cream White

        // Secondary colors
        twilight: "#4A3A7F",        // Twilight Purple
        chakra: "#4CAF50",          // Chakra Green
        cosmic: "#0F0F0F",          // Cosmic Black
        silver: "#E8E8E8",          // Silver Light
      },

      // Custom fonts
      fontFamily: {
        poppins: ["Poppins"],
        inter: ["Inter"],
        playfair: ["Playfair Display"],
      },

      // Custom spacing based on 8px grid
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
      },

      // Custom border radius
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        full: "9999px",
      },

      // Custom shadows
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        sm: "0 2px 10px rgba(0, 0, 0, 0.1)",
        md: "0 4px 20px rgba(0, 0, 0, 0.15)",
        lg: "0 8px 30px rgba(107, 79, 160, 0.2)",
        xl: "0 12px 40px rgba(0, 0, 0, 0.25)",
        purple: "0 8px 30px rgba(107, 79, 160, 0.3)",
        gold: "0 8px 30px rgba(212, 175, 55, 0.2)",
      },

      // Custom opacity values
      opacity: {
        5: "0.05",
        10: "0.1",
        20: "0.2",
        30: "0.3",
        40: "0.4",
        50: "0.5",
        60: "0.6",
        70: "0.7",
        80: "0.8",
        90: "0.9",
        95: "0.95",
      },
    },
  },
  plugins: [],
};
