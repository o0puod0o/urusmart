module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0f7a55",
          dark: "#14532d",
          darker: "#043d2a",
          light: "#065f46",
          lighter: "#d1fae5",
        },
        brand: "#1a6b3c",
      },
    },
  },
  plugins: [],
};
