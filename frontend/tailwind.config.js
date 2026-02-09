module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xs: "320px",    // iPhone SE
      sm: "576px",    // Small tablets
      md: "768px",    // iPad, tablets
      lg: "1024px",   // Large tablets, laptops
      xl: "1280px",   // Desktops
      "2xl": "1536px", // Large desktops, 4K
    },
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
      maxWidth: {
        xs: "20rem",   // 320px
        sm: "28rem",   // 448px
        md: "32rem",   // 512px
        lg: "36rem",   // 576px
        xl: "42rem",   // 672px
        "2xl": "48rem", // 768px
        "3xl": "56rem", // 896px
        "4xl": "64rem", // 1024px
        "5xl": "72rem", // 1152px
        "6xl": "80rem", // 1280px
        "7xl": "96rem", // 1536px
        none: "none",
      },
      minHeight: {
        "10": "2.5rem",  // 40px
        "12": "3rem",    // 48px
        "14": "3.5rem",  // 56px
        "16": "4rem",    // 64px
      },
      minWidth: {
        "10": "2.5rem",  // 40px
        "12": "3rem",    // 48px
        "14": "3.5rem",  // 56px
        "16": "4rem",    // 64px
      },
      zIndex: {
        "0": "0",
        "10": "10",
        "20": "20",
        "30": "30",
        "40": "40",
        "50": "50",
        "auto": "auto",
      },
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
  plugins: [
    // Touch target utilities (min 44x44px for accessibility)
    function ({ addUtilities }) {
      const touchUtilities = {
        ".btn-touch": {
          "@apply min-h-[44px] min-w-[44px] flex items-center justify-center": {},
        },
        ".icon-touch": {
          "@apply min-h-[44px] min-w-[44px] flex items-center justify-center": {},
        },
        ".container-responsive": {
          "@apply mx-auto px-4 sm:px-6 md:px-8 lg:px-10": {},
        },
        ".grid-responsive": {
          "@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8": {},
        },
        ".grid-dashboard": {
          "@apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6": {},
        },
      };
      addUtilities(touchUtilities);
    },
    // Smooth scrolling for all browsers
    function ({ addUtilities }) {
      const smoothScroll = {
        ".scroll-smooth": {
          "scroll-behavior": "smooth",
        },
      };
      addUtilities(smoothScroll);
    },
  ],
};
