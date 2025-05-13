import type { Config } from "tailwindcss";
import daisyui from "daisyui";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        halloween: {
          orange: "#ff7518",
          purple: "#6b21a8",
          green: "#15803d",
          black: "#1e1b4b",
        },
      },
      boxShadow: {
        halloween: "0 4px 14px 0 rgba(107, 33, 168, 0.1)",
      },
      backgroundImage: {},
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        whiteHalloween: {
          primary: "#ff7518", // Halloween orange
          "primary-focus": "#e65800", // Darker orange
          "primary-content": "#ffffff", // White text on primary

          secondary: "#6b21a8", // Halloween purple
          "secondary-focus": "#581c87", // Darker purple
          "secondary-content": "#ffffff", // White text on secondary

          accent: "#15803d", // Halloween green
          "accent-focus": "#166534", // Darker green
          "accent-content": "#ffffff", // White text on accent

          neutral: "#1e1b4b", // Dark indigo (almost black)
          "neutral-focus": "#18163a", // Darker indigo
          "neutral-content": "#ffffff", // White text on neutral

          "base-100": "#ffffff", // White background
          "base-200": "#f8f9fc", // Light gray background
          "base-300": "#f1f5f9", // Lighter gray background
          "base-content": "#1e1b4b", // Dark text

          info: "#3abff8", // Info blue
          success: "#36d399", // Success green
          warning: "#fbbd23", // Warning yellow
          error: "#f87272", // Error red

          "--rounded-box": "0.5rem", // Border radius for cards
          "--rounded-btn": "0.5rem", // Border radius for buttons
          "--rounded-badge": "0.5rem", // Border radius for badges
          "--animation-btn": "0.25s", // Button click animation duration
          "--animation-input": "0.2s", // Input focus animation duration
          "--btn-focus-scale": "0.95", // Button focus scale
          "--border-btn": "1px", // Button border width
          "--tab-border": "1px", // Tab border width
          "--tab-radius": "0.5rem", // Tab border radius
        },
      },
      "halloween",
    ],
    darkTheme: "halloween",
  },
} satisfies Config;
