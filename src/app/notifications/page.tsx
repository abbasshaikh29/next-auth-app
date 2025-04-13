"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
// import { useSession } from "next-auth/react";

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.checked,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to update notification settings"
        );
      }

      setSuccess("Notification settings updated successfully");
    } catch (error) {
      console.error(error);
      setError("Failed to update notification settings");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notification Settings</h1>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      {success && <div className="mb-4 text-green-500">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="emailNotifications"
            name="emailNotifications"
            checked={settings.emailNotifications}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="emailNotifications" className="text-sm font-medium">
            Email Notifications
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="pushNotifications"
            name="pushNotifications"
            checked={settings.pushNotifications}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="pushNotifications" className="text-sm font-medium">
            Push Notifications
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="smsNotifications"
            name="smsNotifications"
            checked={settings.smsNotifications}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="smsNotifications" className="text-sm font-medium">
            SMS Notifications
          </label>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
