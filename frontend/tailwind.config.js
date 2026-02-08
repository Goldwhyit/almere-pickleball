module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Almere Pickleball Brand Colors - Official logo palette
        "ap-blue": {
          50: "#e8f1fb",
          100: "#d1e3f7",
          200: "#a3c7ef",
          300: "#75abe7",
          400: "#478fdf",
          500: "#1F6FB2", // PRIMARY BRAND BLUE
          600: "#1b63a1",
          700: "#175790",
          800: "#134b7f",
          900: "#0f3f6e",
        },
        "ap-red": {
          50: "#fde9e9",
          100: "#fbd3d3",
          200: "#f7a7a7",
          300: "#f37b7b",
          400: "#ef4f4f",
          500: "#D62828", // PRIMARY BRAND RED
          600: "#bf2424",
          700: "#a82020",
          800: "#911c1c",
          900: "#7a1818",
        },
        "ap-yellow": {
          50: "#fffef2",
          100: "#fffde6",
          200: "#fffacc",
          300: "#fff5a3",
          400: "#fff07a",
          500: "#F2E205", // PRIMARY BRAND YELLOW
          600: "#d6c705",
          700: "#b2a404",
          800: "#8e8203",
          900: "#6a6002",
        },
        "ap-slate": {
          50: "#f8f9fb",
          100: "#f1f3f7",
          200: "#e3e8ef",
          300: "#d5dce7",
          400: "#c7d1df",
          500: "#b9c7d7",
          600: "#8a9aac",
          700: "#5b6d81",
          800: "#3d4d61",
          900: "#1f2d3a",
        },
        "ap-white": "#FFFFFF",
        "ap-black": "#111111",
        "ap-light": "#F4F6F8",
      },
      backgroundImage: {
        // Brand gradients
        "gradient-ap-hero": "linear-gradient(135deg, #1F6FB2 0%, #D62828 100%)",
        "gradient-ap-accent":
          "linear-gradient(135deg, #D62828 0%, #a82020 100%)",
        "gradient-ap-warm": "linear-gradient(135deg, #F2E205 0%, #D62828 100%)",
        "gradient-ap-cool": "linear-gradient(135deg, #1F6FB2 0%, #175790 100%)",
      },
      boxShadow: {
        "ap-sm": "0 2px 4px rgba(31, 111, 178, 0.12)",
        "ap-md": "0 6px 16px rgba(31, 111, 178, 0.16)",
        "ap-lg": "0 10px 28px rgba(31, 111, 178, 0.18)",
        "ap-red": "0 6px 16px rgba(214, 40, 40, 0.18)",
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "10px",
        md: "10px",
        lg: "10px",
        xl: "12px",
        "2xl": "14px",
      },
      animation: {
        "pulse-ap": "pulse-ap 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-ap": "bounce-ap 1s infinite",
      },
      keyframes: {
        "pulse-ap": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 0 0 rgba(220, 60, 60, 0.7)",
          },
          "50%": { opacity: ".5", boxShadow: "0 0 0 8px rgba(220, 60, 60, 0)" },
        },
        "bounce-ap": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};
