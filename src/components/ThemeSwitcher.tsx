"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<string>("whiteHalloween");

  useEffect(() => {
    // Get the theme from localStorage or use default
    const savedTheme = localStorage.getItem("theme") || "whiteHalloween";
    // If the saved theme was skoolTheme, default to whiteHalloween
    const validTheme =
      savedTheme === "skoolTheme" ? "whiteHalloween" : savedTheme;
    setCurrentTheme(validTheme);
    document.documentElement.setAttribute("data-theme", validTheme);
  }, []);

  const toggleTheme = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        {currentTheme === "halloween" ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5 text-halloween-orange" />
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
            onClick={() => toggleTheme("whiteHalloween")}
            className={`flex items-center gap-2 ${
              currentTheme === "whiteHalloween" ? "active" : ""
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-halloween-orange"></span>
            Light Theme
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => toggleTheme("halloween")}
            className={`flex items-center gap-2 ${
              currentTheme === "halloween" ? "active" : ""
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
