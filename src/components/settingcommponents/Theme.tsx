"use client";

import React, { ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "../ThemeProvider";

const themes = [
  { name: "Lofi", value: "lofi" },
  { name: "Forest", value: "forest" },
  { name: "Lemonade", value: "lemonade" },
];

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/theme", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(theme),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update theme");
      }

      setSuccess("Theme updated successfully");
      document.documentElement.setAttribute("data-theme", theme);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to update theme"
      );
    }
  };

  return (
    <div data-theme={theme} className="max-w-2xl mx-auto p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Theme Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="themeSelect"
            className="block text-sm font-medium mb-2"
          >
            Select Theme
          </label>
          <select
            id="themeSelect"
            value={theme}
            onChange={handleChange}
            className="select select-bordered w-full"
            aria-label="Select theme"
          >
            {themes.map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.name}
              </option>
            ))}
          </select>
        </div>
        <div className="p-4 rounded-lg bg-base-200">
          <div className="text-primary font-semibold">Preview Text</div>
          <button type="button" className="mt-2 px-4 py-2 btn btn-primary">
            Preview Button
          </button>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {success && (
          <div className="text-green-500 text-sm mt-2">{success}</div>
        )}
        <button
          type="submit"
          className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
        >
          Save Theme
        </button>
      </form>
    </div>
  );
}
