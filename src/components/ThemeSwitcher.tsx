"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<string>("light");

  useEffect(() => {
    // Get the theme from localStorage or use default
    const savedTheme = localStorage.getItem("theme") || "light";
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (theme: string) => {
    // Set the theme at document level
    document.documentElement.setAttribute("data-theme", theme);
    // Also set it on body to ensure full application coverage
    document.body.setAttribute("data-theme", theme);
  };

  const toggleTheme = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        {currentTheme === "dark" ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-4"
      >
        <li className="menu-title">
          <span>Choose Theme</span>
        </li>
        <li>
          <button
            type="button"
            onClick={() => toggleTheme("light")}
            className={`flex items-center gap-2 ${
              currentTheme === "light" ? "active" : ""
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-primary"></span>
            Light Theme
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => toggleTheme("dark")}
            className={`flex items-center gap-2 ${
              currentTheme === "dark" ? "active" : ""
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-neutral"></span>
            Dark Theme
          </button>
        </li>
      </ul>
    </div>
  );
}
