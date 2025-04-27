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
        skool: {
          primary: "#5046e5",
          secondary: "#f0f4f9",
          accent: "#ff6b6b",
          text: "#1a1a2e",
          "light-text": "#4a5568",
          border: "#e2e8f0",
          "card-bg": "#ffffff",
          hover: "#eef2ff",
        },
      },
      boxShadow: {
        halloween: "0 4px 14px 0 rgba(107, 33, 168, 0.1)",
        skool: "0 4px 20px rgba(0, 0, 0, 0.05)",
        "skool-hover": "0 10px 30px rgba(0, 0, 0, 0.1)",
        "skool-btn": "0 4px 12px rgba(80, 70, 229, 0.3)",
      },
      backgroundImage: {
        "halloween-pattern": "url('/halloween-pattern.svg')",
      },
      borderRadius: {
        skool: "16px",
        "skool-btn": "12px",
      },
      animation: {
        "skool-fade-in": "fadeIn 0.5s ease-out",
        "skool-pulse": "pulse 2s infinite",
      },
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
        skoolTheme: {
          primary: "#5046e5", // Skool primary purple
          "primary-focus": "#4038c2", // Darker purple
          "primary-content": "#ffffff", // White text on primary

          secondary: "#f0f4f9", // Skool secondary light blue
          "secondary-focus": "#e6eaf5", // Darker light blue
          "secondary-content": "#1a1a2e", // Dark text on secondary

          accent: "#ff6b6b", // Skool accent red
          "accent-focus": "#ff5252", // Darker red
          "accent-content": "#ffffff", // White text on accent

          neutral: "#1a1a2e", // Dark blue
          "neutral-focus": "#141428", // Darker blue
          "neutral-content": "#ffffff", // White text on neutral

          "base-100": "#ffffff", // White background
          "base-200": "#f8fafc", // Light gray background
          "base-300": "#f0f4f9", // Lighter gray background
          "base-content": "#1a1a2e", // Dark text

          info: "#3abff8", // Info blue
          success: "#36d399", // Success green
          warning: "#fbbd23", // Warning yellow
          error: "#f87272", // Error red

          "--rounded-box": "1rem", // Border radius for cards
          "--rounded-btn": "0.75rem", // Border radius for buttons
          "--rounded-badge": "0.75rem", // Border radius for badges
          "--animation-btn": "0.3s", // Button click animation duration
          "--animation-input": "0.2s", // Input focus animation duration
          "--btn-focus-scale": "0.98", // Button focus scale
          "--border-btn": "1px", // Button border width
          "--tab-border": "2px", // Tab border width
          "--tab-radius": "0.75rem", // Tab border radius
        },
      },
      "halloween",
    ],
    darkTheme: "halloween",
  },
} satisfies Config;
