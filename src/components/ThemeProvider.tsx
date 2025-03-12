"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";

interface ThemeContextProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "lofi",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<string>(() => {
    let initialTheme = "lofi";
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      console.log("Loaded theme from localStorage:", savedTheme);
      if (savedTheme) {
        initialTheme = savedTheme;
      }
      document.documentElement.setAttribute("data-theme", initialTheme);
      console.log("Applied initial theme:", initialTheme);
    }
    console.log("Initial theme state:", initialTheme);
    return initialTheme;
  });

  const setStoredTheme = useCallback((theme: string) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    console.log("Set theme in localStorage:", theme);
  }, []);

  // Fetch user's theme
  useEffect(() => {
    const fetchUserTheme = async () => {
      try {
        const response = await fetch("/api/user/theme", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched theme from API:", data.theme);
          setTheme(data.theme);
          setStoredTheme(data.theme);
        }
      } catch (error) {
        console.error("Failed to fetch user theme:", error);
      }
    };

    fetchUserTheme();
  }, [setStoredTheme]);

  useEffect(() => {
    setStoredTheme(theme);
    console.log("Theme state changed:", theme);
  }, [theme, setStoredTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
