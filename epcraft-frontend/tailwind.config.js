/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // EpCraft design system — extracted from Figma
        cream: "#f9f3ea",        // page / nav / footer background
        "cream-2": "#fff9ef",    // subtle page gradient alt
        espresso: "#502c12",     // headings, primary buttons, dark text
        walnut: "#805437",       // active link underline
        bark: "#51443d",         // body / muted text
        ink: "#1d1b16",          // near-black headings on light cards
        gold: "#c9a063",         // accent / CTAs / dividers
        sand: "#e7e2d9",         // product image placeholder bg
        border: "#e2d7c6",       // hairline borders
      },
      fontFamily: {
        serif: ["'Playfair Display'", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        pill: "9999px",
      },
      boxShadow: {
        card: "0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)",
        soft: "0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
};
