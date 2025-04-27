"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Palette } from "lucide-react";

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<string>("whiteHalloween");

  useEffect(() => {
    // Get the theme from localStorage or use default
    const savedTheme = localStorage.getItem("theme") || "whiteHalloween";
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    document.body.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        {currentTheme === "halloween" ? (
          <Moon className="h-5 w-5" />
        ) : currentTheme === "whiteHalloween" ? (
          <Palette className="h-5 w-5 text-halloween-purple" />
        ) : (
          <Palette className="h-5 w-5 text-skool-primary" />
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
            onClick={() => toggleTheme("whiteHalloween")}
            className={`flex items-center gap-2 ${
              currentTheme === "whiteHalloween" ? "active" : ""
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-halloween-orange"></span>
            White Halloween
          </button>
        </li>
        <li>
          <button
            onClick={() => toggleTheme("skoolTheme")}
            className={`flex items-center gap-2 ${
              currentTheme === "skoolTheme" ? "active" : ""
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-skool-primary"></span>
            Skool UI Theme
          </button>
        </li>
        <li>
          <button
            onClick={() => toggleTheme("halloween")}
            className={`flex items-center gap-2 ${
              currentTheme === "halloween" ? "active" : ""
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-neutral"></span>
            Dark Halloween
          </button>
        </li>
      </ul>
    </div>
  );
}
