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
          muted: "#e8f5ee",
          soft: "#f2faf6",
        },
        brand: "#1a6b3c",
        surface: "#ffffff",
        appbg: "#eaf5ef",
        line: "#dce8e2",
        ink: "#101b17",
        muted: "#5f746b",
      },
    },
  },
  plugins: [],
};
