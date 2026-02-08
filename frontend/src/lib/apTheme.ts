// Almere Pickleball Official Brand Colors & Theme
export const APTheme = {
  // Primary Colors
  colors: {
    blue: {
      50: "#f0f7ff",
      100: "#e0eeff",
      200: "#bae0ff",
      300: "#7dc4ff",
      400: "#36a3ff",
      500: "#0c7fcd", // Official AP Blue
      600: "#0a5fa1",
      700: "#094283",
      800: "#072d5c",
      900: "#051840",
    },
    red: {
      50: "#fff5f5",
      100: "#ffe6e6",
      200: "#ffcccc",
      300: "#ff9999",
      400: "#ff6b6b",
      500: "#dc3c3c", // Official AP Red
      600: "#c13535",
      700: "#a32e2e",
      800: "#852727",
      900: "#6b2020",
    },
    yellow: {
      50: "#fffef5",
      100: "#fffceb",
      200: "#fff9d6",
      300: "#fff3ad",
      400: "#ffeb84",
      500: "#ffdd00", // Official AP Yellow
      600: "#dab800",
      700: "#aa8900",
      800: "#7a5e00",
      900: "#5a4600",
    },
    slate: {
      50: "#f8f9fb",
      100: "#f1f3f8",
      200: "#e3e8f0",
      300: "#d5dde8",
      400: "#b8c5d6",
      500: "#8b9ac1",
      600: "#6478a3",
      700: "#4a5a7f",
      800: "#343e57",
      900: "#1f253a",
    },
    white: "#ffffff",
    black: "#051840",
  },

  // Gradients
  gradients: {
    main: "linear-gradient(135deg, #0c7fcd 0%, #094283 100%)",
    accent: "linear-gradient(135deg, #0c7fcd 0%, #dc3c3c 100%)",
    warm: "linear-gradient(135deg, #ffdd00 0%, #dc3c3c 100%)",
    cool: "linear-gradient(135deg, #0c7fcd 0%, #f8f9fb 100%)",
  },

  // Semantic Colors
  semantic: {
    primary: "#0c7fcd",
    secondary: "#dc3c3c",
    accent: "#ffdd00",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#dc3c3c",
    info: "#0c7fcd",
  },

  // Component Variants
  buttons: {
    primary: {
      bg: "bg-ap-blue-600",
      bgHover: "hover:bg-ap-blue-700",
      text: "text-white",
      shadow: "shadow-ap-blue",
    },
    secondary: {
      bg: "bg-ap-red-600",
      bgHover: "hover:bg-ap-red-700",
      text: "text-white",
      shadow: "shadow-ap-red",
    },
    accent: {
      bg: "bg-ap-yellow-500",
      bgHover: "hover:bg-ap-yellow-600",
      text: "text-ap-blue-900",
      shadow: "shadow-lg",
    },
    outline: {
      bg: "bg-white",
      border: "border-2 border-ap-blue-200",
      text: "text-ap-blue-600",
      hover: "hover:border-ap-blue-400 hover:bg-ap-blue-50",
    },
  },

  // Card Styles
  cards: {
    default: "bg-white p-6 rounded-lg border border-ap-slate-200 shadow-ap-md",
    blue: "bg-white p-6 rounded-lg border-2 border-ap-blue-200 shadow-ap-md",
    red: "bg-white p-6 rounded-lg border-2 border-ap-red-200 shadow-ap-md",
    yellow:
      "bg-white p-6 rounded-lg border-2 border-ap-yellow-300 shadow-ap-md",
  },

  // Text Styles
  text: {
    heading1: "text-4xl font-bold text-ap-blue-900",
    heading2: "text-3xl font-bold text-ap-blue-900",
    heading3: "text-2xl font-bold text-ap-blue-900",
    body: "text-base text-ap-slate-700",
    small: "text-sm text-ap-slate-600",
  },
};

// Helper function for combining class names with theme
export function getButtonClasses(
  variant: "primary" | "secondary" | "accent" | "outline" = "primary",
): string {
  const variantClasses = APTheme.buttons[variant];
  
  if (variant === "outline") {
    return `${(variantClasses as any).bg} ${(variantClasses as any).border} ${(variantClasses as any).text} ${(variantClasses as any).hover} font-semibold px-6 py-2 rounded-lg transition`;
  }
  
  return `${(variantClasses as any).bg} ${(variantClasses as any).bgHover || ""} ${(variantClasses as any).text} font-semibold px-6 py-2 rounded-lg transition ${(variantClasses as any).shadow || ""}`;
}

export function getCardClasses(
  variant: "default" | "blue" | "red" | "yellow" = "default",
): string {
  return APTheme.cards[variant];
}
