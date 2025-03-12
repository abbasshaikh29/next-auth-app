"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";

interface UserSettingsFormData {
  firstName: string;
  lastName: string;
  timezone: string;
  username: string;
  email: string;
  bio: string;
}

export default function UserSettings() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<UserSettingsFormData>({
    firstName: "",
    lastName: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    username: session?.user?.username || "",
    email: session?.user?.email || "",
    bio: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      alert("Settings updated successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to update settings");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-base-100 rounded-box shadow-lg">
      <h1 className="text-3xl font-bold mb-8">User Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label htmlFor="firstName" className="label">
              <span className="label-text">First Name</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Enter your first name"
            />
          </div>
          <div className="form-control">
            <label htmlFor="lastName" className="label">
              <span className="label-text">Last Name</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Enter your last name"
            />
          </div>
        </div>
        <div className="form-control">
          <label htmlFor="timezone" className="label">
            <span className="label-text">Timezone</span>
          </label>
          <select
            id="timezone"
            name="timezone"
            value={formData.timezone}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            {Intl.supportedValuesOf("timeZone").map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
        <div className="form-control">
          <label htmlFor="username" className="label">
            <span className="label-text">Username</span>
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="Enter your username"
          />
        </div>
        <div className="form-control">
          <label htmlFor="email" className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="Enter your email"
          />
        </div>
        <div className="form-control">
          <label htmlFor="bio" className="label">
            <span className="label-text">Bio</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="textarea textarea-bordered w-full"
            rows={4}
            placeholder="Tell us about yourself"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </form>
    </div>
  );
}
